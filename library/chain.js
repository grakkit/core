"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chain = void 0;
function chain(base, modifier) {
    const chain = (object) => modifier(object, chain);
    chain(base);
}
exports.chain = chain;
