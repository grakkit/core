/// <reference path="./env" />

import { types } from './types';
import { jiFile, jiInputStream, jnHttpURLConnection, juzZipEntry } from '@grakkit/core-classes';

/** A pending task. */
export type future = { tick: number; args: any[]; script: Function };

/** File system utilities for a specific path. */
export type record = {
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
export type response = {
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
export const session: {
   data: Map<string, any>;
   poly: { index: number; list: Map<number, future> };
   task: { list: Set<future>; tick: number };
   type: Map<keyof types, any>;
} = {
   data: new Map(),
   poly: { index: 0, list: new Map() },
   task: { list: new Set(), tick: 0 },
   type: new Map()
};

/** Imports the specified type from java. */
export function type<X extends keyof types> (name: X): types[X] {
   if (session.type.has(name)) {
      return session.type.get(name);
   } else {
      const value = Java.type(name);
      session.type.set(name, value);
      return value;
   }
}

const Class = type('java.lang.Class');
const FileOutputStream = type('java.io.FileOutputStream');
const Files = type('java.nio.file.Files');
const Iterable = type('java.lang.Iterable');
const Iterator = type('java.util.Iterator');
const JavaString = type('java.lang.String');
const Paths = type('java.nio.file.Paths');
const Scanner = type('java.util.Scanner');
const Spliterator = type('java.util.Spliterator');
const StandardCopyOption = type('java.nio.file.StandardCopyOption');
const URL = type('java.net.URL');
const ZipInputStream = type('java.util.zip.ZipInputStream');

/** Converts array-like objects or iterators into arrays. */
export function array (object: any): any[] {
   if (object instanceof Array) {
      return [ ...object ];
   } else if (object instanceof Iterable) {
      const output = [];
      object.forEach((value: any) => {
         output.push(value);
      });
      return output;
   } else if (object instanceof Iterator || object instanceof Spliterator) {
      const output = [];
      object.forEachRemaining((value: any) => {
         output.push(value);
      });
      return output;
   } else {
      return null;
   }
}

/** Takes 2 arguments, an initial value and a chain method. Creates a callback function which takes 1 argument. The
 * callback function passes its argument as well as a reference to the callback function itself into the chain
 * method. Finally, the callback function is called with the initial value. */
export function chain<X, Y extends (input: X, chain: (object: X) => ReturnType<Y>) => any> (base: X, modifier: Y) {
   const chain = (object: X) => modifier(object, chain);
   chain(base);
}

/** Stores data on a per-path basis. */
export function data (path: string, ...more: string[]) {
   const name = Paths.get(path, ...more).normalize().toString();
   if (session.data.has(name)) {
      return session.data.get(name);
   } else {
      const value = file(root, 'data', `${name}.json`).json() || {};
      session.data.set(name, value);
      return value;
   }
}

/** Tools for creating a single-input developer tools terminal. */
export const dev = {
   /** Executes the given code and returns the result. */
   execute (context: any, ...args: string[]) {
      const self = globalThis.hasOwnProperty('self');
      self || (globalThis.self = context);
      try {
         const result = Polyglot.eval('js', args.join(' '));
         self || delete globalThis.self;
         return format.output(result);
      } catch (whoops) {
         self || delete globalThis.self;
         return format.error(whoops);
      }
   },
   /** Returns a set of completions for the given input. */
   complete (context: any, ...args: string[]) {
      let body = '';
      let index = -1;
      let scope: any = globalThis;
      let valid = true;
      let string: boolean | string = false;
      let bracket: boolean | number | string = false;
      let comment = false;
      let property = '';
      const input = args.join(' ');
      while (valid && ++index < input.length) {
         const char = input[index];
         if (comment) {
            if (char === '*' && input[index + 1] === '/') {
               if (property) {
                  input[index + 2] === ';' && (comment = false);
               } else {
                  body = input.slice(0, index + 2);
                  comment = false;
               }
            }
         } else if (string) {
            if (char === '\\') {
               ++index;
            } else if (char === string) {
               scope = {};
               string = false;
            }
         } else if (bracket === true) {
            [ "'", '"', '`' ].includes(char) ? (bracket = char) : (valid = false);
         } else if (typeof bracket === 'string') {
            switch (char) {
               case '\\':
                  ++index;
                  break;
               case bracket:
                  bracket = -1;
                  break;
               default:
                  property += char;
            }
         } else {
            switch (char) {
               case '/':
                  switch (input[index + 1]) {
                     case '/':
                        valid = false;
                        break;
                     case '*':
                        comment = true;
                        break;
                  }
                  break;
               case "'":
               case '"':
               case '`':
                  bracket === -1 ? (valid = false) : (string = char);
                  break;
               case ')':
               case '{':
               case '}':
                  bracket || (scope = {});
                  break;
               case '.':
               case '[':
                  if (!bracket) {
                     if (char === '.' || property) {
                        body = input.slice(0, index + 1);
                        if (scope === globalThis && property === 'self' && !scope.hasOwnProperty('self')) {
                           scope = context;
                        } else {
                           scope = scope[property] || {};
                        }
                        char === '.' || (bracket = true);
                        property = '';
                     } else {
                        body = input.slice(0, index + 1);
                        scope = globalThis;
                     }
                  }
                  break;
               case ']':
                  bracket === -1 && (bracket = false);
                  break;
               case '\\':
                  typeof bracket === 'string' ? ++index : (valid = false);
                  break;
               case ' ':
                  property ? (valid = false) : (body = '');
                  break;
               default:
                  if (char.match(/[\+\-\*\/\^=!&\|\?:\(,;]/g)) {
                     if (!bracket) {
                        body = input.slice(0, index + 1);
                        scope = globalThis;
                        property = '';
                     }
                  } else {
                     property += char;
                  }
            }
         }
      }
      if (valid && scope && !(comment || string)) {
         const properties = Object.getOwnPropertyNames(scope);
         scope === globalThis && !properties.includes('self') && properties.push('self');
         return properties
            .sort()
            .filter((element) => element.toLowerCase().includes(property.toLowerCase()))
            .filter((name) => bracket || name === (name.match(/[_A-Z$][_0-9A-Z$]*/gi) || [])[0])
            .map((name) => {
               if (bracket) {
                  return `${body}\`${name.replace(/`/g, '\\`').split('\\').join('\\\\')}\`]`;
               } else {
                  return `${body}${name}`;
               }
            });
      } else {
         return [];
      }
   }
};

/** Sends a GET request to the given URL. */
export function fetch (link: string) {
   //@ts-expect-error
   const net: jnHttpURLConnection = new URL(link).openConnection();
   net.setDoOutput(true);
   net.setRequestMethod('GET');
   net.setInstanceFollowRedirects(true);
   const thing: response = {
      net,
      json (async?: boolean) {
         if (async) {
            return sync(async () => thing.json());
         } else {
            try {
               return JSON.parse(thing.read());
            } catch (error) {
               throw error;
            }
         }
      },
      //@ts-expect-error
      read (async?: boolean) {
         if (async) {
            return sync(async () => thing.read());
         } else {
            return new Scanner(thing.stream()).useDelimiter('\\A').next();
         }
      },
      //@ts-expect-error
      stream (async?: boolean) {
         if (async) {
            return sync(async () => thing.stream());
         } else {
            const code = net.getResponseCode();
            switch (code) {
               case 200:
                  return net.getInputStream();
               default:
                  throw new ReferenceError(`${code} ${net.getResponseMessage()}`);
            }
         }
      }
   };
   return thing;
}

/** A utility wrapper for paths and files. */
export function file (path: string | record | jiFile, ...more: string[]) {
   path = typeof path === 'string' ? path : 'io' in path ? path.path : path.getPath();
   const io = Paths.get(path, ...more).normalize().toFile();
   const thing: record = {
      get children () {
         return thing.type === 'folder' ? [ ...io.listFiles() ].map((sub) => file(sub.getPath())) : null;
      },
      directory () {
         if (thing.type === 'none') {
            chain(io, (io, loop) => {
               const parent = io.getParentFile();
               parent && (parent.exists() || loop(parent));
               io.mkdir();
            });
         }
         return thing;
      },
      entry () {
         thing.type === 'none' && thing.parent.directory() && io.createNewFile();
         return thing;
      },
      get exists () {
         return io.exists();
      },
      file (...path) {
         return file(io, ...path);
      },
      flush () {
         chain(io, (io, loop) => {
            const parent = io.getParentFile();
            parent && parent.isDirectory() && (parent.listFiles()[0] || (parent.delete() && loop(parent)));
         });
         return thing;
      },
      io,
      json (async?: boolean) {
         if (async) {
            return sync(async () => thing.json());
         } else {
            try {
               return JSON.parse(thing.read());
            } catch (error) {
               return null;
            }
         }
      },
      get name () {
         return io.getName();
      },
      get parent () {
         return thing.file('..');
      },
      get path () {
         return io.getPath().replace(/(\\)/g, '/');
      },
      //@ts-expect-error
      read (async?: boolean) {
         if (async) {
            return sync(async () => thing.read());
         } else {
            return thing.type === 'file' ? new JavaString(Files.readAllBytes(io.toPath())).toString() : null;
         }
      },
      remove () {
         chain(io, (io, loop) => {
            io.isDirectory() && [ ...io.listFiles() ].forEach(loop);
            io.exists() && io.delete();
         });
         return thing.flush();
      },
      get type () {
         return io.isDirectory() ? 'folder' : io.exists() ? 'file' : 'none';
      },
      //@ts-expect-error
      write (content: string, async?: boolean) {
         if (async) {
            return sync(async () => thing.write(content));
         } else {
            thing.type === 'file' && Files.write(io.toPath(), new JavaString(content).getBytes());
            return thing;
         }
      }
   };
   return thing;
}

/** Formatting tools for script feedback. */
export const format = {
   /** Reformats complex error messages into layman-friendly ones. */
   error (error: any) {
      let type = 'Error';
      let message = `${error}`;
      if (error.stack) {
         type = error.stack.split('\n')[0].split(' ')[0].slice(0, -1);
         message = error.message;
         switch (type) {
            case 'TypeError':
               try {
                  if (message.startsWith('invokeMember') || message.startsWith('execute on foreign object')) {
                     const reason = message.split('failed due to: ')[1];
                     if (reason.startsWith('no applicable overload found')) {
                        const sets = reason.split('overloads:')[1].split(']],')[0].split(')]').map((set) => {
                           return `(${set.split('(').slice(1).join('(')})`;
                        });
                        message = [ 'Invalid arguments! Expected:', ...sets ].join('\n -> ').slice(0, -1);
                     } else if (reason.startsWith('Arity error')) {
                        message = `Invalid argument amount! Expected: ${reason.split('-')[1].split(' ')[2]}`;
                     } else if (reason.startsWith('UnsupportedTypeException')) {
                        message = 'Invalid arguments!';
                     } else if (reason.startsWith('Unknown identifier')) {
                        message = `That method (${reason.split(': ')[1]}) does not exist!`;
                     } else if (reason.startsWith('Message not supported')) {
                        message = `That method (${message.slice(14).split(')')[0]}) does not exist!`;
                     } else {
                        message = message.split('\n')[0];
                     }
                  }
               } catch (error) {
                  message = message.split('\n')[0];
               }
               break;
            case 'SyntaxError':
               message = message.split(' ').slice(1).join(' ').split('\n')[0];
         }
      } else {
         error = `${error}`;
         type = error.split(' ')[0].slice(0, -1);
         message = error.split(' ').slice(1).join(' ');
      }
      return `${type}: ${message}`;
   },
   /** A pretty-printer for JavaScript objects. */
   output (object: any, condense?: boolean): string {
      if (condense === true) {
         if (object === circular) {
            return '...';
         } else {
            const type = toString.call(object);
            switch (type) {
               case '[object Array]':
               case '[object Object]':
               case '[object Function]':
                  return type.split(' ')[1].slice(0, -1);
               case '[foreign HostObject]':
                  if (object instanceof Class) {
                     return object.getCanonicalName();
                  } else if (typeof object.toString === 'function') {
                     const string = object.toString();
                     if (string) {
                        return string;
                     }
                  }
                  const clazz = typeof object.getClass === 'function' ? object.getClass() : object.class;
                  if (clazz instanceof Class) {
                     return clazz.getCanonicalName();
                  } else {
                     return `${object}` || 'Object';
                  }
               case '[foreign HostFunction]':
                  return 'Function';
               default:
                  switch (typeof object) {
                     case 'bigint':
                        return object.toString() + 'n';
                     case 'function':
                        return 'Function';
                     case 'object':
                        return object ? 'Object' : 'null';
                     case 'symbol':
                        return `<${object.toString().slice(7, -1)}>`;
                     case 'undefined':
                        return 'undefined';
                     default:
                        return JSON.stringify(object);
                  }
            }
         }
      } else {
         switch (toString.call(object)) {
            case '[object Array]':
               return `[ ${[ ...object ]
                  .map((value: any) => format.output(object === value ? circular : value, true))
                  .join(', ')} ]`;
            case '[object Object]':
               return `{ ${[
                  ...Object.getOwnPropertyNames(object).map((key) => {
                     return `${key}: ${format.output(object === object[key] ? circular : object[key], true)}`;
                  }),
                  ...Object.getOwnPropertySymbols(object).map((key) => {
                     return `${format.output(key, true)}: ${format.output(
                        object === object[key] ? circular : object[key],
                        true
                     )}`;
                  })
               ].join(', ')} }`;
            case '[object Function]':
               return object.toString().replace(/\r/g, '');
            case '[foreign HostFunction]':
               return 'function () { [native code] }';
            default:
               const list = array(object);
               if (list) {
                  return format.output(list);
               } else {
                  return format.output(object, true);
               }
         }
      }
   }
};

/** Reloads the JS environment. */
export function reload () {
   Core.push(Core.swap);
}

/** The root folder of the environment. */
export const root = file(Core.getRoot());

/** Recursively removes or replaces the circular references in an object. */
export function simplify (object: any, placeholder?: any, objects?: Set<any>) {
   if (object && typeof object === 'object') {
      objects || (objects = new Set());
      if (objects.has(object)) {
         return placeholder;
      } else {
         objects.add(object);
         const output = typeof object[Symbol.iterator] === 'function' ? [] : {};
         for (const key in object) output[key] = simplify(object[key], placeholder, new Set(objects));
         return output;
      }
   } else {
      return object;
   }
}

/** Runs an async function in another thread. */
export function sync<X> (script: (...args: any[]) => Promise<X>): Promise<X> {
   return new Promise((resolve, reject) => {
      Core.sync(() => script().then(resolve).catch(reject));
   });
}

/** A simple task scheduler. */
export const task = {
   /** Cancels a previously scheduled task. */
   cancel (handle: future) {
      session.task.list.delete(handle);
   },
   /** Schedules a task to run infinitely at a set interval. */
   interval (script: Function, period = 0, ...args: any[]) {
      const future = task.timeout(
         (...args: any[]) => {
            future.tick += Math.ceil(period < 1 ? 1 : period);
            script(...args);
         },
         0,
         ...args
      );
      return future;
   },
   /** Schedules a task to run after a set timeout. */
   timeout (script: Function, period = 0, ...args: any[]) {
      const future = { tick: session.task.tick + Math.ceil(period < 0 ? 0 : period), args, script };
      session.task.list.add(future);
      return future;
   }
};

/** Moves or copies a file or folder to a new destination. */
export function transfer (from: string | record | jiFile, to: string | record | jiFile, operation: 'move' | 'copy') {
   return sync(async () => {
      from = typeof from === 'string' ? file(from).io : 'io' in from ? from.io : from;
      to = typeof to === 'string' ? file(to).io : 'io' in to ? to.io : to;
      chain([ from, to ], (io, loop) => {
         if (io[0].isDirectory()) {
            file(io[1].getPath()).directory();
            for (const from of [ ...io[0].listFiles() ]) loop([ from, file(io[1].getPath(), from.getName()).io ]);
         } else if (io[0].exists() && !io[1].exists()) {
            Files[operation](
               io[0].toPath(),
               io[1].toPath(),
               StandardCopyOption.COPY_ATTRIBUTES,
               StandardCopyOption.REPLACE_EXISTING
            );
         }
      });
   });
}

/** Unzips the input stream's archive (if any) to a new destination. */
export function unzip (from: jiInputStream, to: string | record | jiFile) {
   return sync(async () => {
      to = file(to);
      let entry: juzZipEntry;
      const stream = new ZipInputStream(from);
      try {
         while ((entry = stream.getNextEntry())) {
            try {
               const target = to.file(entry.getName());
               if (entry.isDirectory()) {
                  target.directory();
               } else {
                  const output = new FileOutputStream(target.entry().io);
                  try {
                     stream.transferTo(output);
                     output.close();
                  } catch (error) {
                     output.close();
                     throw error;
                  }
               }
               stream.closeEntry();
            } catch (error) {
               stream.closeEntry();
               throw error;
            }
         }
         stream.close();
         from.close();
      } catch (error) {
         stream.close();
         from.close();
         throw error;
      }
   });
}

/** @deprecated */
export const core = {
   array,
   chain,
   console: dev,
   data,
   dev,
   fetch,
   file,
   format,
   meta: {
      hook (script: Function) {
         Core.hook(script);
      },
      push (script: Function) {
         Core.push(script);
      },
      root,
      sync
   },
   reload,
   root,
   simplify,
   session,
   sync,
   task,
   transfer,
   type,
   unzip
};

chain(void 0, (none, next) => {
   Core.push(next);
   for (const task of session.task.list) {
      if (session.task.tick > task.tick) {
         session.task.list.delete(task);
      } else if (session.task.tick === task.tick) {
         try {
            task.script(...task.args);
         } catch (error) {
            console.error('An error occured while attempting to execute a task!');
            console.error(error.stack || error.message || error);
         }
      }
   }
   ++session.task.tick;
});

Core.hook(() => {
   for (const [ name ] of session.data) {
      file(root, 'data', `${name}.json`).entry().write(JSON.stringify(simplify(session.data.get(name))));
   }
});

const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const circular = Symbol();
const promise = Promise.resolve();

Object.assign(globalThis, {
   atob (data: string) {
      var str = String(data).replace(/[=]+$/, '');
      if (str.length % 4 === 1) {
         throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
      }
      for (
         var bc = 0, bs, buffer, idx = 0, output = '';
         (buffer = str.charAt(idx++));
         ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
            ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
            : 0
      ) {
         buffer = base.indexOf(buffer);
      }
      return output;
   },
   btoa (data: string) {
      var str = String(data);
      for (
         var block, charCode, idx = 0, map = base, output = '';
         str.charAt(idx | 0) || ((map = '='), idx % 1);
         output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))
      ) {
         charCode = str.charCodeAt((idx += 3 / 4));
         if (charCode > 0xff) {
            throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
         }
         block = (block << 8) | charCode;
      }
      return output;
   },
   clearImmediate (handle?: number) {
      task.cancel(session.poly.list.get(handle));
   },
   clearInterval (handle?: number) {
      task.cancel(session.poly.list.get(handle));
   },
   clearTimeout (handle?: number) {
      task.cancel(session.poly.list.get(handle));
   },
   global: globalThis,
   queueMicrotask (callback: () => void) {
      promise.then(callback).catch((error) => {
         task.timeout(() => {
            throw error;
         });
      });
   },
   setInterval (script: string | Function, period = 0, ...args: any[]) {
      session.poly.list.set(
         session.poly.index,
         task.interval(
            typeof script === 'string' ? () => Polyglot.eval('js', script) : script,
            Math.ceil(period / 50),
            ...args
         )
      );
      return session.poly.index++;
   },
   setTimeout (script: string | Function, period = 0, ...args: any[]) {
      session.poly.list.set(
         session.poly.index,
         task.timeout(
            typeof script === 'string' ? () => Polyglot.eval('js', script) : script,
            Math.ceil(period / 50),
            ...args
         )
      );
      return session.poly.index++;
   },
   setImmediate (script: string | Function, ...args: any[]) {
      session.poly.list.set(
         session.poly.index,
         task.timeout(typeof script === 'string' ? () => Polyglot.eval('js', script) : script, 0, ...args)
      );
      return session.poly.index++;
   },
   window: globalThis
});
