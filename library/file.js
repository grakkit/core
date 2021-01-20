"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.file = void 0;
const type_1 = require("./type");
const chain_1 = require("./chain");
const Files = type_1.type('java.nio.file.Files');
const JavaString = type_1.type('java.lang.String');
const Paths = type_1.type('java.nio.file.Paths');
function file(path, ...more) {
    path = typeof path === 'string' ? path : 'io' in path ? path.path : path.getPath();
    const io = Paths.get(path, ...more).normalize().toFile();
    const thing = {
        get children() {
            return thing.type === 'folder' ? [...io.listFiles()].map((sub) => file(sub.getPath())) : null;
        },
        directory() {
            if (thing.type === 'none') {
                chain_1.chain(io, (io, loop) => {
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
            chain_1.chain(io, (io, loop) => {
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
            return io.getPath().replace(/(\\)/g, '/');
        },
        read(async) {
            if (async) {
                return sync(async () => thing.read());
            }
            else {
                return thing.type === 'file' ? new JavaString(Files.readAllBytes(io.toPath())).toString() : null;
            }
        },
        remove() {
            chain_1.chain(io, (io, loop) => {
                io.isDirectory() && [...io.listFiles()].forEach(loop);
                io.exists() && io.delete();
            });
            return thing.flush();
        },
        get type() {
            return io.isDirectory() ? 'folder' : io.exists() ? 'file' : 'none';
        },
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
function sync(script) {
    return new Promise((resolve, reject) => {
        Core.sync(() => script().then(resolve).catch(reject));
    });
}
