"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = void 0;
const type_1 = require("./type");
const Iterable = type_1.type('java.lang.Iterable');
const Iterator = type_1.type('java.util.Iterator');
const Spliterator = type_1.type('java.util.Spliterator');
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
