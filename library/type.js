"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = void 0;
const storage = new Map();
function type(name) {
    storage.has(name) || storage.set(name, Java.type(name));
    return storage.get(name);
}
exports.type = type;
