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
const axios_1 = __importDefault(require("axios"));
const BaseModFile_1 = require("../interfaces/BaseModFile");
const moment_1 = __importDefault(require("moment/moment"));
module.exports = class Modrinth extends BaseMirror_1.BaseMirror {
    constructor() {
        super(...arguments);
        this.name = "Modrinth";
    }
    getModBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Mod = (yield axios_1.default.get("https://api.modrinth.com/v2/project/" + slug)).data;
                if (!Mod) {
                    return undefined;
                }
                // Getting latest file
                const VersionData = (yield axios_1.default.get(`https://api.modrinth.com/v2/project/${slug}/version/${Mod.versions[Mod.versions.length - 1]}`)).data;
                const latestFile = new BaseModFile_1.BaseModFile();
                latestFile.hashes.sha1 = VersionData.files[0].hashes.sha1;
                latestFile.date = (0, moment_1.default)(VersionData.date_published);
                latestFile.downloadURL = VersionData.files[0].url;
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
            const versions = (yield axios_1.default.get(`https://api.modrinth.com/v2/project/${modId}/version`, {})).data;
            for (let version of versions) {
                if (version.game_versions.includes(game_version) && version.loaders.includes(modLoader)) {
                    const modFile = new BaseModFile_1.BaseModFile();
                    modFile.date = (0, moment_1.default)(version.date_published);
                    modFile.hashes.sha1 = version.files[0].hashes.sha1;
                    modFile.downloadURL = version.files[0].url;
                    return modFile;
                }
            }
            return undefined;
        });
    }
    getUrlBySlug(slug) {
        return "https://modrinth.com/mod/" + slug;
    }
    convertFromEzpack(manifest, mods, path, mcVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = `${path}/${this.name}-${mcVersion}.mrpack`;
            return filePath;
        });
    }
};
