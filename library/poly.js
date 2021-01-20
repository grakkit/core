"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTimeout = exports.setInterval = exports.queueMicrotask = exports.clearTimeout = exports.clearInterval = exports.btoa = exports.atob = void 0;
const task_1 = require("./task");
const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const promise = Promise.resolve();
const storage = { index: 0, list: new Map() };
function atob(data) {
    let index = 0;
    let result = '';
    while (index < data.length) {
        let a = base.indexOf(data.charAt(index++));
        let b = base.indexOf(data.charAt(index++));
        let c = ((a & 0xf) << 4) | ((b >> 2) & 0xf);
        let d = ((b & 0x3) << 6) | (base.indexOf(data.charAt(index++)) & 0x3f);
        result += String.fromCharCode(((base.indexOf(data.charAt(index++)) & 0x3f) << 2) | ((a >> 4) & 0x3));
        result += c ? String.fromCharCode(c) : '';
        result += d ? String.fromCharCode(d) : '';
    }
    return result;
}
exports.atob = atob;
function btoa(data) {
    let index = 0;
    let result = '';
    while (index < data.length) {
        let a = data.charCodeAt(index++) || 0;
        let b = data.charCodeAt(index++) || 0;
        let c = data.charCodeAt(index++) || 0;
        let d = ((b & 0xf) << 2) | ((c >> 6) & 0x3);
        let e = c & 0x3f;
        b ? c || (e = 64) : (d = e = 64);
        result += base.charAt((a >> 2) & 0x3f);
        result += base.charAt(((a & 0x3) << 4) | ((b >> 4) & 0xf));
        result += base.charAt(d);
        result += base.charAt(e);
    }
    return result;
}
exports.btoa = btoa;
function clearInterval(handle) {
    task_1.cancel(storage.list.get(handle));
}
exports.clearInterval = clearInterval;
function clearTimeout(handle) {
    task_1.cancel(storage.list.get(handle));
}
exports.clearTimeout = clearTimeout;
function queueMicrotask(callback) {
    promise.then(callback).catch((error) => {
        task_1.timeout(() => {
            throw error;
        });
    });
}
exports.queueMicrotask = queueMicrotask;
function setInterval(script, period = 0, ...args) {
    storage.list.set(storage.index, task_1.interval(typeof script === 'string' ? () => Polyglot.eval('js', script) : script, Math.ceil(period / 50), ...args));
    return storage.index++;
}
exports.setInterval = setInterval;
function setTimeout(script, period = 0, ...args) {
    storage.list.set(storage.index, task_1.timeout(typeof script === 'string' ? () => Polyglot.eval('js', script) : script, Math.ceil(period / 50), ...args));
    return storage.index++;
}
exports.setTimeout = setTimeout;
