/// <reference types="node" />
import { ExecOptions } from "child_process";
export interface ShellCommandOpts extends ExecOptions {
    console?: boolean;
}
export interface ShellCommand<T extends {}, R = any> {
    script: (config: T) => string[];
    init?: () => T | Promise<T> | T;
    clean?: (config: T) => Promise<any> | any;
    handle?: (config: T, d: string) => string | void;
    resolve?: (config: T, d: string[]) => R;
    options?: (config: T) => Promise<ShellCommandOpts> | ShellCommandOpts;
}
export declare const shell: ([exe, ...args]: string[], handle?: (data: string) => string | void, options?: ExecOptions) => {
    promise: Promise<string[]>;
    process: import("child_process").ChildProcessWithoutNullStreams;
};
export declare const command: <T, R>(cmd: ShellCommand<T, R>) => Promise<{
    promise: Promise<R>;
    process: import("child_process").ChildProcessWithoutNullStreams;
    kill: () => Promise<string[]>;
}>;
export declare const parseArgs: <T extends string>(args: string | string[]) => Record<T, string>;
