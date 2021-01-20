"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.core = void 0;
const data_1 = require("./library/data");
const file_1 = require("./library/file");
const type_1 = require("./library/type");
const array_1 = require("./library/array");
const chain_1 = require("./library/chain");
const fetch_1 = require("./library/fetch");
const unzip_1 = require("./library/unzip");
const simplify_1 = require("./library/simplify");
const transfer_1 = require("./library/transfer");
const meta = require("./library/core");
const poly = require("./library/poly");
const task = require("./library/task");
const format = require("./library/format");
const console = require("./library/console");
exports.core = {
    array: array_1.array,
    chain: chain_1.chain,
    console,
    data: data_1.data,
    fetch: fetch_1.fetch,
    file: file_1.file,
    format,
    meta,
    reload() {
        Core.push(Core.swap);
    },
    simplify: simplify_1.simplify,
    task,
    transfer: transfer_1.transfer,
    type: type_1.type,
    unzip: unzip_1.unzip
};
Object.assign(globalThis, poly, {
    global: globalThis
});
