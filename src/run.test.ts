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

test("scope", async () => {
  let source = outdent`
    var a = "global a";
    var b = "global b";
    var c = "global c";
    {
      var a = "outer a";
      var b = "outer b";
      {
        var a = "inner a";
        print a;
        print b;
        print c;
      }
      print a;
      print b;
      print c;
    }
    print a;
    print b;
    print c;
  `
  let output: Value[] = []
  await run(source, { print: (value) => output.push(value) })
  assertEquals(output.join("\n"), outdent`
    inner a
    outer b
    global c
    outer a
    outer b
    global c
    global a
    global b
    global c
  `)
})

test("control flow", async () => {
  let source = outdent`
    var a = 0;
    var temp;

    for (var b = 1; a < 10000; b = temp + b) {
      print a;
      temp = a;
      a = b;
    }
  `
  let output: Value[] = []
  await run(source, { print: (value) => output.push(value) })
  assertEquals(output.join("\n"), outdent`
    0
    1
    1
    2
    3
    5
    8
    13
    21
    34
    55
    89
    144
    233
    377
    610
    987
    1597
    2584
    4181
    6765
  `)
})
