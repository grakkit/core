"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeout = exports.interval = exports.cancel = void 0;
const chain_1 = require("./chain");
const core_1 = require("./core");
const storage = { list: new Set(), tick: 0 };
function cancel(handle) {
    storage.list.delete(handle);
}
exports.cancel = cancel;
function interval(script, period = 0, ...args) {
    const task = timeout((...args) => {
        task.tick += Math.ceil(period < 1 ? 1 : period);
        script(...args);
    }, 0, ...args);
    return task;
}
exports.interval = interval;
function timeout(script, period = 0, ...args) {
    const task = { tick: storage.tick + Math.ceil(period < 0 ? 0 : period), args, script };
    storage.list.add(task);
    return task;
}
exports.timeout = timeout;
chain_1.chain(void 0, (none, next) => {
    core_1.push(next);
    for (const task of storage.list) {
        if (storage.tick > task.tick) {
            storage.list.delete(task);
        }
        else if (storage.tick === task.tick) {
            try {
                task.script(...task.args);
            }
            catch (error) {
                console.error('An error occured while attempting to execute a task!');
                console.error(error.stack || error.message || error);
            }
        }
    }
    ++storage.tick;
});
