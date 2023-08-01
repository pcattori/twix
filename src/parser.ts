import { SyntaxErr } from "./error.ts";
import { Expr } from "./expr.ts";
import { Token } from "./token.ts";

export async function parse(tokens: Token[]): Promise<Expr> {
  let parser = new Parser(tokens)
  return parser.parse()
}

class Parser {
  tokens: Token[]
  current = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): Expr {
    return this.expression()
  }

  expression(): Expr {
    return this.equality()
  }

  equality(): Expr {
    let expr = this.comparison()

    while (["BANG_EQUAL", "EQUAL_EQUAL"].includes(this.peek().type)) {
      let op = this.advance()
      let right = this.comparison()
      expr = { type: "BINARY", left: expr, op, right }
    }

    return expr
  }

  comparison(): Expr {
    let expr = this.term()

    while (["GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL"].includes(this.peek().type)) {
      let op = this.advance()
      let right = this.term()
      expr = { type: "BINARY", left: expr, op, right }
    }

    return expr
  }

  term(): Expr {
    let expr = this.factor()

    while (["MINUS", "PLUS"].includes(this.peek().type)) {
      let op = this.advance()
      let right = this.factor()
      expr = { type: "BINARY", left: expr, op, right }
    }

    return expr
  }

  factor(): Expr {
    let expr = this.unary()

    while (["SLASH", "STAR"].includes(this.peek().type)) {
      let op = this.advance()
      let right = this.unary()
      expr = { type: "BINARY", left: expr, op, right }
    }

    return expr
  }

  unary(): Expr {
    if (["BANG", "MINUS"].includes(this.peek().type)) {
      let op = this.advance()
      let expr = this.unary()
      return { type: "UNARY", op, expr }
    }

    return this.primary()
  }

  primary(): Expr {
    let expr: Expr | undefined
    let token = this.peek()
    if (token.type === "FALSE") expr = { type: "BOOLEAN", value: false }
    if (token.type === "TRUE") expr = { type: "BOOLEAN", value: true }
    if (token.type === "NIL") expr = { type: "NIL" }
    if (token.type === "NUMBER") expr = { type: "NUMBER", value: token.value }
    if (token.type === "STRING") expr = { type: "STRING", value: token.value }

    if (expr) {
      this.advance()
      return expr
    }

    if (token.type === "LEFT_PAREN") {
      this.advance()
      let expr = this.expression()
      this.consume("RIGHT_PAREN", "Expect ')' after expression.")
      return { type: "GROUPING", expr }
    }

    throw new SyntaxErr({
      source: token.source,
      offset: token.offset,
      length: token.length,
      message: "Expect expression."
    })
  }

  advance(): Token {
    if (!this.is_at_end()) this.current += 1
    return this.tokens[this.current - 1]
  }

  is_at_end(): boolean {
    return this.peek().type == "EOF"
  }

  peek(): Token {
    return this.tokens[this.current]
  }

  consume(type: Token['type'], message: string): Token {
    let token = this.advance()
    if (token.type !== type) {
      throw new SyntaxErr({
        source: token.source,
        offset: token.offset,
        length: token.length,
        message,
      })
    }
    return token
  }
}
