import { assertEquals } from "https://deno.land/std@0.196.0/assert/assert_equals.ts";
import outdent from 'https://deno.land/x/outdent@v0.8.0/mod.ts';

import { scan } from "./scanner.ts";
import { type Token} from "./token.ts";
import { SyntaxErrors } from "./error.ts";

let {test} = Deno;

test("unexpected characters", async () => {
  let source = "@#"

  await scan(source).catch(thrown => {
    if (!(thrown instanceof SyntaxErrors)) throw thrown
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

  let expected_tokens: Token[] = ([
    'LEFT_PAREN',
    'RIGHT_PAREN',
    'LEFT_BRACE',
    'RIGHT_BRACE',
    'COMMA',
    'DOT',
    'MINUS',
    'PLUS',
    'SEMICOLON',
    'STAR',
    'EOF'
  ] as const).map((type, i) => ({ source, type, offset: i, length: i === source.length ? 0 : 1}))

  let tokens = await scan(source)
  tokens.forEach((actual, i) => {
    let expected = expected_tokens[i]
    assertEquals(actual, expected)
  })
  assertEquals(tokens.length, source.length + 1)
})
