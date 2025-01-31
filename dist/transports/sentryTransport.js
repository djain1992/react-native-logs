"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentryTransport = void 0;
const sentryTransport = props => {
    var _a;
    if (!((_a = props === null || props === void 0 ? void 0 : props.options) === null || _a === void 0 ? void 0 : _a.SENTRY)) {
        throw Error(`react-native-logs: sentryTransport - No sentry instance provided`);
    }
    if (props.rawMsg && props.rawMsg.stack && props.rawMsg.message) {
        // this is probably a JS error
        props.options.SENTRY.captureException(props.rawMsg);
    }
    else {
        props.options.SENTRY.captureException(props.msg);
    }
    return true;
};
exports.sentryTransport = sentryTransport;
