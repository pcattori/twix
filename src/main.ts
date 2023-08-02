import { run } from "./run.ts";

let { args } = Deno

if (args.length === 0) {
  repl()
} else if (args.length === 1) {
  file(args[0])
} else {
  console.log("Usage: twix [script]")
  Deno.exit(64)
}

async function repl() {
  while (true) {
    let line = prompt("> ")
    if (line === null) break

    await run(line, {
      onSyntaxErrs: (errs) => console.error("\n" + errs.message + "\n"),
      onRuntimeErr: (err) => console.error("\n" + err.message + "\n"),
    })
  }
}

async function file(path: string) {
  let source = await Deno.readTextFile(path)
  await run(source, {
    onSyntaxErrs: (errs) => {
      console.error("\n" + errs.message + "\n")
      Deno.exit(65)
    },
    onRuntimeErr: (err) => {
      console.error("\n" + err.message + "\n")
      Deno.exit(70)
    },
  })
}
