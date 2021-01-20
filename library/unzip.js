"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unzip = void 0;
const core_1 = require("./core");
const type_1 = require("./type");
const file_1 = require("./file");
const FileOutputStream = type_1.type('java.io.FileOutputStream');
const ZipInputStream = type_1.type('java.util.zip.ZipInputStream');
function unzip(from, to) {
    return core_1.sync(async () => {
        to = file_1.file(to);
        let entry;
        const stream = new ZipInputStream(from);
        try {
            while ((entry = stream.getNextEntry())) {
                try {
                    const target = to.file(entry.getName());
                    if (entry.isDirectory()) {
                        target.directory();
                    }
                    else {
                        const output = new FileOutputStream(target.entry().io);
                        try {
                            stream.transferTo(output);
                            output.close();
                        }
                        catch (error) {
                            output.close();
                            throw error;
                        }
                    }
                    stream.closeEntry();
                }
                catch (error) {
                    stream.closeEntry();
                    throw error;
                }
            }
            stream.close();
            from.close();
        }
        catch (error) {
            stream.close();
            from.close();
            throw error;
        }
    });
}
exports.unzip = unzip;
