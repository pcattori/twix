import { Token } from "./token.ts";

type Literal =
  | { type: "Number", value: number }
  | { type: "String", value: string }
  | { type: "Boolean", value: boolean }
  | { type: "NIL" }

export type Expr =
  | Literal
  | { type: "GROUPING", expr: Expr }
  | { type: "UNARY", token: Token, expr: Expr  }
  | { type: "BINARY", left: Expr, op: Token, right: Expr }
