"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = exports.push = exports.hook = exports.root = void 0;
const file_1 = require("./file");
exports.root = file_1.file(Core.getRoot());
function hook(script) {
    Core.hook(script);
}
exports.hook = hook;
function push(script) {
    Core.push(script);
}
exports.push = push;
function sync(script) {
    return new Promise((resolve, reject) => {
        Core.sync(() => script().then(resolve).catch(reject));
    });
}
exports.sync = sync;
