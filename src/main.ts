let { args } = Deno

if (args.length === 0) {
  repl()
} else if (args.length === 1) {
  run(args[0])
} else {
  console.log("Usage: twix [script]")
  Deno.exit(64)
}

function repl() {
  while (true) {
    let line = prompt("> ")
    if (line === null) break
    console.log(line)
  }
}

async function run(file: string) {
  let source = await Deno.readTextFile(file)
  console.log(source)
}
