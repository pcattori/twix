import { assertEquals } from "https://deno.land/std@0.196.0/assert/assert_equals.ts";
import outdent from 'https://deno.land/x/outdent@v0.8.0/mod.ts';

import { scan } from "./scanner.ts";
import { SyntaxErrs } from "./error.ts";

let {test} = Deno;

test("unexpected characters", async () => {
  let source = "@#"

  await scan(source).catch(thrown => {
    if (!(thrown instanceof SyntaxErrs)) throw thrown
    assertEquals(thrown.errors.length, 1)
    assertEquals(thrown.message, outdent`
      ERROR: Unexpected characters.

        1 | @#
            ^^
    `)
  })
})

test("single character tokens", async () => {
  let source = "(){},.-+;*"
  let tokens = await scan(source)
  assertEquals(tokens, [
    { source, type: 'LEFT_PAREN', offset: 0, length: 1 },
    { source, type: 'RIGHT_PAREN', offset: 1, length: 1 },
    { source, type: 'LEFT_BRACE', offset: 2, length: 1 },
    { source, type: 'RIGHT_BRACE', offset: 3, length: 1 },
    { source, type: 'COMMA', offset: 4, length: 1 },
    { source, type: 'DOT', offset: 5, length: 1 },
    { source, type: 'MINUS', offset: 6, length: 1 },
    { source, type: 'PLUS', offset: 7, length: 1 },
    { source, type: 'SEMICOLON', offset: 8, length: 1 },
    { source, type: 'STAR', offset: 9, length: 1 },
    { source, type: 'EOF', offset: source.length, length: 0 }
  ])
})

test("ignore whitespace", async () => {
  let source = "( \t\n\r)"
  let tokens = await scan(source)
  assertEquals(tokens, [
    { source, type: 'LEFT_PAREN', offset: 0, length: 1 },
    { source, type: 'RIGHT_PAREN', offset: 5, length: 1 },
    { source, type: 'EOF', offset: source.length, length: 0 }
  ])
})

test("operators", async () => {
  let source = "! != = == > >= < <="

  let tokens = await scan(source)
  assertEquals(tokens, [
    { source, type: 'BANG', offset: 0, length: 1 },
    { source, type: 'BANG_EQUAL', offset: 2, length: 2 },
    { source, type: 'EQUAL', offset: 5, length: 1 },
    { source, type: 'EQUAL_EQUAL', offset: 7, length: 2 },
    { source, type: 'GREATER', offset: 10, length: 1 },
    { source, type: 'GREATER_EQUAL', offset: 12, length: 2 },
    { source, type: 'LESS', offset: 15, length: 1 },
    { source, type: 'LESS_EQUAL', offset: 17, length: 2 },
    { source, type: 'EOF', offset: source.length, length: 0 }
  ])
})

test("slash", async () => {
  let source = "/ // 1\n// 2\n/"
  let tokens = await scan(source)
  assertEquals(tokens, [
    { source, type: 'SLASH', offset: 0, length: 1 },
    { source, type: 'SLASH', offset: 12, length: 1 },
    { source, type: 'EOF', offset: source.length, length: 0 },
  ])
})

test("string", async () => {
  let source = `"hello" + "world"`
  let tokens = await scan(source)
  assertEquals(tokens, [
    { source, type: 'STRING', offset: 0, length: 7, value: "hello" },
    { source, type: 'PLUS', offset: 8, length: 1 },
    { source, type: 'STRING', offset: 10, length: 7, value: "world" },
    { source, type: 'EOF', offset: source.length, length: 0 }
  ])
})

test("unterminated string", async () => {
  let source = `"terminated"\n"unterminated\nhello, world\n!`
  await scan(source).catch(thrown => {
    if (!(thrown instanceof SyntaxErrs)) throw thrown
    assertEquals(thrown.errors.length, 1)
    assertEquals(thrown.message, outdent`
      ERROR: Unterminated string.

        2 | "unterminated
            ^
    `)
  })
})

test("number", async () => {
  let source = "1234 56.78 9.0"
  let tokens = await scan(source)
  assertEquals(tokens, [
    { source, type: 'NUMBER', offset: 0, length: 4, value: 1234 },
    { source, type: 'NUMBER', offset: 5, length: 5, value: 56.78 },
    { source, type: 'NUMBER', offset: 11, length: 3, value: 9 },
    { source, type: 'EOF', offset: source.length, length: 0 }
  ])
})
