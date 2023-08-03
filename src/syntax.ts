import { Token } from "./token.ts";

type Literal =
  | { type: "NUMBER", value: number }
  | { type: "STRING", value: string }
  | { type: "BOOLEAN", value: boolean }
  | { type: "NIL" }

export type Expr =
  | Literal
  | { type: "GROUPING", expr: Expr }
  | { type: "UNARY", op: Token, expr: Expr  }
  | { type: "BINARY", left: Expr, op: Token, right: Expr }
  | { type: "VARIABLE", name: Token }
  | { type: "ASSIGN", name: Token, value: Expr }
  | { type: "LOGICAL", left: Expr, op: Token, right: Expr }

export type Stmt =
  | { type: "EXPRESSION", expr: Expr }
  | { type: "PRINT", expr: Expr }
  | { type: "VAR", name: Token, initializer?: Expr }
  | { type: "BLOCK", stmts: Stmt[] }
  | { type: "IF", condition: Expr, then_branch: Stmt, else_branch?: Stmt }
