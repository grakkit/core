"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = void 0;
const core_1 = require("./core");
const type_1 = require("./type");
const Scanner = type_1.type('java.util.Scanner');
const URL = type_1.type('java.net.URL');
function fetch(link) {
    const net = new URL(link).openConnection();
    net.setDoOutput(true);
    net.setRequestMethod('GET');
    net.setInstanceFollowRedirects(true);
    const thing = {
        net,
        json(async) {
            if (async) {
                return core_1.sync(async () => thing.json());
            }
            else {
                try {
                    return JSON.parse(thing.read());
                }
                catch (error) {
                    throw error;
                }
            }
        },
        read(async) {
            if (async) {
                return core_1.sync(async () => thing.read());
            }
            else {
                return new Scanner(thing.stream()).useDelimiter('\\A').next();
            }
        },
        stream(async) {
            if (async) {
                return core_1.sync(async () => thing.stream());
            }
            else {
                const code = net.getResponseCode();
                switch (code) {
                    case 200:
                        return net.getInputStream();
                    default:
                        throw new ReferenceError(`${code} ${net.getResponseMessage()}`);
                }
            }
        }
    };
    return thing;
}
exports.fetch = fetch;
