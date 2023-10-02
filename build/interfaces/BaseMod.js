"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMod = void 0;
const BaseMirror_1 = require("../classes/BaseMirror");
const BaseModFile_1 = require("./BaseModFile");
class BaseMod {
    constructor() {
        this.slug = "";
        this.idFromMirror = "";
        this.mirror = new BaseMirror_1.BaseMirror();
        this.latestFile = new BaseModFile_1.BaseModFile();
    }
}
exports.BaseMod = BaseMod;
