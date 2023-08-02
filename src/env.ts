import { RuntimeErr } from "./error.ts";
import { Token, lexeme } from "./token.ts";
import { Value } from "./value.ts";

export class Env {
  map: Map<string, Value> = new Map()

  define(name: string, value: Value) {
    this.map.set(name, value)
  }

  get(name: Token): Value {
    let identifier = lexeme(name)
    let value = this.map.get(identifier)
    if (value !== undefined) return value

    throw new RuntimeErr({
      ...name,
      message: `Undefined variable '${identifier}'.`
    })
  }
}
