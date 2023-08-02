import { Env } from "./env.ts";
import { RuntimeErr } from "./error.ts";
import { Expr, Stmt } from "./syntax.ts";
import { Token, lexeme } from "./token.ts";
import { Value, is_equal, is_truthy } from "./value.ts";

type Print = (value: Value) => void

export class Interpreter {
  env: Env
  print: Print

  constructor(options: {
    env?: Env,
    print?: Print,
  } = {}) {
    this.env = options.env ?? new Env()
    this.print = options.print ?? console.log
  }

  async interpret(stmts: Stmt[]) {
    for (let stmt of stmts) {
      this.exec(stmt)
    }
  }

  exec(stmt: Stmt) {
    if (stmt.type === "EXPRESSION") return this.eval(stmt.expr)
    if (stmt.type === "PRINT") {
      let val = this.eval(stmt.expr)
      this.print(val)
    }
    if (stmt.type === "VAR") {
      let value = stmt.initializer !== undefined ? this.eval(stmt.initializer) : null
      this.env.define(lexeme(stmt.name), value)
    }
    if (stmt.type === "BLOCK") this.exec_block(stmt.stmts)
  }

  exec_block(stmts: Stmt[]) {
    let enclosing = this.env
    try {
      this.env = new Env(enclosing)
      for (let stmt of stmts) {
        this.exec(stmt)
      }
    } finally {
      this.env = enclosing
    }
  }

  eval(expr: Expr): Value {
    if (expr.type === "NUMBER") return expr.value
    if (expr.type === "STRING") return expr.value
    if (expr.type === "BOOLEAN") return expr.value
    if (expr.type === "NIL") return null

    if (expr.type === "GROUPING") return this.eval_grouping(expr.expr)
    if (expr.type === "UNARY") return this.eval_unary(expr.op, expr.expr)
    if (expr.type === "BINARY") return this.eval_binary(expr.left, expr.op, expr.right)
    if (expr.type === "VARIABLE") return this.env.get(expr.name)
    if (expr.type === "ASSIGN") return this.eval_assign(expr.name, expr.value)

    // unreachable
    return null
  }

  eval_assign(name: Token, value: Expr): Value {
    let val = this.eval(value)
    this.env.assign(name, val)
    return val
  }

  eval_grouping(expr: Expr): Value {
    return this.eval(expr)
  }

  eval_unary(op: Token, expr: Expr): Value {
    let val = this.eval(expr)

    if (op.type === "MINUS") {
      if (typeof val !== 'number') throw new RuntimeErr({
        ...op,
        message: "Operand must be a number."
      })
      return -val
    }

    if (op.type === "BANG") return !is_truthy(val)

    // unreachable
    return null
  }

  eval_binary(left: Expr, op: Token, right: Expr): Value {
    let left_val = this.eval(left)
    let right_val = this.eval(right)

    if (op.type === "BANG_EQUAL") return !is_equal(left_val, right_val)
    if (op.type === "EQUAL_EQUAL") return is_equal(left_val, right_val)

    if (op.type === "PLUS") {
      if (typeof left_val === 'number' && typeof right_val === 'number') return left_val + right_val
      if (typeof left_val === 'string' && typeof right_val === 'string') return left_val + right_val
      throw new RuntimeErr({
        ...op,
        message: "Operands must be two numbers or two strings."
      })
    }

    // aritcmetic
    if (typeof left_val !== 'number' || typeof right_val !== 'number') throw new RuntimeErr({
      ...op,
      message: "Operands must be numbers."
    })
    if (op.type === "MINUS") return left_val - right_val
    if (op.type === "SLASH") return left_val / right_val
    if (op.type === "STAR") return left_val * right_val
    if (op.type === "GREATER") return left_val > right_val
    if (op.type === "GREATER_EQUAL") return left_val >= right_val
    if (op.type === "LESS") return left_val < right_val
    if (op.type === "LESS_EQUAL") return left_val <= right_val

    // unreachable
    return null
  }
}
