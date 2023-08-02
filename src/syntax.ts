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

export type Stmt =
  | { type: "EXPRESSION", expr: Expr }
  | { type: "PRINT", expr: Expr }
