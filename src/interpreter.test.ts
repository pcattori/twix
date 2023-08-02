import { assertEquals } from "https://deno.land/std@0.196.0/assert/assert_equals.ts";

import { Interpreter } from "./interpreter.ts";

let {test} = Deno;

let location = {
  source: "",
  offset: -1,
  length: -1,
} as const

test("eval literal", async () => {
  let i = new Interpreter()
  assertEquals(
    i.eval({ type: "NUMBER", value: 1 }),
    1,
  )
  assertEquals(
    i.eval({ type: "STRING", value: "hello" }),
    "hello",
  )
  assertEquals(
    i.eval({ type: "BOOLEAN", value: true }),
    true,
  )
  assertEquals(
    i.eval({ type: "NIL" }),
    null,
  )
})

test("eval grouping", async () => {
  let i = new Interpreter()
  assertEquals(
    i.eval({
      type: "GROUPING",
      expr: { type: "NUMBER", value: 1 },
    }),
    1,
  )
})

test("eval unary", async () => {
  let i = new Interpreter()
  assertEquals(
    i.eval({
      type: "UNARY",
      op: { type: "MINUS", ...location },
      expr: { type: "NUMBER", value: 1 },
    }),
    -1,
  )

  assertEquals(
    i.eval({
      type: "UNARY",
      op: { type: "BANG", ...location },
      expr: { type: "BOOLEAN", value: false },
    }),
    true
  )
})

test("eval binary", async () => {
  let i = new Interpreter()
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: 1 },
      op: { type: "PLUS", ...location },
      right: { type: "NUMBER", value: 2 },
    }),
    3
  )
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: 3 },
      op: { type: "MINUS", ...location },
      right: { type: "NUMBER", value: 4 },
    }),
    -1
  )
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: 5.5 },
      op: { type: "STAR", ...location },
      right: { type: "NUMBER", value: 6 },
    }),
    33
  )
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: 7 },
      op: { type: "SLASH", ...location },
      right: { type: "NUMBER", value: 8 },
    }),
    0.875
  )
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: 0.1 },
      op: { type: "GREATER", ...location },
      right: { type: "NUMBER", value: 0.2 },
    }),
    false
  )
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: 0.4 },
      op: { type: "GREATER_EQUAL", ...location },
      right: { type: "NUMBER", value: 0.3 },
    }),
    true
  )
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: 0.1 },
      op: { type: "LESS", ...location },
      right: { type: "NUMBER", value: 0.2 },
    }),
    true
  )
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: 0.4 },
      op: { type: "LESS_EQUAL", ...location },
      right: { type: "NUMBER", value: 0.3 },
    }),
    false
  )

  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "STRING", value: "hello" },
      op: { type: "PLUS", ...location },
      right: { type: "STRING", value: "world" },
    }),
    "helloworld",
  )

  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "STRING", value: "hello" },
      op: { type: "EQUAL_EQUAL", ...location },
      right: { type: "STRING", value: "hello" },
    }),
    true,
  )
  assertEquals(
    i.eval({
      type: "BINARY",
      left: { type: "NUMBER", value: -1 },
      op: { type: "BANG_EQUAL", ...location },
      right: { type: "NUMBER", value: 5 },
    }),
    true,
  )
})
