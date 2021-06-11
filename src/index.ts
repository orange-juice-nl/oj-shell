import { exec, ExecOptions, spawn } from "child_process"

export interface ShellCommandOpts extends ExecOptions { console?: boolean }

export interface ShellCommand<T extends {}, R = any> {
  script: (config: T) => string[]
  init?: () => T | Promise<T> | T
  clean?: (config: T) => Promise<any> | any
  handle?: (config: T, d: string) => string | void
  resolve?: (config: T, d: string[]) => R
  options?: (config: T) => Promise<ShellCommandOpts> | ShellCommandOpts
}

export const shell = ([exe, ...args]: string[], handle?: (data: string) => string | void, options: ExecOptions = {}) => {
  const process = spawn(exe, args, options)

  const promise = new Promise<string[]>((res, rej) => {
    let data: string[] = []
    let tail: string[] = []

    const ondata = (d: string) => {
      d = d.toString()
      tail.push(d)
      if (tail.length > 6)
        tail.shift()

      if (handle) {
        const n = handle(d)
        if (n)
          d = n
      }
      if (d)
        data.push(d)
    }

    let handled = false
    const handleClose = (code: number) => {
      if (handled)
        return
      if (code == null || code > 0)
        rej(tail.join("\r\n"))
      else
        res(data)
      handled = true
    }

    process.stdout.on("data", ondata)
    process.stderr.setEncoding("utf8")
    process.stderr.on("data", ondata)
    process.on("close", handleClose)
    process.on("disconnect", handleClose)
    process.on("exit", handleClose)
  })

  return {
    promise,
    process,
  }
}

export const command = async  <T, R>(cmd: ShellCommand<T, R>) => {
  const config = await cmd.init?.() ?? undefined
  const opts = await cmd.options?.(config) ?? {}

  const script = cmd.script(config)

  if (opts.console)
    console.info(script)

  const sh = shell(script, cmd.handle ? d => cmd.handle(config, d) : undefined, opts)

  const promise = sh.promise
    .then(data => cmd.resolve?.(config, data))
    .finally(() => cmd.clean?.(config))

  return {
    promise,
    process: sh.process,
    kill: () => {
      sh.process.stdin.write("q")
      setTimeout(() => {
        if (!sh.process.killed)
          sh.process.kill("SIGKILL")
      }, 5000)
      return sh.promise
    }
  }
}

export const parseArgs = <T extends string>(args: string | string[]) =>
  (typeof args === "string" ? args.split(" ") : args)
    .reduce((s, x) =>
      Object.assign(s, { [x.substr(0, 1)]: x.substr(1) }), {} as Record<T, string>)