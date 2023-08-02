import { RuntimeErr } from "./error.ts";
import { Token, lexeme } from "./token.ts";
import { Value } from "./value.ts";

export class Env {
  enclosing?: Env
  map: Map<string, Value> = new Map()

  constructor(enclosing?: Env) {
    this.enclosing = enclosing
  }

  define(name: string, value: Value) {
    this.map.set(name, value)
  }

  get(name: Token): Value {
    let identifier = lexeme(name)
    let value = this.map.get(identifier)
    if (value !== undefined) return value

    if (this.enclosing !== undefined) return this.enclosing.get(name)

    throw new RuntimeErr({
      ...name,
      message: `Undefined variable '${identifier}'.`
    })
  }

  assign(name: Token, value: Value) {
    let identifier = lexeme(name)
    if (this.map.has(identifier)) {
      this.map.set(identifier, value)
      return
    }

    if (this.enclosing !== undefined) {
      this.enclosing.assign(name, value)
      return
    }

    throw new RuntimeErr({
      ...name,
      message: `Undefined variable '${name}'.`
    })
  }
}
