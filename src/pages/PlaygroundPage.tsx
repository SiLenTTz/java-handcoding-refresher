import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { isTrackId, trackById, type TrackId } from '../content'
import { update, useProgress } from '../lib/progress'
import { runCode, type RunResponse } from '../lib/api'
import { CodeEditor } from '../components/CodeEditor'
import { RunResult } from '../components/RunResult'
import { Button, PageHeader } from '../components/ui'

/** Each snippet is a complete program – the learner writes their own entry point. */
const EXAMPLES: Record<TrackId, string> = {
  java: `public class Main {
    public static void main(String[] args) {
        var users = List.of(
            new User("Ada", "UK", true),
            new User("Linus", "FI", false),
            new User("Jan", "DE", true)
        );

        Map<String, List<String>> activeByCountry = users.stream()
            .filter(User::active)
            .collect(Collectors.groupingBy(User::country,
                Collectors.mapping(User::name, Collectors.toList())));

        System.out.println(activeByCountry);
    }
}

record User(String name, String country, boolean active) {}
`,
  python: `from dataclasses import dataclass


@dataclass(frozen=True)
class User:
    name: str
    country: str
    active: bool


users = [
    User("Ada", "UK", True),
    User("Linus", "FI", False),
    User("Jan", "DE", True),
]

active_by_country: dict[str, list[str]] = {}
for user in users:
    if user.active:
        active_by_country.setdefault(user.country, []).append(user.name)

print(active_by_country)
`,
  typescript: `interface User {
  name: string
  country: string
  active: boolean
}

const users: User[] = [
  { name: 'Ada', country: 'UK', active: true },
  { name: 'Linus', country: 'FI', active: false },
  { name: 'Jan', country: 'DE', active: true },
]

const activeByCountry = new Map<string, string[]>()
for (const user of users.filter((u) => u.active)) {
  activeByCountry.set(user.country, [...(activeByCountry.get(user.country) ?? []), user.name])
}

console.log(Object.fromEntries(activeByCountry))
`,
  go: `package main

import "fmt"

type User struct {
	Name    string
	Country string
	Active  bool
}

func main() {
	users := []User{
		{"Ada", "UK", true},
		{"Linus", "FI", false},
		{"Jan", "DE", true},
	}

	activeByCountry := map[string][]string{}
	for _, u := range users {
		if u.Active {
			activeByCountry[u.Country] = append(activeByCountry[u.Country], u.Name)
		}
	}

	fmt.Println(activeByCountry)
}
`,
  rust: `use std::collections::HashMap;

struct User {
    name: &'static str,
    country: &'static str,
    active: bool,
}

fn main() {
    let users = vec![
        User { name: "Ada", country: "UK", active: true },
        User { name: "Linus", country: "FI", active: false },
        User { name: "Jan", country: "DE", active: true },
    ];

    let mut active_by_country: HashMap<&str, Vec<&str>> = HashMap::new();
    for user in users.iter().filter(|u| u.active) {
        active_by_country.entry(user.country).or_default().push(user.name);
    }

    println!("{:?}", active_by_country);
}
`,
  csharp: `using System;
using System.Collections.Generic;
using System.Linq;

public record User(string Name, string Country, bool Active);

public static class Program
{
    public static void Main()
    {
        var users = new List<User>
        {
            new("Ada", "UK", true),
            new("Linus", "FI", false),
            new("Jan", "DE", true),
        };

        var activeByCountry = users
            .Where(u => u.Active)
            .GroupBy(u => u.Country)
            .ToDictionary(g => g.Key, g => g.Select(u => u.Name).ToList());

        foreach (var (country, names) in activeByCountry)
        {
            Console.WriteLine($"{country}: {string.Join(", ", names)}");
        }
    }
}
`,
}

export function PlaygroundPage() {
  const { track = '' } = useParams()
  if (!isTrackId(track)) return <Navigate to="/tracks" replace />
  // Remount per track so the editor picks up the right example and saved code.
  return <PlaygroundView key={track} track={track} />
}

function PlaygroundView({ track }: { track: TrackId }) {
  const p = useProgress()
  const trackData = trackById.get(track)!
  const example = EXAMPLES[track]
  const [code, setCode] = useState(p.playground[track] || example)
  const [result, setResult] = useState<RunResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const codeRef = useRef(code)
  codeRef.current = code

  useEffect(() => {
    const t = setTimeout(() => update((d) => void (d.playground[track] = code), { activity: false }), 600)
    return () => clearTimeout(t)
  }, [code, track])

  const run = useCallback(async () => {
    setRunning(true)
    setError(null)
    try {
      setResult(await runCode({ language: track, code: codeRef.current }))
    } catch (e) {
      setError(String(e))
    } finally {
      setRunning(false)
    }
  }, [track])

  return (
    <div>
      <PageHeader
        title={`${trackData.icon} Playground`}
        subtitle={`Freies ${trackData.label}. Dein Code läuft als eigenständiges Programm – schreib deinen eigenen Einstiegspunkt.`}
        actions={
          <>
            <Button variant="ghost" onClick={() => confirm('Beispielcode laden?') && setCode(example)}>
              ↺ Beispiel
            </Button>
            <Button variant="primary" onClick={run} disabled={running}>
              {running ? '⏳ Läuft…' : '▶ Ausführen'} <kbd className="hidden text-xs opacity-60 sm:inline">⌘↵</kbd>
            </Button>
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[3fr_2fr]">
        <div className="min-w-0">
          <CodeEditor value={code} language={track} onChange={setCode} onRun={run} minHeight="clamp(280px,55vh,600px)" />
        </div>
        <div className="min-w-0">
          <RunResult result={result} error={error} />
        </div>
      </div>
    </div>
  )
}
