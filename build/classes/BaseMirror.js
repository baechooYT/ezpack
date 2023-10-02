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
exports.BaseMirror = void 0;
const BaseModFile_1 = require("../interfaces/BaseModFile");
class BaseMirror {
    constructor() {
        this.name = "Example";
    }
    getModBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return { mirror: this, slug: "", idFromMirror: "", latestFile: new BaseModFile_1.BaseModFile() };
            }
            catch (e) {
                console.log(e);
                return undefined;
            }
        });
    }
    getUrlBySlug(slug) {
        return "https://example.com/" + slug;
    }
    getModFileByGameVersion(game_version, modId, modLoader) {
        return __awaiter(this, void 0, void 0, function* () {
            return new BaseModFile_1.BaseModFile();
        });
    }
    convertFromEzpack(manifest, mods, path, mcVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
}
exports.BaseMirror = BaseMirror;
