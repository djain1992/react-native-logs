"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileAsyncTransport = void 0;
const EXPOFSappend = (FS, file, msg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileInfo = yield FS.getInfoAsync(file);
        if (!fileInfo.exists) {
            yield FS.writeAsStringAsync(file, msg);
            return true;
        }
        else {
            const prevFile = yield FS.readAsStringAsync(file);
            const newMsg = prevFile + msg;
            yield FS.writeAsStringAsync(file, newMsg);
            return true;
        }
    }
    catch (error) {
        console.error(error);
        return false;
    }
});
const RNFSappend = (FS, file, msg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield FS.appendFile(file, msg, "utf8");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
});
const fileAsyncTransport = (props) => {
    var _a, _b, _c;
    let WRITE;
    let fileName = "log";
    let filePath;
    if (!((_a = props === null || props === void 0 ? void 0 : props.options) === null || _a === void 0 ? void 0 : _a.FS)) {
        throw Error(`react-native-logs: fileAsyncTransport - No FileSystem instance provided`);
    }
    if (props.options.FS.DocumentDirectoryPath && props.options.FS.appendFile) {
        WRITE = RNFSappend;
        filePath = props.options.FS.DocumentDirectoryPath;
    }
    else if (props.options.FS.documentDirectory &&
        props.options.FS.writeAsStringAsync &&
        props.options.FS.readAsStringAsync &&
        props.options.FS.getInfoAsync) {
        WRITE = EXPOFSappend;
        filePath = props.options.FS.documentDirectory;
    }
    else {
        throw Error(`react-native-logs: fileAsyncTransport - FileSystem not supported`);
    }
    if ((_b = props === null || props === void 0 ? void 0 : props.options) === null || _b === void 0 ? void 0 : _b.fileName)
        fileName = props.options.fileName;
    if ((_c = props === null || props === void 0 ? void 0 : props.options) === null || _c === void 0 ? void 0 : _c.filePath)
        filePath = props.options.filePath;
    let output = `${props === null || props === void 0 ? void 0 : props.msg}\n`;
    var path = filePath + "/" + fileName;
    WRITE(props.options.FS, path, output);
};
exports.fileAsyncTransport = fileAsyncTransport;
