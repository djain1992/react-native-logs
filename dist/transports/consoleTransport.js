"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleTransport = void 0;
const webColors = [
    "",
    "color: dodgerblue;font-weight:bold",
    "color: orange;font-weight:bold;",
    "color: indianred;font-weight:bold;",
    "color: #fc2a66;font-weight:bold;",
    "color: #49ed21;font-weight:bold;",
    "color: #d69c51;font-weight:bold;",
    "color: #e2e83a;font-weight:bold;",
    "color: #2e7cd1;font-weight:bold;",
    "color: #4d1bc1;font-weight:bold;",
    "color: #b54ae2;font-weight:bold;",
];
const ansiColors = [
    "",
    "\x1B[94m",
    "\x1B[93m",
    "\x1B[91m",
    "\x1B[95m",
    "\x1B[96m",
    "\x1B[92m",
    "\x1B[35m",
    "\x1B[33m",
    "\x1B[34m",
    "\x1B[32m",
];
const colorEnd = "\x1B[0m";
const consoleTransport = (props) => {
    var _a, _b, _c, _d;
    if (((_a = props === null || props === void 0 ? void 0 : props.options) === null || _a === void 0 ? void 0 : _a.colors) === "ansi") {
        console.log(`${ansiColors[(_b = props === null || props === void 0 ? void 0 : props.level) === null || _b === void 0 ? void 0 : _b.severity]}${props === null || props === void 0 ? void 0 : props.msg}${colorEnd}`);
    }
    else if (((_c = props === null || props === void 0 ? void 0 : props.options) === null || _c === void 0 ? void 0 : _c.colors) === "web") {
        console.log(`%c${props === null || props === void 0 ? void 0 : props.msg}`, webColors[(_d = props === null || props === void 0 ? void 0 : props.level) === null || _d === void 0 ? void 0 : _d.severity] || "");
    }
    else {
        console.log(props === null || props === void 0 ? void 0 : props.msg);
    }
    return true;
};
exports.consoleTransport = consoleTransport;
