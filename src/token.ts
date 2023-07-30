export type Location = {
  source: string
  offset: number
  length: number
}

export function lexeme(loc: Location): string {
  return loc.source.slice(loc.offset, loc.offset + loc.length)
}

export type Type =
  // single character tokens
  | { type: 'LEFT_PAREN'}
  | { type: 'RIGHT_PAREN'}
  | { type: 'LEFT_BRACE' }
  | { type: 'RIGHT_BRACE' }
  | { type: 'COMMA' }
  | { type: 'DOT' }
  | { type: 'MINUS' }
  | { type: 'PLUS' }
  | { type: 'SEMICOLON' }
  | { type: 'SLASH' }
  | { type: 'STAR' }
  // one or two character tokens
  | { type: 'BANG' }
  | { type: 'BANG_EQUAL' }
  | { type: 'EQUAL' }
  | { type: 'EQUAL_EQUAL' }
  | { type: 'GREATER' }
  | { type: 'GREATER_EQUAL' }
  | { type: 'LESS' }
  | { type: 'LESS_EQUAL' }
  // literals
  | { type: 'STRING', value: string }
  | { type: 'NUMBER', value: number }
  // keywords
  | { type: 'AND' }
  | { type: 'CLASS' }
  | { type: 'ELSE' }
  | { type: 'FALSE' }
  | { type: 'FUN' }
  | { type: 'FOR' }
  | { type: 'IF' }
  | { type: 'NIL' }
  | { type: 'OR' }
  | { type: 'PRINT' }
  | { type: 'RETURN' }
  | { type: 'SUPER' }
  | { type: 'THIS' }
  | { type: 'TRUE' }
  | { type: 'VAR' }
  | { type: 'WHILE' }
  // identifiers
  | { type: 'IDENTIFIER' }
  // special tokens
  | { type: 'COMMENT' }
  | { type: 'WHITESPACE' }
  | { type: 'UNKNOWN' }
  | { type: 'EOF' }

export type Token = Location & Type
