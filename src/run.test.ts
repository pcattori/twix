import { assertEquals } from "https://deno.land/std@0.196.0/assert/assert_equals.ts";
import outdent from "https://deno.land/x/outdent@v0.8.0/mod.ts";

import { run } from "./run.ts";
import { Value } from "./value.ts";

let {test} = Deno

test("print", async () => {
  let source = outdent`
    print "one";
    print true;
    print 2 + 1;
  `

  let output: Value[] = []
  await run(source, { print: (value) => output.push(value) })
  assertEquals(output.join("\n"), outdent`
    one
    true
    3
  `)
})

test("global variables", async () => {
  let source = outdent`
    var a = 1;
    var b = 2;
    print a + b;
  `

  let output: Value[] = []
  await run(source, { print: (value) => output.push(value) })
  assertEquals(output.join("\n"), "3")
})

test("assign", async () => {
  let source = outdent`
    var a = 1;
    print a = 2;
  `
  let output: Value[] = []
  await run(source, { print: (value) => output.push(value) })
  assertEquals(output.join("\n"), "2")
})
