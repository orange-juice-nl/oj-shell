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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = exports.command = exports.shell = void 0;
var child_process_1 = require("child_process");
var shell = function (_a, handle, options) {
    var exe = _a[0], args = _a.slice(1);
    if (options === void 0) { options = {}; }
    var process = child_process_1.spawn(exe, args, options);
    var promise = new Promise(function (res, rej) {
        var data = [];
        var tail = [];
        var ondata = function (d) {
            d = d.toString();
            tail.push(d);
            if (tail.length > 6)
                tail.shift();
            if (handle) {
                var n = handle(d);
                if (n)
                    d = n;
            }
            if (d)
                data.push(d);
        };
        var handled = false;
        var handleClose = function (code) {
            if (handled)
                return;
            if (code == null || code > 0)
                rej(tail.join("\r\n"));
            else
                res(data);
            handled = true;
        };
        process.stdout.on("data", ondata);
        process.stderr.setEncoding("utf8");
        process.stderr.on("data", ondata);
        process.on("close", handleClose);
        process.on("disconnect", handleClose);
        process.on("exit", handleClose);
    });
    return {
        promise: promise,
        process: process,
    };
};
exports.shell = shell;
var command = function (cmd) { return __awaiter(void 0, void 0, void 0, function () {
    var config, opts, script, sh, promise;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, ((_a = cmd.init) === null || _a === void 0 ? void 0 : _a.call(cmd))];
            case 1:
                config = (_b = _e.sent()) !== null && _b !== void 0 ? _b : undefined;
                return [4 /*yield*/, ((_c = cmd.options) === null || _c === void 0 ? void 0 : _c.call(cmd, config))];
            case 2:
                opts = (_d = _e.sent()) !== null && _d !== void 0 ? _d : {};
                script = cmd.script(config);
                if (opts.console)
                    console.info(script);
                sh = exports.shell(script, cmd.handle ? function (d) { return cmd.handle(config, d); } : undefined, opts);
                promise = sh.promise
                    .then(function (data) { var _a; return (_a = cmd.resolve) === null || _a === void 0 ? void 0 : _a.call(cmd, config, data); })
                    .finally(function () { var _a; return (_a = cmd.clean) === null || _a === void 0 ? void 0 : _a.call(cmd, config); });
                return [2 /*return*/, {
                        promise: promise,
                        process: sh.process,
                        kill: function () {
                            sh.process.stdin.write("q");
                            setTimeout(function () {
                                if (!sh.process.killed)
                                    sh.process.kill("SIGKILL");
                            }, 5000);
                            return sh.promise;
                        }
                    }];
        }
    });
}); };
exports.command = command;
var parseArgs = function (args) {
    return (typeof args === "string" ? args.split(" ") : args)
        .reduce(function (s, x) {
        var _a;
        return Object.assign(s, (_a = {}, _a[x.substr(0, 1)] = x.substr(1), _a));
    }, {});
};
exports.parseArgs = parseArgs;
