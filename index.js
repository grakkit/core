"use strict";
/// <reference path="./env.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.core = exports.unzip = exports.transfer = exports.task = exports.sync = exports.simplify = exports.root = exports.reload = exports.regex = exports.load = exports.format = exports.file = exports.fetch = exports.dev = exports.data = exports.chain = exports.array = exports.type = exports.session = void 0;
/** A session container for this module. */
exports.session = {
    data: new Map(),
    load: new Map(),
    poly: { index: 0, list: new Map() },
    task: { list: new Set(), tick: 0 },
    type: new Map()
};
/** Imports the specified type from java. */
function type(name) {
    if (exports.session.type.has(name)) {
        return exports.session.type.get(name);
    }
    else {
        const value = Java.type(name);
        exports.session.type.set(name, value);
        return value;
    }
}
exports.type = type;
const Class = type('java.lang.Class');
const FileOutputStream = type('java.io.FileOutputStream');
const Files = type('java.nio.file.Files');
const Iterable = type('java.lang.Iterable');
const Iterator = type('java.util.Iterator');
const JavaString = type('java.lang.String');
const Paths = type('java.nio.file.Paths');
const Pattern = type('java.util.regex.Pattern');
const Scanner = type('java.util.Scanner');
const Spliterator = type('java.util.Spliterator');
const StandardCopyOption = type('java.nio.file.StandardCopyOption');
const URL = type('java.net.URL');
const ZipInputStream = type('java.util.zip.ZipInputStream');
/** Converts array-like objects or iterators into arrays. */
function array(object) {
    if (object instanceof Array) {
        return [...object];
    }
    else if (object instanceof Iterable) {
        const output = [];
        object.forEach((value) => {
            output.push(value);
        });
        return output;
    }
    else if (object instanceof Iterator || object instanceof Spliterator) {
        const output = [];
        object.forEachRemaining((value) => {
            output.push(value);
        });
        return output;
    }
    else {
        return null;
    }
}
exports.array = array;
/** Takes 2 arguments, an initial value and a chain method. Creates a callback function which takes 1 argument. The
 * callback function passes its argument as well as a reference to the callback function itself into the chain
 * method. Finally, the callback function is called with the initial value. */
function chain(base, modifier) {
    const chain = (object) => modifier(object, chain);
    chain(base);
}
exports.chain = chain;
/** Stores data on a per-path basis. */
function data(path, ...more) {
    const name = Paths.get(path, ...more).normalize().toString();
    if (exports.session.data.has(name)) {
        return exports.session.data.get(name);
    }
    else {
        const value = file(exports.root, 'data', `${name}.json`).json() || {};
        exports.session.data.set(name, value);
        return value;
    }
}
exports.data = data;
/** Tools for creating a single-input developer tools terminal. */
exports.dev = {
    /** Executes the given code and returns the result. */
    execute(context, ...args) {
        const self = globalThis.hasOwnProperty('self');
        self || (globalThis.self = context);
        try {
            const result = Polyglot.eval('js', args.join(' '));
            self || delete globalThis.self;
            return exports.format.output(result);
        }
        catch (whoops) {
            self || delete globalThis.self;
            return exports.format.error(whoops);
        }
    },
    /** Returns a set of completions for the given input. */
    complete(context, ...args) {
        let body = '';
        let index = -1;
        let scope = globalThis;
        let valid = true;
        let string = false;
        let bracket = false;
        let comment = false;
        let property = '';
        const input = args.join(' ');
        while (valid && ++index < input.length) {
            const char = input[index];
            if (comment) {
                if (char === '*' && input[index + 1] === '/') {
                    if (property) {
                        input[index + 2] === ';' && (comment = false);
                    }
                    else {
                        body = input.slice(0, index + 2);
                        comment = false;
                    }
                }
            }
            else if (string) {
                if (char === '\\') {
                    ++index;
                }
                else if (char === string) {
                    scope = {};
                    string = false;
                }
            }
            else if (bracket === true) {
                ["'", '"', '`'].includes(char) ? (bracket = char) : (valid = false);
            }
            else if (typeof bracket === 'string') {
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
            }
            else {
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
                                }
                                else {
                                    scope = scope[property] || {};
                                }
                                char === '.' || (bracket = true);
                                property = '';
                            }
                            else {
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
                        if (exports.regex.test(char, '[\\+\\-\\*\\/\\^=!&\\|\\?:\\(,;]')) {
                            if (!bracket) {
                                body = input.slice(0, index + 1);
                                scope = globalThis;
                                property = '';
                            }
                        }
                        else {
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
                .filter(element => element.toLowerCase().includes(property.toLowerCase()))
                .filter(name => bracket || exports.regex.test(name, '[_A-Za-z$][_0-9A-Za-z$]*'))
                .map(name => {
                if (bracket) {
                    return `${body}\`${exports.regex.replace(name, '`', '\\`').split('\\').join('\\\\')}\`]`;
                }
                else {
                    return `${body}${name}`;
                }
            });
        }
        else {
            return [];
        }
    }
};
/** Sends a GET request to the given URL. */
function fetch(link) {
    //@ts-expect-error
    const net = new URL(link).openConnection();
    net.setDoOutput(true);
    net.setRequestMethod('GET');
    net.setInstanceFollowRedirects(true);
    const thing = {
        net,
        json(async) {
            if (async) {
                return sync(async () => thing.json());
            }
            else {
                try {
                    return JSON.parse(thing.read());
                }
                catch (error) {
                    throw error;
                }
            }
        },
        //@ts-expect-error
        read(async) {
            if (async) {
                return sync(async () => thing.read());
            }
            else {
                return new Scanner(thing.stream()).useDelimiter('\\A').next();
            }
        },
        //@ts-expect-error
        stream(async) {
            if (async) {
                return sync(async () => thing.stream());
            }
            else {
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
exports.fetch = fetch;
/** A utility wrapper for paths and files. */
function file(path, ...more) {
    path = typeof path === 'string' ? path : 'io' in path ? path.path : path.getPath();
    const io = Paths.get(path, ...more).normalize().toFile();
    const thing = {
        get children() {
            return thing.type === 'folder' ? [...io.listFiles()].map(sub => file(sub.getPath())) : null;
        },
        directory() {
            if (thing.type === 'none') {
                chain(io, (io, loop) => {
                    const parent = io.getParentFile();
                    parent && (parent.exists() || loop(parent));
                    io.mkdir();
                });
            }
            return thing;
        },
        entry() {
            thing.type === 'none' && thing.parent.directory() && io.createNewFile();
            return thing;
        },
        get exists() {
            return io.exists();
        },
        file(...path) {
            return file(io, ...path);
        },
        flush() {
            chain(io, (io, loop) => {
                const parent = io.getParentFile();
                parent && parent.isDirectory() && (parent.listFiles()[0] || (parent.delete() && loop(parent)));
            });
            return thing;
        },
        io,
        json(async) {
            if (async) {
                return sync(async () => thing.json());
            }
            else {
                try {
                    return JSON.parse(thing.read());
                }
                catch (error) {
                    return null;
                }
            }
        },
        get name() {
            return io.getName();
        },
        get parent() {
            return thing.file('..');
        },
        get path() {
            return exports.regex.replace(io.getPath(), '(\\\\)', '/');
        },
        //@ts-expect-error
        read(async) {
            if (async) {
                return sync(async () => thing.read());
            }
            else {
                return thing.type === 'file' ? new JavaString(Files.readAllBytes(io.toPath())).toString() : null;
            }
        },
        remove() {
            chain(io, (io, loop) => {
                io.isDirectory() && [...io.listFiles()].forEach(loop);
                io.exists() && io.delete();
            });
            return thing.flush();
        },
        get type() {
            return io.isDirectory() ? 'folder' : io.exists() ? 'file' : 'none';
        },
        //@ts-expect-error
        write(content, async) {
            if (async) {
                return sync(async () => thing.write(content));
            }
            else {
                thing.type === 'file' && Files.write(io.toPath(), new JavaString(content).getBytes());
                return thing;
            }
        }
    };
    return thing;
}
exports.file = file;
/** Formatting tools for script feedback. */
exports.format = {
    /** Reformats complex error messages into layman-friendly ones. */
    error(error) {
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
                                const sets = reason.split('overloads:')[1].split(']],')[0].split(')]').map(set => {
                                    return `(${set.split('(').slice(1).join('(')})`;
                                });
                                message = ['Invalid arguments! Expected:', ...sets].join('\n -> ').slice(0, -1);
                            }
                            else if (reason.startsWith('Arity error')) {
                                message = `Invalid argument amount! Expected: ${reason.split('-')[1].split(' ')[2]}`;
                            }
                            else if (reason.startsWith('UnsupportedTypeException')) {
                                message = 'Invalid arguments!';
                            }
                            else if (reason.startsWith('Unknown identifier')) {
                                message = `That method (${reason.split(': ')[1]}) does not exist!`;
                            }
                            else if (reason.startsWith('Message not supported')) {
                                message = `That method (${message.slice(14).split(')')[0]}) does not exist!`;
                            }
                            else {
                                message = message.split('\n')[0];
                            }
                        }
                    }
                    catch (error) {
                        message = message.split('\n')[0];
                    }
                    break;
                case 'SyntaxError':
                    message = message.split(' ').slice(1).join(' ').split('\n')[0];
            }
        }
        else {
            error = `${error}`;
            type = error.split(' ')[0].slice(0, -1);
            message = error.split(' ').slice(1).join(' ');
        }
        return `${type}: ${message}`;
    },
    /** A pretty-printer for JavaScript objects. */
    output(object, condense) {
        if (condense === true) {
            if (object === circular) {
                return '...';
            }
            else {
                const type = toString.call(object);
                switch (type) {
                    case '[object Array]':
                    case '[object Object]':
                    case '[object Function]':
                        return type.split(' ')[1].slice(0, -1);
                    case '[foreign HostObject]':
                        if (object instanceof Class && typeof object.getCanonicalName === 'function') {
                            return object.getCanonicalName();
                        }
                        else if (typeof object.toString === 'function') {
                            const string = object.toString();
                            if (string) {
                                return string;
                            }
                        }
                        const clazz = typeof object.getClass === 'function' ? object.getClass() : object.class;
                        if (clazz instanceof Class && typeof clazz.getCanonicalName === 'function') {
                            return clazz.getCanonicalName();
                        }
                        else {
                            return `${object}` || `${clazz}` || 'Object';
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
        }
        else {
            switch (toString.call(object)) {
                case '[object Array]':
                    return `[ ${[...object]
                        .map((value) => exports.format.output(object === value ? circular : value, true))
                        .join(', ')} ]`;
                case '[object Object]':
                    return `{ ${[
                        ...Object.getOwnPropertyNames(object).map(key => {
                            return `${key}: ${exports.format.output(object === object[key] ? circular : object[key], true)}`;
                        }),
                        ...Object.getOwnPropertySymbols(object).map(key => {
                            return `${exports.format.output(key, true)}: ${exports.format.output(object === object[key] ? circular : object[key], true)}`;
                        })
                    ].join(', ')} }`;
                case '[object Function]':
                    if (object instanceof Class && typeof object.getCanonicalName === 'function') {
                        return object.getCanonicalName();
                    }
                    else if (typeof object.toString === 'function') {
                        return exports.regex.replace(object.toString(), '\\r', '');
                    }
                    else {
                        return `${object}` || 'function () { [native code] }';
                    }
                case '[foreign HostFunction]':
                    return 'hostFunction () { [native code] }';
                default:
                    const list = array(object);
                    if (list) {
                        return exports.format.output(list);
                    }
                    else {
                        return exports.format.output(object, true);
                    }
            }
        }
    }
};
/** Imports classes from external files. */
function load(path, name) {
    if (exports.session.load.has(name)) {
        return exports.session.load.get(name);
    }
    else {
        const source = file(path);
        if (source.exists) {
            const value = Core.load(source.io, name);
            exports.session.load.set(name, value);
            return value;
        }
        else {
            throw new ReferenceError(`The file "${source.path}" does not exist!`);
        }
    }
}
exports.load = load;
exports.regex = {
    test(input, expression) {
        //@ts-expect-error
        return input.matches(expression);
    },
    replace(input, expression, replacement) {
        //@ts-expect-error
        return Pattern.compile(expression).matcher(input).replaceAll(replacement);
    }
};
/** Reloads the JS environment. */
function reload() {
    Core.push(Core.swap);
}
exports.reload = reload;
/** The root folder of the environment. */
exports.root = file(Core.getRoot());
/** Recursively removes or replaces the circular references in an object. */
function simplify(object, placeholder, objects) {
    if (object && typeof object === 'object') {
        objects || (objects = new Set());
        if (objects.has(object)) {
            return placeholder;
        }
        else {
            objects.add(object);
            const output = typeof object[Symbol.iterator] === 'function' ? [] : {};
            for (const key in object)
                output[key] = simplify(object[key], placeholder, new Set(objects));
            return output;
        }
    }
    else {
        return object;
    }
}
exports.simplify = simplify;
/** Runs an async function in another thread. */
function sync(script) {
    return new Promise((resolve, reject) => {
        Core.sync(() => script().then(resolve).catch(reject));
    });
}
exports.sync = sync;
/** A simple task scheduler. */
exports.task = {
    /** Cancels a previously scheduled task. */
    cancel(handle) {
        exports.session.task.list.delete(handle);
    },
    /** Schedules a task to run infinitely at a set interval. */
    interval(script, period = 0, ...args) {
        const future = exports.task.timeout((...args) => {
            future.tick += Math.ceil(period < 1 ? 1 : period);
            script(...args);
        }, 0, ...args);
        return future;
    },
    /** Schedules a task to run after a set timeout. */
    timeout(script, period = 0, ...args) {
        const future = { tick: exports.session.task.tick + Math.ceil(period < 0 ? 0 : period), args, script };
        exports.session.task.list.add(future);
        return future;
    }
};
/** Moves or copies a file or folder to a new destination. */
function transfer(from, to, operation) {
    return sync(async () => {
        from = typeof from === 'string' ? file(from).io : 'io' in from ? from.io : from;
        to = typeof to === 'string' ? file(to).io : 'io' in to ? to.io : to;
        chain([from, to], (io, loop) => {
            if (io[0].isDirectory()) {
                file(io[1].getPath()).directory();
                for (const from of [...io[0].listFiles()])
                    loop([from, file(io[1].getPath(), from.getName()).io]);
            }
            else if (io[0].exists() && !io[1].exists()) {
                Files[operation](io[0].toPath(), io[1].toPath(), StandardCopyOption.COPY_ATTRIBUTES, StandardCopyOption.REPLACE_EXISTING);
            }
        });
    });
}
exports.transfer = transfer;
/** Unzips the input stream's archive (if any) to a new destination. */
function unzip(from, to) {
    return sync(async () => {
        to = file(to);
        let entry;
        const stream = new ZipInputStream(from);
        try {
            while ((entry = stream.getNextEntry())) {
                try {
                    const target = to.file(entry.getName());
                    if (entry.isDirectory()) {
                        target.directory();
                    }
                    else {
                        const output = new FileOutputStream(target.entry().io);
                        try {
                            stream.transferTo(output);
                            output.close();
                        }
                        catch (error) {
                            output.close();
                            throw error;
                        }
                    }
                    stream.closeEntry();
                }
                catch (error) {
                    stream.closeEntry();
                    throw error;
                }
            }
            stream.close();
            from.close();
        }
        catch (error) {
            stream.close();
            from.close();
            throw error;
        }
    });
}
exports.unzip = unzip;
/** @deprecated */
exports.core = {
    array,
    chain,
    console: exports.dev,
    data,
    dev: exports.dev,
    fetch,
    file,
    format: exports.format,
    meta: {
        hook(script) {
            Core.hook(script);
        },
        load(path, name) {
            return Core.load(typeof path === 'string' ? file(path).io : 'io' in path ? path.io : path, name);
        },
        push(script) {
            Core.push(script);
        },
        root: exports.root,
        sync
    },
    reload,
    regex: exports.regex,
    root: exports.root,
    simplify,
    session: exports.session,
    sync,
    task: exports.task,
    transfer,
    type,
    unzip
};
chain(void 0, (none, next) => {
    Core.push(next);
    for (const task of exports.session.task.list) {
        if (exports.session.task.tick > task.tick) {
            exports.session.task.list.delete(task);
        }
        else if (exports.session.task.tick === task.tick) {
            try {
                task.script(...task.args);
            }
            catch (error) {
                console.error('An error occured while attempting to execute a task!');
                console.error(error.stack || error.message || error);
            }
        }
    }
    ++exports.session.task.tick;
});
Core.hook(() => {
    for (const [name] of exports.session.data) {
        file(exports.root, 'data', `${name}.json`).entry().write(JSON.stringify(simplify(exports.session.data.get(name))));
    }
});
const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const circular = Symbol();
const promise = Promise.resolve();
Object.assign(globalThis, {
    atob(data) {
        var str = exports.regex.replace(String(data), '[=]+$', '');
        if (str.length % 4 === 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (var bc = 0, bs, buffer, idx = 0, output = ''; (buffer = str.charAt(idx++)); ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
            ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
            : 0) {
            buffer = base.indexOf(buffer);
        }
        return output;
    },
    btoa(data) {
        var str = String(data);
        for (var block, charCode, idx = 0, map = base, output = ''; str.charAt(idx | 0) || ((map = '='), idx % 1); output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))) {
            charCode = str.charCodeAt((idx += 3 / 4));
            if (charCode > 0xff) {
                throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
            }
            block = (block << 8) | charCode;
        }
        return output;
    },
    clearImmediate(handle) {
        exports.task.cancel(exports.session.poly.list.get(handle));
    },
    clearInterval(handle) {
        exports.task.cancel(exports.session.poly.list.get(handle));
    },
    clearTimeout(handle) {
        exports.task.cancel(exports.session.poly.list.get(handle));
    },
    global: globalThis,
    queueMicrotask(callback) {
        promise.then(callback).catch(error => {
            exports.task.timeout(() => {
                throw error;
            });
        });
    },
    setInterval(script, period = 0, ...args) {
        exports.session.poly.list.set(exports.session.poly.index, exports.task.interval(typeof script === 'string' ? () => Polyglot.eval('js', script) : script, Math.ceil(period / 50), ...args));
        return exports.session.poly.index++;
    },
    setTimeout(script, period = 0, ...args) {
        exports.session.poly.list.set(exports.session.poly.index, exports.task.timeout(typeof script === 'string' ? () => Polyglot.eval('js', script) : script, Math.ceil(period / 50), ...args));
        return exports.session.poly.index++;
    },
    setImmediate(script, ...args) {
        exports.session.poly.list.set(exports.session.poly.index, exports.task.timeout(typeof script === 'string' ? () => Polyglot.eval('js', script) : script, 0, ...args));
        return exports.session.poly.index++;
    },
    window: globalThis
});
