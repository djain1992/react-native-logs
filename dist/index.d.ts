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
/** Import preset transports */
import { consoleTransport } from "./transports/consoleTransport";
import { fileAsyncTransport } from "./transports/fileAsyncTransport";
import { sentryTransport } from "./transports/sentryTransport";
/** Types Declaration */
declare type transportFunctionType = (props: {
    msg: any;
    rawMsg: any;
    level: {
        severity: number;
        text: string;
    };
    extension?: string | null;
    options?: any;
}) => any;
declare type levelsType = {
    [key: string]: number;
};
declare type levelLogMethodType = (...msgs: any[]) => boolean;
declare type extendedLogType = {
    [key: string]: levelLogMethodType | any;
};
declare type configLoggerType = {
    severity?: string;
    transport?: transportFunctionType;
    transportOptions?: any;
    levels?: levelsType;
    async?: boolean;
    asyncFunc?: Function;
    dateFormat?: "time" | "local" | "utc" | "iso" | "custom";
    printLevel?: boolean;
    printDate?: boolean;
    enabled?: boolean;
    enabledExtensions?: string[] | string | null;
};
/** Logger Main Class */
declare class logs {
    private _levels;
    private _level;
    private _transport;
    private _transportOptions;
    private _asyncFunc;
    private _async;
    private _dateFormat;
    private _printLevel;
    private _printDate;
    private _enabled;
    private _enabledExtensions;
    private _extensions;
    private _extendedLogs;
    constructor(config?: configLoggerType);
    /** Log messages methods and level filter */
    private _log;
    private _sendToTransport;
    private _formatConsoleDate;
    private _formatMsg;
    /** Return true if level is enabled */
    private _isLevelEnabled;
    /** Return true if extension is enabled */
    private _isExtensionEnabled;
    /** Extend logger with a new extension */
    extend: (extension: string) => extendedLogType;
    /** Enable an extension */
    enable: (extension: string) => boolean;
    /** Disable an extension */
    disable: (extension: string) => boolean;
    /** Return all created extensions */
    getExtensions: () => string[];
    /** Set log severity API */
    setSeverity: (level: string) => string;
    /** Get current log severity API */
    getSeverity: () => string;
}
/** Extend logs Class with generic types to avoid typescript errors on dynamic log methods */
declare class logTyped extends logs {
    [key: string]: any;
}
declare const logger: {
    createLogger: (config?: configLoggerType | undefined) => logTyped;
};
export { logger, transportFunctionType, configLoggerType, consoleTransport, fileAsyncTransport, sentryTransport, };
