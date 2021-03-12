"use strict";
/**
 * REACT-NATIVE-LOGS
 * Alessandro Bottamedi - a.bottamedi@me.com
 *
 * Performance-aware simple logger for React-Native with custom levels and transports (colored console, file writing, etc.)
 *
 * MIT license
 *
 * Copyright (c) 2021 Alessandro Bottamedi.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentryTransport = exports.fileAsyncTransport = exports.consoleTransport = exports.logger = void 0;
/** Import preset transports */
const consoleTransport_1 = require("./transports/consoleTransport");
Object.defineProperty(exports, "consoleTransport", { enumerable: true, get: function () { return consoleTransport_1.consoleTransport; } });
const fileAsyncTransport_1 = require("./transports/fileAsyncTransport");
Object.defineProperty(exports, "fileAsyncTransport", { enumerable: true, get: function () { return fileAsyncTransport_1.fileAsyncTransport; } });
const sentryTransport_1 = require("./transports/sentryTransport");
Object.defineProperty(exports, "sentryTransport", { enumerable: true, get: function () { return sentryTransport_1.sentryTransport; } });
let asyncFunc;
try {
    const InteractionManager = require("react-native").InteractionManager;
    asyncFunc = InteractionManager.runAfterInteractions;
}
catch (e) {
    asyncFunc = (cb) => {
        setTimeout(() => {
            return cb();
        }, 0);
    };
}
/** Reserved key log string to avoid overwriting other methods or properties */
const reservedKey = [
    "extend",
    "enable",
    "disable",
    "getExtensions",
    "setSeverity",
    "getSeverity",
];
/** Default configuration parameters for logger */
const defaultLogger = {
    severity: "debug",
    transport: consoleTransport_1.consoleTransport,
    transportOptions: {},
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    },
    async: false,
    asyncFunc: asyncFunc,
    dateFormat: "time",
    printLevel: true,
    printDate: true,
    enabled: true,
    enabledExtensions: null,
};
/** Logger Main Class */
class logs {
    constructor(config) {
        this._enabledExtensions = null;
        this._extensions = [];
        this._extendedLogs = {};
        /** Log messages methods and level filter */
        this._log = (level, extension, ...msgs) => {
            if (this._async) {
                return this._asyncFunc(() => {
                    this._sendToTransport(level, extension, msgs);
                });
            }
            else {
                return this._sendToTransport(level, extension, msgs);
            }
        };
        this._sendToTransport = (level, extension, msgs) => {
            if (!this._enabled)
                return false;
            if (!this._isLevelEnabled(level)) {
                return false;
            }
            if (extension && !this._isExtensionEnabled(extension)) {
                return false;
            }
            let msg = this._formatMsg(level, extension, msgs);
            let transportProps = {
                msg: msg,
                rawMsg: msgs,
                level: { severity: this._levels[level], text: level },
                extension: extension,
                options: this._transportOptions,
            };
            this._transport(transportProps);
            return true;
        };
        this._formatConsoleDate = (date) => {
            const dateFormat = require('dateformat');
            return dateFormat(date, 'ddd, mmm d, yyyy, h:MM:ss:l TT');
        };
        this._formatMsg = (level, extension, msgs) => {
            let nameTxt = "";
            if (extension) {
                nameTxt = `${extension} | `;
            }
            let dateTxt = "";
            if (this._printDate) {
                switch (this._dateFormat) {
                    case "time":
                        dateTxt = `${new Date().toLocaleTimeString()} | `;
                        break;
                    case "local":
                        dateTxt = `${new Date().toLocaleString()} | `;
                        break;
                    case "utc":
                        dateTxt = `${new Date().toUTCString()} | `;
                        break;
                    case "iso":
                        dateTxt = `${new Date().toISOString()} | `;
                        break;
                    case "custom":
                        dateTxt = `${this._formatConsoleDate(new Date())} | `;
                        break;
                    default:
                        break;
                }
            }
            let levelTxt = "";
            if (this._printLevel) {
                levelTxt = `${level.toUpperCase()} | `;
            }
            let stringMsg = dateTxt + nameTxt + levelTxt;
            if (Array.isArray(msgs)) {
                for (let i = 0; i < msgs.length; ++i) {
                    let msg = msgs[i];
                    if (typeof msg === "string") {
                        stringMsg += msg;
                    }
                    else if (typeof msg === "function") {
                        stringMsg += "[function]";
                    }
                    else if (msgs[i] && msgs[i].stack && msgs[i].message) {
                        stringMsg += msgs[i].message;
                    }
                    else {
                        try {
                            stringMsg += JSON.stringify(msg);
                        }
                        catch (error) {
                            stringMsg += "Undefined Error";
                        }
                    }
                    if (msgs.length > i + 1) {
                        stringMsg += " ";
                    }
                }
            }
            else if (typeof msgs === "string") {
                stringMsg += msgs;
            }
            else if (typeof msgs === "function") {
                stringMsg += "[function]";
            }
            else if (msgs && msgs.stack && msgs.message) {
                stringMsg += msgs.message;
            }
            else if (msgs) {
                try {
                    stringMsg += JSON.stringify(msgs);
                }
                catch (error) {
                    stringMsg += "Undefined Error";
                }
            }
            return stringMsg;
        };
        /** Return true if level is enabled */
        this._isLevelEnabled = (level) => {
            if (this._levels[level] < this._levels[this._level]) {
                return false;
            }
            return true;
        };
        /** Return true if extension is enabled */
        this._isExtensionEnabled = (extension) => {
            if (!this._enabledExtensions || !this._enabledExtensions[extension])
                return false;
            return true;
        };
        /** Extend logger with a new extension */
        this.extend = (extension) => {
            if (this._extensions.includes(extension)) {
                return this._extendedLogs[extension];
            }
            this._extendedLogs[extension] = {};
            this._extensions.push(extension);
            let extendedLog = this._extendedLogs[extension];
            Object.keys(this._levels).forEach((level) => {
                extendedLog[level] = (...msgs) => {
                    this._log(level, extension, ...msgs);
                };
                extendedLog["extend"] = (extension) => {
                    throw Error(`react-native-logs: you cannot extend a logger from an already extended logger`);
                };
                extendedLog["enable"] = (extension) => {
                    throw Error(`react-native-logs: You cannot enable a logger from extended logger`);
                };
                extendedLog["disable"] = (extension) => {
                    throw Error(`react-native-logs: You cannot disable a logger from extended logger`);
                };
                extendedLog["getExtensions"] = () => {
                    throw Error(`react-native-logs: You cannot get extensions from extended logger`);
                };
                extendedLog["setSeverity"] = (level) => {
                    throw Error(`react-native-logs: You cannot set severity from extended logger`);
                };
                extendedLog["getSeverity"] = () => {
                    throw Error(`react-native-logs: You cannot get severity from extended logger`);
                };
            });
            return extendedLog;
        };
        /** Enable an extension */
        this.enable = (extension) => {
            if (!extension) {
                this._enabled = true;
                return true;
            }
            if (!this._enabledExtensions)
                this._enabledExtensions = {};
            this._enabled = true;
            this._enabledExtensions[extension] = true;
            return true;
        };
        /** Disable an extension */
        this.disable = (extension) => {
            if (!extension) {
                this._enabled = false;
                return true;
            }
            if (!this._enabledExtensions)
                return true;
            this._enabledExtensions[extension] = false;
            return true;
        };
        /** Return all created extensions */
        this.getExtensions = () => {
            return this._extensions;
        };
        /** Set log severity API */
        this.setSeverity = (level) => {
            if (level in this._levels) {
                this._level = level;
            }
            else {
                throw Error(`react-native-logs: Level [${level}] not exist`);
            }
            return this._level;
        };
        /** Get current log severity API */
        this.getSeverity = () => {
            return this._level;
        };
        this._levels = defaultLogger.levels;
        this._level = defaultLogger.severity;
        this._transport = defaultLogger.transport;
        this._transportOptions = null;
        this._asyncFunc = defaultLogger.asyncFunc;
        this._async = defaultLogger.async;
        this._dateFormat = defaultLogger.dateFormat;
        this._printLevel = defaultLogger.printLevel;
        this._printDate = defaultLogger.printDate;
        this._enabled = defaultLogger.enabled;
        /** Check if config levels property exist and set it */
        if (config &&
            config.levels &&
            typeof config.levels === "object" &&
            Object.keys(config.levels).length > 0) {
            this._levels = config.levels;
        }
        /** Check if config level property exist and set it */
        if (config && config.severity) {
            this._level = config.severity;
        }
        if (!this._levels.hasOwnProperty(this._level)) {
            this._level = Object.keys(this._levels)[0];
        }
        /** Check if config transport property exist and set it */
        if (config && config.transport) {
            this._transport = config.transport;
        }
        /** Check if config transportOptions property exist and set it */
        if (config && config.transportOptions) {
            this._transportOptions = Object.assign(Object.assign({}, defaultLogger.transportOptions), config.transportOptions);
        }
        /** Check if config asyncFunc property exist and set it */
        if (config && config.asyncFunc) {
            this._asyncFunc = config.asyncFunc;
        }
        /** Check if config async property exist and set it */
        if (config && typeof config.async !== "undefined") {
            this._async = config.async;
        }
        /** Check if config dateFormat property exist and set it */
        if (config && config.dateFormat) {
            this._dateFormat = config.dateFormat;
        }
        /** Check if config printLevel property exist and set it */
        if (config && typeof config.printLevel !== "undefined") {
            this._printLevel = config.printLevel;
        }
        /** Check if config printDate property exist and set it */
        if (config && typeof config.printDate !== "undefined") {
            this._printDate = config.printDate;
        }
        /** Check if config enabled property exist and set it */
        if (config && typeof config.enabled !== "undefined") {
            this._enabled = config.enabled;
        }
        /** Check if config printDate property exist and set it */
        if (config && config.enabledExtensions) {
            if (Array.isArray(config.enabledExtensions)) {
                for (let i = 0; i < config.enabledExtensions.length; ++i) {
                    this.enable(config.enabledExtensions[i]);
                }
            }
            else if (typeof config.enabledExtensions === "string") {
                this.disable(config.enabledExtensions);
            }
        }
        /** Bind correct log levels methods */
        let _this = this;
        Object.keys(this._levels).forEach((level) => {
            if (typeof level !== "string") {
                throw Error(`react-native-logs: levels must be strings`);
            }
            if (level[0] === "_") {
                throw Error(`react-native-logs: keys with first char "_" is reserved and cannot be used as levels`);
            }
            if (reservedKey.indexOf(level) !== -1) {
                throw Error(`react-native-logs: [${level}] is a reserved key, you cannot set it as custom level`);
            }
            if (typeof this._levels[level] === "number") {
                _this[level] = this._log.bind(this, level, null);
            }
            else {
                throw Error(`react-native-logs: [${level}] wrong level config`);
            }
        }, this);
    }
}
/** Extend logs Class with generic types to avoid typescript errors on dynamic log methods */
class logTyped extends logs {
}
/**
 * Create a logger object. All params will take default values if not passed.
 * each levels has its level severity so we can filter logs with < and > operators
 * all subsequent levels to the one selected will be exposed (ordered by severity asc)
 * through the transport
 */
const createLogger = (config) => {
    return new logTyped(config);
};
const logger = { createLogger };
exports.logger = logger;
