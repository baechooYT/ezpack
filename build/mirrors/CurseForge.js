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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseMirror_1 = require("../classes/BaseMirror");
const BaseMod_1 = require("../interfaces/BaseMod");
const axios_1 = __importDefault(require("axios"));
const BaseModFile_1 = require("../interfaces/BaseModFile");
const moment_1 = __importDefault(require("moment"));
class CurseForgeMod extends BaseMod_1.BaseMod {
}
module.exports = class CurseForge extends BaseMirror_1.BaseMirror {
    constructor() {
        super(...arguments);
        this.name = "CurseForge";
        this.apiKey = "$2a$10$Hwk1pMaOPZpEGc50yMeJL.rNqVj1b9rmCO9nCR40d6cchHqsbQCOe";
    }
    getModBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const SearchResult = yield axios_1.default.get("https://api.curseforge.com/v1/mods/search?gameId=432&slug=" + slug, {
                    headers: {
                        'x-api-key': this.apiKey
                    }
                });
                if (!SearchResult.data.data[0]) {
                    return undefined;
                }
                const Mod = SearchResult.data.data[0];
                const latestFile = new BaseModFile_1.BaseModFile();
                let latestFileInfo = Mod.latestFiles[0];
                for (let FileInfo of Mod.latestFiles) {
                    if ((0, moment_1.default)(FileInfo.fileDate).isAfter((0, moment_1.default)(latestFileInfo.fileDate))) {
                        latestFileInfo = FileInfo;
                    }
                }
                for (let hash of Mod.latestFiles[0].hashes) {
                    if (hash.algo == 1) {
                        latestFile.hashes.sha1 = hash.value;
                    }
                }
                latestFile.date = (0, moment_1.default)(latestFileInfo.fileDate);
                latestFile.downloadURL = latestFileInfo.downloadUrl;
                latestFile.id = latestFileInfo.id;
                return {
                    slug: slug,
                    mirror: this,
                    idFromMirror: Mod.id,
                    latestFile: latestFile
                };
            }
            catch (e) {
                console.log(e);
                return undefined;
            }
        });
    }
    getModFileByGameVersion(game_version, modId, modLoader) {
        return __awaiter(this, void 0, void 0, function* () {
            let modLoaders = {
                "fabric": 4
            };
            const files = (yield axios_1.default.get(`https://api.curseforge.com/v1/mods/${modId}/files?modLoaderType=${modLoaders[modLoader]}`, {
                headers: {
                    'x-api-key': this.apiKey
                }
            })).data.data;
            let fileInfo = files[0];
            for (let file of files) {
                const baseVersion = game_version.split(".")[0] + '.' + game_version.split(".")[1];
                if (file.gameVersions.includes(baseVersion)) {
                    fileInfo = file;
                }
            }
            for (let file of files) {
                if (file.gameVersions.includes(game_version)) {
                    fileInfo = file;
                }
            }
            const modFile = new BaseModFile_1.BaseModFile();
            modFile.date = (0, moment_1.default)(fileInfo.fileDate);
            for (let hash of fileInfo.hashes) {
                if (hash.algo == 1) {
                    modFile.hashes.sha1 = hash.value;
                }
            }
            modFile.downloadURL = fileInfo.downloadUrl;
            modFile.id = fileInfo.id;
            return modFile;
        });
    }
    getUrlBySlug(slug) {
        return "https://www.curseforge.com/minecraft/mc-mods/" + slug;
    }
};
