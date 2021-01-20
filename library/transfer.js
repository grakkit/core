"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfer = void 0;
const type_1 = require("./type");
const core_1 = require("./core");
const chain_1 = require("./chain");
const file_1 = require("./file");
const Files = type_1.type('java.nio.file.Files');
const StandardCopyOption = type_1.type('java.nio.file.StandardCopyOption');
function transfer(from, to, operation) {
    return core_1.sync(async () => {
        from = typeof from === 'string' ? file_1.file(from).io : 'io' in from ? from.io : from;
        to = typeof to === 'string' ? file_1.file(to).io : 'io' in to ? to.io : to;
        chain_1.chain([from, to], (io, loop) => {
            if (io[0].isDirectory()) {
                file_1.file(io[1].getPath()).directory();
                for (const from of [...io[0].listFiles()])
                    loop([from, file_1.file(io[1].getPath(), from.getName()).io]);
            }
            else if (io[0].exists() && !io[1].exists()) {
                Files[operation](io[0].toPath(), io[1].toPath(), StandardCopyOption.COPY_ATTRIBUTES, StandardCopyOption.REPLACE_EXISTING);
            }
        });
    });
}
exports.transfer = transfer;
