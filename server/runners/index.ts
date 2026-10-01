import { register } from '../runner'
import { javaAdapter } from './java'
import { pythonAdapter } from './python'
import { typescriptAdapter } from './typescript'
import { goAdapter } from './go'
import { rustAdapter } from './rust'
import { csharpAdapter } from './csharp'

for (const adapter of [javaAdapter, pythonAdapter, typescriptAdapter, goAdapter, rustAdapter, csharpAdapter]) {
  register(adapter)
}

export { runCode, availableLanguages, isAvailable, LANGUAGES } from '../runner'
export type { LanguageId, RunRequest, RunResponse, TestResult } from '../runner'
