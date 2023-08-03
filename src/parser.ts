import { Err, SyntaxErr, SyntaxErrs } from "./error.ts";
import { Expr, Stmt } from "./syntax.ts";
import { Token } from "./token.ts";

export async function parse(tokens: Token[]): Promise<Stmt[]> {
  let parser = new Parser(tokens)
  return parser.parse()
}

class Parser {
  tokens: Token[]
  current = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): Stmt[] {
    let stmts: Stmt[] = []
    let errs: Err[] = []

    while (!this.is_at_end()) {
      try {
        stmts.push(this.declaration())
      } catch (thrown) {
        if (!(thrown instanceof SyntaxErr)) throw thrown
        errs.push(thrown.error)
        this.synchronize()
      }
    }
    if (errs.length > 0) throw new SyntaxErrs(errs)
    return stmts
  }

  declaration(): Stmt {
    if (this.peek().type === "VAR") {
      this.advance()
      return this.var_declaration()
    }
    return this.statement()
  }

  var_declaration(): Stmt {
    let name = this.consume("IDENTIFIER", "Expect variable name.")

    let initializer: Expr | undefined
    if (this.peek().type === "EQUAL") {
      this.advance()
      initializer = this.expression()
    }

    this.consume("SEMICOLON", "Expect ';' after variable declaration.")
    return { type: "VAR", name, initializer }
  }

  statement(): Stmt {
    let token = this.peek()
    if (token.type === "IF") {
      this.advance()
      return this.if_statement()
    }
    if (token.type === "PRINT") {
      this.advance()
      return this.print_statement()
    }
    if (token.type === "LEFT_BRACE") {
      this.advance()
      return this.block()
    }
    return this.expression_statement()
  }

  if_statement(): Stmt {
    this.consume("LEFT_PAREN", "Expect '(' after 'if'.")
    let condition = this.expression()
    this.consume("RIGHT_PAREN", "Expect ')' after if condition.")

    let then_branch = this.statement()
    let else_branch: Stmt | undefined
    if (this.peek().type === "ELSE") {
      this.advance()
      else_branch = this.statement()
    }

    return { type: "IF", condition, then_branch, else_branch }
  }

  print_statement(): Stmt {
    let expr = this.expression()
    this.consume("SEMICOLON", "Expect ';' after value.")
    return { type: "PRINT", expr }
  }

  block(): Stmt {
    let stmts: Stmt[] = []

    while (this.peek().type !== "RIGHT_BRACE" && !this.is_at_end()) {
      stmts.push(this.declaration())
    }

    this.consume("RIGHT_BRACE", "Expect '}' after block.")
    return { type: "BLOCK", stmts }
  }

  expression_statement(): Stmt {
    let expr = this.expression()
    this.consume("SEMICOLON", "Expect ';' after value.")
    return { type: "EXPRESSION", expr }
  }

  expression(): Expr {
    return this.assignment()
  }

  assignment(): Expr {
    let expr = this.equality()

    let equals = this.peek()
    if (equals.type === "EQUAL") {
      this.advance()
      let value = this.assignment()

      if (expr.type !== "VARIABLE") {
        throw new SyntaxErr({...equals, message: "Invalid assignment target."})
      }
      return { type: "ASSIGN", name: expr.name, value }
    }

    return expr
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
    if (token.type === "IDENTIFIER") expr = { type: "VARIABLE", name: token }

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

  synchronize() {
    let token = this.advance()

    while (!this.is_at_end()) {
      if (token.type === "SEMICOLON") return

      if ([
        "CLASS",
        "FUN",
        "VAR",
        "FOR",
        "IF",
        "WHILE",
        "PRINT",
        "RETURN",
      ].includes(token.type)) return

      token = this.advance()
    }
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
