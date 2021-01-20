"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complete = exports.execute = void 0;
const format_1 = require("./format");
function execute(context, ...args) {
    const self = globalThis.hasOwnProperty('self');
    self || (globalThis.self = context);
    try {
        const result = Polyglot.eval('js', args.join(' '));
        self || delete globalThis.self;
        return format_1.output(result);
    }
    catch (whoops) {
        self || delete globalThis.self;
        return format_1.error(whoops);
    }
}
exports.execute = execute;
function complete(context, ...args) {
    let body = '';
    let index = -1;
    let scope = globalThis;
    let valid = true;
    let string = false;
    let bracket = false;
    let comment = false;
    let property = '';
    const input = args.join(' ');
    while (valid && ++index < input.length) {
        const char = input[index];
        if (comment) {
            if (char === '*' && input[index + 1] === '/') {
                if (property) {
                    input[index + 2] === ';' && (comment = false);
                }
                else {
                    body = input.slice(0, index + 2);
                    comment = false;
                }
            }
        }
        else if (string) {
            if (char === '\\') {
                ++index;
            }
            else if (char === string) {
                scope = {};
                string = false;
            }
        }
        else if (bracket === true) {
            ["'", '"', '`'].includes(char) ? (bracket = char) : (valid = false);
        }
        else if (typeof bracket === 'string') {
            switch (char) {
                case '\\':
                    ++index;
                    break;
                case bracket:
                    bracket = -1;
                    break;
                default:
                    property += char;
            }
        }
        else {
            switch (char) {
                case '/':
                    switch (input[index + 1]) {
                        case '/':
                            valid = false;
                            break;
                        case '*':
                            comment = true;
                            break;
                    }
                    break;
                case "'":
                case '"':
                case '`':
                    bracket === -1 ? (valid = false) : (string = char);
                    break;
                case ')':
                case '{':
                case '}':
                    bracket || (scope = {});
                    break;
                case '.':
                case '[':
                    if (!bracket) {
                        if (char === '.' || property) {
                            body = input.slice(0, index + 1);
                            if (scope === globalThis && property === 'self' && !scope.hasOwnProperty('self')) {
                                scope = context;
                            }
                            else {
                                scope = scope[property] || {};
                            }
                            char === '.' || (bracket = true);
                            property = '';
                        }
                        else {
                            body = input.slice(0, index + 1);
                            scope = globalThis;
                        }
                    }
                    break;
                case ']':
                    bracket === -1 && (bracket = false);
                    break;
                case '\\':
                    typeof bracket === 'string' ? ++index : (valid = false);
                    break;
                case ' ':
                    property ? (valid = false) : (body = '');
                    break;
                default:
                    if (char.match(/[\+\-\*\/\^=!&\|\?:\(,;]/g)) {
                        if (!bracket) {
                            body = input.slice(0, index + 1);
                            scope = globalThis;
                            property = '';
                        }
                    }
                    else {
                        property += char;
                    }
            }
        }
    }
    if (valid && scope && !(comment || string)) {
        const properties = Object.getOwnPropertyNames(scope);
        scope === globalThis && !properties.includes('self') && properties.push('self');
        return properties
            .sort()
            .filter((element) => element.toLowerCase().includes(property.toLowerCase()))
            .filter((name) => bracket || name === (name.match(/[_A-Z$][_0-9A-Z$]*/gi) || [])[0])
            .map((name) => {
            if (bracket) {
                return `${body}\`${name.replace(/`/g, '\\`').split('\\').join('\\\\')}\`]`;
            }
            else {
                return `${body}${name}`;
            }
        });
    }
}
exports.complete = complete;
