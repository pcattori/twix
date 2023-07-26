import { Token } from "./token.ts";

export function scan(source: string): Token[] {
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

  scan(): Token[] {
    let tokens: Token[] = []
    while (!this.is_at_end()) {
      tokens.push(this.scan_token())
      this.start = this.current
    }
    tokens.push({ type: 'EOF', source: this.source, offset: this.current, length: 0 })

    return tokens
  }

  is_at_end() {
    return this.current >= this.source.length;
  }

  scan_token(): Token {
    throw Error("not implemented")
  }
}
