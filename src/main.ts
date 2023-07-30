import { SyntaxErrs } from "./error.ts";
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
      console.log("\n" + thrown.message + "\n")
    })

    console.log(tokens)
  }
}

async function run(file: string) {
  let source = await Deno.readTextFile(file)
  let tokens = scan(source)
  console.log(tokens)
}
