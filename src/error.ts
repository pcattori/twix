export type Err = {
  source: string,
  offset: number,
  length: number,
  message: string,
}

function format({ source, offset, length, message }: Err): string {
  let line_number = 1
  for (let i = 0; i < offset; i++) {
    if (source[i] === "\n") line_number += 1
  }

  let line_begin = source.lastIndexOf("\n", offset)
  line_begin = line_begin === -1 ? 0 : line_begin + 1

  let line_end = source.indexOf("\n", offset + length)
  line_end = line_end === -1 ? source.length : line_end

  let line = source.slice(line_begin, line_end)

  let line_prefix = `${line_number} | `
  let underline = " ".repeat(line_prefix.length + offset - line_begin) + "^".repeat(length)

  return `ERROR: ${message}

  ${line_prefix}${line}
  ${underline}`
}

export class SyntaxErr extends Error {
  error: Err

  constructor(error: Err) {
    let message = format(error)
    super(message)
    this.error = error
  }
}

export class SyntaxErrs extends Error {
  errors: Err[]

  constructor(errors: Err[]) {
    let message = errors.map(format).join("\n\n")
    super(message)
    this.errors = errors
  }
}

export class RuntimeErr extends Error {
  error: Err

  constructor(error: Err) {
    let message = format(error)
    super(message)
    this.error = error
  }
}
