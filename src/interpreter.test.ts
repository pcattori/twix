import { assertEquals } from "https://deno.land/std@0.196.0/assert/assert_equals.ts";

import { interpret } from "./interpreter.ts";

let {test} = Deno;

let location = {
  source: "",
  offset: -1,
  length: -1,
} as const

test("eval literal", async () => {
  assertEquals(
    await interpret({ type: "NUMBER", value: 1 }),
    1,
  )
  assertEquals(
    await interpret({ type: "STRING", value: "hello" }),
    "hello",
  )
  assertEquals(
    await interpret({ type: "BOOLEAN", value: true }),
    true,
  )
  assertEquals(
    await interpret({ type: "NIL" }),
    null,
  )
})

test("eval grouping", async () => {
  assertEquals(
    await interpret({
      type: "GROUPING",
      expr: { type: "NUMBER", value: 1 },
    }),
    1,
  )
})

test("eval unary", async () => {
  assertEquals(
    await interpret({
      type: "UNARY",
      op: { type: "MINUS", ...location },
      expr: { type: "NUMBER", value: 1 },
    }),
    -1,
  )

  assertEquals(
    await interpret({
      type: "UNARY",
      op: { type: "BANG", ...location },
      expr: { type: "BOOLEAN", value: false },
    }),
    true
  )
})

test("eval binary", async () => {
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: 1 },
      op: { type: "PLUS", ...location },
      right: { type: "NUMBER", value: 2 },
    }),
    3
  )
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: 3 },
      op: { type: "MINUS", ...location },
      right: { type: "NUMBER", value: 4 },
    }),
    -1
  )
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: 5.5 },
      op: { type: "STAR", ...location },
      right: { type: "NUMBER", value: 6 },
    }),
    33
  )
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: 7 },
      op: { type: "SLASH", ...location },
      right: { type: "NUMBER", value: 8 },
    }),
    0.875
  )
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: 0.1 },
      op: { type: "GREATER", ...location },
      right: { type: "NUMBER", value: 0.2 },
    }),
    false
  )
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: 0.4 },
      op: { type: "GREATER_EQUAL", ...location },
      right: { type: "NUMBER", value: 0.3 },
    }),
    true
  )
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: 0.1 },
      op: { type: "LESS", ...location },
      right: { type: "NUMBER", value: 0.2 },
    }),
    true
  )
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: 0.4 },
      op: { type: "LESS_EQUAL", ...location },
      right: { type: "NUMBER", value: 0.3 },
    }),
    false
  )

  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "STRING", value: "hello" },
      op: { type: "PLUS", ...location },
      right: { type: "STRING", value: "world" },
    }),
    "helloworld",
  )

  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "STRING", value: "hello" },
      op: { type: "EQUAL_EQUAL", ...location },
      right: { type: "STRING", value: "hello" },
    }),
    true,
  )
  assertEquals(
    await interpret({
      type: "BINARY",
      left: { type: "NUMBER", value: -1 },
      op: { type: "BANG_EQUAL", ...location },
      right: { type: "NUMBER", value: 5 },
    }),
    true,
  )
})
