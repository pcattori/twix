import { SyntaxErrs, RuntimeErr } from "./error.ts";

import { scan } from "./scanner.ts";
import { parse } from "./parser.ts";
import { Interpreter } from "./interpreter.ts";
import { Value } from "./value.ts";
import { Env } from "./env.ts";

export async function run(code: string, options: {
  env?: Env,
  print?: (value: Value) => void,
  onSyntaxErrs?: (errs: SyntaxErrs) => void,
  onRuntimeErr?: (err: RuntimeErr) => void,
} = {}) {
  let tokens = await scan(code).catch(thrown => {
    if (!(thrown instanceof SyntaxErrs)) throw thrown
    options.onSyntaxErrs?.(thrown)
    return null
  })
  if (tokens === null) return

  let stmts = await parse(tokens).catch(thrown => {
    if (!(thrown instanceof SyntaxErrs)) throw thrown
    options.onSyntaxErrs?.(thrown)
    return null
  })
  if (stmts === null) return

  let interpreter = new Interpreter({ env: options.env, print: options.print })
  await interpreter.interpret(stmts).catch(thrown => {
    if (!(thrown instanceof RuntimeErr)) throw thrown
    options.onRuntimeErr?.(thrown)
  })
}
