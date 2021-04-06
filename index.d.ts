/// <reference path="env.d.ts" />
import { types } from './types';
import { jiFile, jiInputStream, jnHttpURLConnection } from '@grakkit/core-classes';
/** A pending task. */
export declare type future = {
    tick: number;
    args: any[];
    script: Function;
};
/** File system utilities for a specific path. */
export declare type record = {
    /** Returns an array of modifiers for the contents of the folder (if any) at the current path. */
    readonly children: record[];
    /** Creates a folder at the current path if no file or folder already exists there. */
    directory(): record;
    /** Creates a file at the current path if no file or folder already exists there. */
    entry(): record;
    /** Whether a file or folder exists at the current path or not. */
    readonly exists: boolean;
    /** Joins the current path and the given sub-path, and returns a new modifier for it. */
    file(...sub: string[]): record;
    /** Starting from the current path, removes parent folders upstream until a parent folder is non-empty. */
    flush(): record;
    /** The java file for the current path. */
    io: jiFile;
    /** Synchronously parses the JSON content (if any) of the file at the current path. */
    json(async?: false): any;
    /** Parses the JSON content (if any) of the file at the current path. */
    json(async: true): Promise<any>;
    /** The name of the current path. */
    readonly name: string;
    /** The current path. */
    readonly path: string;
    /** The record for the parent folder of the current path. */
    readonly parent: record;
    /** Synchronously returns the content (if any) of the file at the current path. */
    read(async?: false): string;
    /** Returns the content (if any) of the file at the current path. */
    read(async: true): Promise<string>;
    /** Removes and flushes the file or folder (if any) at the current path. */
    remove(): record;
    /** Whether the current path represents a folder, a file, or none of the above. */
    readonly type: 'folder' | 'file' | 'none';
    /** Synchronously writes the given content to the file (if any) at the current path. */
    write(content: string, async?: false): record;
    /** Writes the given content to the file (if any) at the current path. */
    write(content: string, async: true): Promise<record>;
};
/** A web response. */
export declare type response = {
    /** The connection instance used to make this request. */
    net: jnHttpURLConnection;
    /** Synchronously parses the JSON content (if any) of the response. */
    json(async?: false): any;
    /** Parses the JSON content (if any) of the response. */
    json(async: true): Promise<any>;
    /** Synchronously returns the content (if any) of the response. */
    read(async?: false): string;
    /** Returns the content (if any) of the response. */
    read(async: true): Promise<string>;
    /** Synchronously returns the response stream. */
    stream(async?: false): jiInputStream;
    /** Returns the response stream. */
    stream(async: true): Promise<jiInputStream>;
};
/** A session container for this module. */
export declare const session: {
    data: Map<string, any>;
    load: Map<string, any>;
    poly: {
        index: number;
        list: Map<number, future>;
    };
    task: {
        list: Set<future>;
        tick: number;
    };
    type: Map<keyof types, any>;
};
/** Imports the specified type from java. */
export declare function type<X extends keyof types>(name: X): types[X];
/** Converts array-like objects or iterators into arrays. */
export declare function array(object: any): any[];
/** Takes 2 arguments, an initial value and a chain method. Creates a callback function which takes 1 argument. The
 * callback function passes its argument as well as a reference to the callback function itself into the chain
 * method. Finally, the callback function is called with the initial value. */
export declare function chain<X, Y extends (input: X, chain: (object: X) => ReturnType<Y>) => any>(base: X, modifier: Y): void;
/** Stores data on a per-path basis. */
export declare function data(path: string, ...more: string[]): any;
/** Tools for creating a single-input developer tools terminal. */
export declare const dev: {
    /** Executes the given code and returns the result. */
    execute(context: any, ...args: string[]): string;
    /** Returns a set of completions for the given input. */
    complete(context: any, ...args: string[]): string[];
};
/** Sends a GET request to the given URL. */
export declare function fetch(link: string): response;
/** A utility wrapper for paths and files. */
export declare function file(path: string | record | jiFile, ...more: string[]): record;
/** Formatting tools for script feedback. */
export declare const format: {
    /** Reformats complex error messages into layman-friendly ones. */
    error(error: any): string;
    /** A pretty-printer for JavaScript objects. */
    output(object: any, condense?: boolean): string;
};
/** Imports classes from external files. */
export declare function load(path: string | record | jiFile, name: string): any;
/** Reloads the JS environment. */
export declare function reload(): void;
/** The root folder of the environment. */
export declare const root: record;
/** Recursively removes or replaces the circular references in an object. */
export declare function simplify(object: any, placeholder?: any, objects?: Set<any>): any;
/** Runs an async function in another thread. */
export declare function sync<X>(script: (...args: any[]) => Promise<X>): Promise<X>;
/** A simple task scheduler. */
export declare const task: {
    /** Cancels a previously scheduled task. */
    cancel(handle: future): void;
    /** Schedules a task to run infinitely at a set interval. */
    interval(script: Function, period?: number, ...args: any[]): {
        tick: number;
        args: any[];
        script: Function;
    };
    /** Schedules a task to run after a set timeout. */
    timeout(script: Function, period?: number, ...args: any[]): {
        tick: number;
        args: any[];
        script: Function;
    };
};
/** Moves or copies a file or folder to a new destination. */
export declare function transfer(from: string | record | jiFile, to: string | record | jiFile, operation: 'move' | 'copy'): Promise<void>;
/** Unzips the input stream's archive (if any) to a new destination. */
export declare function unzip(from: jiInputStream, to: string | record | jiFile): Promise<void>;
/** @deprecated */
export declare const core: {
    array: typeof array;
    chain: typeof chain;
    console: {
        /** Executes the given code and returns the result. */
        execute(context: any, ...args: string[]): string;
        /** Returns a set of completions for the given input. */
        complete(context: any, ...args: string[]): string[];
    };
    data: typeof data;
    dev: {
        /** Executes the given code and returns the result. */
        execute(context: any, ...args: string[]): string;
        /** Returns a set of completions for the given input. */
        complete(context: any, ...args: string[]): string[];
    };
    fetch: typeof fetch;
    file: typeof file;
    format: {
        /** Reformats complex error messages into layman-friendly ones. */
        error(error: any): string;
        /** A pretty-printer for JavaScript objects. */
        output(object: any, condense?: boolean): string;
    };
    meta: {
        hook(script: Function): void;
        push(script: Function): void;
        root: record;
        sync: typeof sync;
    };
    reload: typeof reload;
    root: record;
    simplify: typeof simplify;
    session: {
        data: Map<string, any>;
        load: Map<string, any>;
        poly: {
            index: number;
            list: Map<number, future>;
        };
        task: {
            list: Set<future>;
            tick: number;
        };
        type: Map<keyof types, any>;
    };
    sync: typeof sync;
    task: {
        /** Cancels a previously scheduled task. */
        cancel(handle: future): void;
        /** Schedules a task to run infinitely at a set interval. */
        interval(script: Function, period?: number, ...args: any[]): {
            tick: number;
            args: any[];
            script: Function;
        };
        /** Schedules a task to run after a set timeout. */
        timeout(script: Function, period?: number, ...args: any[]): {
            tick: number;
            args: any[];
            script: Function;
        };
    };
    transfer: typeof transfer;
    type: typeof type;
    unzip: typeof unzip;
};
