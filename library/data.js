"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
const file_1 = require("./file");
const type_1 = require("./type");
const simplify_1 = require("./simplify");
const core_1 = require("./core");
const Paths = type_1.type('java.nio.file.Paths');
const storage = new Map();
function data(path, ...more) {
    const name = Paths.get(path, ...more).normalize().toString();
    storage.has(name) || storage.set(name, file_1.file(core_1.root, 'data', `${name}.json`).json() || {});
    return storage.get(name);
}
exports.data = data;
core_1.hook(() => {
    for (const [name] of storage) {
        file_1.file(core_1.root, 'data', `${name}.json`).entry().write(JSON.stringify(simplify_1.simplify(storage.get(name))));
    }
});
