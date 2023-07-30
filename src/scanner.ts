import { SyntaxErrs, type Err, SyntaxErr } from "./error.ts";
import { type Token, type Type } from "./token.ts";

export async function scan(source: string): Promise<Token[]> {
  let scanner = new Scanner(source)
  return scanner.scan()
}

class Scanner {
  start = 0
  current = 0
  source: string

  constructor(source: string) {
    this.source = source
  }

  async scan(): Promise<Token[]> {
    let tokens: Token[] = []
    let errors: Err[] = []

    let unexpected: {
      begin: number,
      end: number
    } | undefined = undefined

    while (!this.is_at_end()) {
      let type = await this.scan_type().catch(thrown => {
        if (!(thrown instanceof SyntaxErr)) throw thrown
        errors.push(thrown.error)
        return undefined
      })
      if (type === undefined) continue

      if (type.type === "UNKNOWN") {
        if (unexpected === undefined) {
          unexpected = { begin: this.start, end: this.current }
        } else {
          unexpected.end = this.current
        }
      } else if (unexpected !== undefined) {
        errors.push(this.unexpected(unexpected))
        unexpected = undefined
      }

      if (type.type !== "WHITESPACE" && type.type !== "COMMENT") {
        tokens.push(this.token(type))
      }

      this.start = this.current
    }

    if (unexpected !== undefined) {
        errors.push(this.unexpected(unexpected))
    }
    if (errors.length > 0) throw new SyntaxErrs(errors)

    tokens.push(this.token({ type: "EOF" }))
    return tokens
  }

  is_at_end() {
    return this.current >= this.source.length;
  }

  async scan_type(): Promise<Type> {
    let c = this.advance()
    switch (true) {
      case c === "(": return { type: "LEFT_PAREN" }
      case c === ")": return { type: "RIGHT_PAREN" }
      case c === "{": return { type: "LEFT_BRACE" }
      case c === "}": return { type: "RIGHT_BRACE" }
      case c === ",": return { type: "COMMA" }
      case c === ".": return { type: "DOT" }
      case c === "-": return { type: "MINUS" }
      case c === "+": return { type: "PLUS" }
      case c === ";": return { type: "SEMICOLON" }
      case c === "*": return { type: "STAR" }
      case c === "!": return this.match("=")
        ? { type: "BANG_EQUAL" }
        : { type: "BANG" }
      case c === "=": return this.match("=")
        ? { type: "EQUAL_EQUAL" }
        : { type: "EQUAL" }
      case c === "<": return this.match("=")
        ? { type: "LESS_EQUAL" }
        : { type: "LESS" }
      case c === ">": return this.match("=")
        ? { type: "GREATER_EQUAL" }
        : { type: "GREATER" }
      case c === "/": {
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() !== "\n" && !this.is_at_end()) this.advance()
          return { type: "COMMENT" }
        }
        return { type: "SLASH" }
      }
      case [' ', '\r', '\t', '\n'].includes(c): return { type: "WHITESPACE" }
      case c === '"': return this.string()
    }
    return { type: 'UNKNOWN' }
  }

  string(): Type {
    while (this.peek() !== '"' && !this.is_at_end()) {
      this.advance()
    }

    if (this.is_at_end()) {
      throw new SyntaxErr({
        source: this.source,
        offset: this.start,
        length: 1,
        message: "Unterminated string."
      })
    }

    this.advance()
    let value = this.source.substring(this.start + 1, this.current - 1)
    return { type: "STRING", value }
  }

  advance(): string {
    let c = this.source[this.current]
    this.current += 1
    return c
  }

  match(expected: string): boolean {
    if (this.is_at_end()) return false
    if (this.source[this.current] !== expected) return false
    this.current += 1
    return true
  }

  peek(): string {
    if (this.is_at_end()) return "\0"
    return this.source[this.current]
  }

  token(type: Type): Token {
    return Object.assign(type, {
      source: this.source,
      offset: this.start,
      length: this.current - this.start,
    })
  }

  unexpected(range: { begin: number, end: number}) {
    return {
      message: "Unexpected characters.",
      source: this.source,
      offset: range.begin,
      length: range.end - range.begin,
    }
  }
}
