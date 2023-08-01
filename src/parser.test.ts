import { assertEquals } from "https://deno.land/std@0.196.0/assert/assert_equals.ts";
import { assertRejects } from "https://deno.land/std@0.196.0/assert/assert_rejects.ts";
import outdent from 'https://deno.land/x/outdent@v0.8.0/mod.ts';

import { scan } from "./scanner.ts";
import { parse } from "./parser.ts";
import { SyntaxErr } from "./error.ts";

let {test} = Deno;

test("parse binary", async () => {
  let source = "1 + 2;"
  let tokens = await scan(source)
  let expr = await parse(tokens)
  assertEquals(expr, {
    type: "BINARY",
    left: {
      type: "NUMBER",
      value: 1,
    },
    op: {
      source,
      offset: 2,
      length: 1,
      type: "PLUS",
    },
    right: {
      type: "NUMBER",
      value: 2,
    },
  })
})

test("parse unary", async () => {
  let source = "-1;"
  let tokens = await scan(source)
  let expr = await parse(tokens)
  assertEquals(expr, {
    type: "UNARY",
    op: {
      source,
      offset: 0,
      length: 1,
      type: "MINUS",
    },
    expr: {
      type: "NUMBER",
      value: 1,
    },
  })
})

test("parse grouping", async () => {
  let source = "((1));"
  let tokens = await scan(source)
  let expr = await parse(tokens)
  assertEquals(expr, {
    type: "GROUPING",
    expr: {
      type: "GROUPING",
      expr: {
        type: "NUMBER",
        value: 1,
      },
    },
  })
})

test("missing right paren", async () => {
  let source = "(1;"
  let tokens = await scan(source)
  assertRejects(() => parse(tokens), SyntaxErr, outdent`
    ERROR: Expect ')' after expression.

      1 | (1;
            ^
  `)
})
