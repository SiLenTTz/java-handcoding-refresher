import { execFile } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { LangAdapter, Prepared, RunRequest } from '../runner'

const run = promisify(execFile)

let cachedFramework: string | null = null

/** The installed SDK decides the target framework, otherwise restore fails. */
async function targetFramework(): Promise<string> {
  if (cachedFramework) return cachedFramework
  try {
    const { stdout } = await run('dotnet', ['--version'])
    const major = Number(stdout.trim().split('.')[0])
    cachedFramework = Number.isFinite(major) ? `net${major}.0` : 'net8.0'
  } catch {
    cachedFramework = 'net8.0'
  }
  return cachedFramework
}

const PREAMBLE = `using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using static Harness;

public static class Harness
{
    public static int Passed;
    public static int Failed;

    public static void Pass(string name)
    {
        Passed++;
        Console.WriteLine("@@PASS " + name);
    }

    public static void Fail(string name, string message)
    {
        Failed++;
        Console.WriteLine("@@FAIL " + name + " :: " + message);
    }

    public static string Show(object? value)
    {
        if (value is null) return "null";
        if (value is string s) return "\\"" + s + "\\"";
        if (value is IDictionary dict)
        {
            var parts = new List<string>();
            foreach (DictionaryEntry e in dict) parts.Add(Show(e.Key) + "=" + Show(e.Value));
            return "{" + string.Join(", ", parts) + "}";
        }
        if (value is IEnumerable seq)
        {
            var parts = new List<string>();
            foreach (var item in seq) parts.Add(Show(item));
            return "[" + string.Join(", ", parts) + "]";
        }
        return Convert.ToString(value, CultureInfo.InvariantCulture) ?? value.ToString() ?? "null";
    }

    public static bool AreEqual(object? a, object? b)
    {
        if (Equals(a, b)) return true;
        if (a is null || b is null) return false;
        if (a is IDictionary da && b is IDictionary db)
        {
            if (da.Count != db.Count) return false;
            foreach (DictionaryEntry e in da)
            {
                if (!db.Contains(e.Key) || !AreEqual(e.Value, db[e.Key])) return false;
            }
            return true;
        }
        if (a is IEnumerable ea && a is not string && b is IEnumerable eb && b is not string)
        {
            var la = ea.Cast<object?>().ToList();
            var lb = eb.Cast<object?>().ToList();
            return la.Count == lb.Count && la.Zip(lb).All(p => AreEqual(p.First, p.Second));
        }
        return false;
    }

    public static void Check(string name, object? expected, object? actual)
    {
        if (AreEqual(expected, actual)) Pass(name);
        else Fail(name, "erwartet <" + Show(expected) + "> aber war <" + Show(actual) + ">");
    }

    public static void CheckTrue(string name, bool condition)
    {
        if (condition) Pass(name);
        else Fail(name, "Bedingung nicht erfüllt");
    }

    public static void CheckThrows<T>(string name, Action action) where T : Exception
    {
        try
        {
            action();
            Fail(name, "erwartet " + typeof(T).Name + ", aber nichts geworfen");
        }
        catch (Exception ex)
        {
            if (ex is T) Pass(name);
            else Fail(name, "erwartet " + typeof(T).Name + " aber war " + ex.GetType().Name);
        }
    }

    public static void PrintResult() => Console.WriteLine("@@RESULT " + Passed + "/" + (Passed + Failed));
}
`

const USER_MARKER = '// ---- learner code ----'

const USING_RE = /^using\s+(?:static\s+)?[\w.<>, =]+;[ \t]*$/gm

/** C# requires every using directive before the first type declaration. */
function hoistUsings(source: string): { usings: string[]; body: string } {
  const usings = source.match(USING_RE)?.map((l) => l.trim()) ?? []
  return { usings, body: source.replace(USING_RE, '') }
}

export function assembleCSharp(req: RunRequest): string {
  const user = hoistUsings(req.code)
  const given = hoistUsings(req.given ?? '')
  const extra = [...new Set([...user.usings, ...given.usings])].join('\n')

  if (!req.tests) {
    return `${extra}\n${user.body}\n\n${given.body}\n`
  }
  return `${extra}
${PREAMBLE}
// ---- given ----
${given.body}

${USER_MARKER}
${user.body}

public static class Program
{
    public static void Main()
    {
        try
        {
${req.tests}
        }
        catch (Exception __ex)
        {
            Fail("Exception", __ex.GetType().Name + ": " + __ex.Message);
        }
        PrintResult();
    }
}
`
}

export const csharpAdapter: LangAdapter = {
  id: 'csharp',
  label: 'C# / .NET',
  probe: { cmd: 'dotnet', args: ['--version'] },
  install: 'brew install dotnet',
  async prepare(dir, req): Promise<Prepared> {
    const source = assembleCSharp(req)
    const framework = await targetFramework()
    await writeFile(join(dir, 'Program.cs'), source, 'utf8')
    await writeFile(
      join(dir, 'kata.csproj'),
      `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>${framework}</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>disable</ImplicitUsings>
    <LangVersion>latest</LangVersion>
    <InvariantGlobalization>true</InvariantGlobalization>
    <GenerateDocumentationFile>false</GenerateDocumentationFile>
  </PropertyGroup>
</Project>
`,
      'utf8',
    )
    return {
      compile: { cmd: 'dotnet', args: ['build', '-v', 'q', '--nologo', '-o', 'out'] },
      run: { cmd: 'dotnet', args: [join(dir, 'out', 'kata.dll')] },
      mainFile: 'Program.cs',
      userOffset: source.split('\n').indexOf(USER_MARKER) + 1,
      timeoutMs: 120_000,
      env: { DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_NOLOGO: '1', DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1' },
    }
  },
}
