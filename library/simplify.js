"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplify = void 0;
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
