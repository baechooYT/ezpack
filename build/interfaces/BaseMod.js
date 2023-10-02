"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMod = void 0;
const BaseMirror_1 = require("../classes/BaseMirror");
const moment_1 = __importDefault(require("moment"));
class BaseMod {
    constructor() {
        this.slug = "";
        this.idFromMirror = "";
        this.mirror = new BaseMirror_1.BaseMirror();
        this.links = {
            sourceURL: ""
        };
        this.latestFileDate = (0, moment_1.default)();
    }
}
exports.BaseMod = BaseMod;
