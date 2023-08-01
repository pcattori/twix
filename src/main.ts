import { RuntimeErr, SyntaxErr, SyntaxErrs } from "./error.ts";
import { interpret } from "./interpreter.ts";
import { parse } from "./parser.ts";
import { scan } from "./scanner.ts";

let { args } = Deno

if (args.length === 0) {
  repl()
} else if (args.length === 1) {
  run(args[0])
} else {
  console.log("Usage: twix [script]")
  Deno.exit(64)
}

async function repl() {
  while (true) {
    let line = prompt("> ")
    if (line === null) break

    let tokens = await scan(line).catch(thrown => {
      if (!(thrown instanceof SyntaxErrs)) throw thrown
      console.error("\n" + thrown.message + "\n")
      return undefined
    })
    if (tokens === undefined) continue

    let expr = await parse(tokens).catch(thrown => {
      if (!(thrown instanceof SyntaxErr)) throw thrown
      console.error("\n" + thrown.message + "\n")
      return undefined
    })
    if (expr === undefined) continue

    let value = await interpret(expr).catch(thrown => {
      if (!(thrown instanceof RuntimeErr)) throw thrown
      console.error("\n" + thrown.message + "\n")
      return undefined
    })
    if (value === undefined) continue

    console.log(value)
  }
}

async function run(file: string) {
  let source = await Deno.readTextFile(file)
  let tokens = await scan(source).catch(thrown => {
      if (!(thrown instanceof SyntaxErrs)) throw thrown
      console.error("\n" + thrown.message + "\n")
      Deno.exit(65)
  })

  let expr = await parse(tokens).catch(thrown => {
      if (!(thrown instanceof SyntaxErrs)) throw thrown
      console.error("\n" + thrown.message + "\n")
      Deno.exit(65)
  })

  let value = interpret(expr).catch(thrown => {
    if (!(thrown instanceof RuntimeErr)) throw thrown
    console.error("\n" + thrown.message + "\n")
    Deno.exit(70)
  })
  console.log(value)
}
