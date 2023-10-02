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
const fabric_1 = require("../utils/fabric");
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
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
                for (let hash of Mod.latestFiles[0].hashes) {
                    if (hash.algo == 1) {
                        latestFile.hashes.sha1 = hash.value;
                    }
                }
                latestFile.date = (0, moment_1.default)(Mod.latestFiles[0].fileDate);
                latestFile.downloadURL = Mod.latestFiles[0].downloadUrl;
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
            const fileInfo = (yield axios_1.default.get(`https://api.curseforge.com/v1/mods/${modId}/files?gameVersion=${game_version}&modLoaderType=${modLoaders[modLoader]}`, {
                headers: {
                    'x-api-key': this.apiKey
                }
            })).data.data;
            const modFile = new BaseModFile_1.BaseModFile();
            modFile.date = (0, moment_1.default)(fileInfo.fileDate);
            for (let hash of fileInfo.hashes) {
                if (hash.algo == 1) {
                    modFile.hashes.sha1 = hash.value;
                }
            }
            modFile.downloadURL = fileInfo.downloadUrl;
            return modFile;
        });
    }
    getUrlBySlug(slug) {
        return "https://www.curseforge.com/minecraft/mc-mods/" + slug;
    }
    convertFromEzpack(manifest, mods, path, mcVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = `${path}/${this.name}-${mcVersion}.zip`;
            let modList = "<ul>\n";
            let cfManifest = {
                "minecraft": {
                    "version": mcVersion,
                    "modLoaders": [
                        {
                            "id": manifest.modloader + '-' + (yield (0, fabric_1.getLatestVersion)()),
                            "primary": true
                        }
                    ]
                },
                "manifestType": "minecraftModpack",
                "manifestVersion": 1,
                "name": manifest.name,
                "version": manifest.version,
                "author": manifest.author,
                "files": []
            };
            let overrideMods = [];
            for (let mod of mods) {
                const modInfo = mod.mirrors[this.name];
                if (modInfo) {
                    let mirrorModInfo = (yield axios_1.default.get("https://api.curseforge.com/v1/mods/" + modInfo.id, {
                        headers: {
                            "x-api-key": this.apiKey
                        }
                    })).data.data;
                    modList += `<li><a href="https://www.curseforge.com/minecraft/mc-mods/${mirrorModInfo.slug}">${mirrorModInfo.name} (by ${mirrorModInfo.authors[0].name})</a></li>\n`;
                    cfManifest.files.push({
                        "projectID": modInfo.id,
                        "fileID": mirrorModInfo.latestFiles[0].id,
                        "required": true,
                    });
                }
                else {
                    const mirrorClass = require(__dirname + "/../mirrors/" + Object.keys(mod.mirrors)[0]);
                    const mirror = new mirrorClass();
                    const modFile = yield mirror.getModFileByGameVersion(mcVersion, Object.values(mod.mirrors)[0].id, 'fabric');
                    if (!modFile) {
                        continue;
                    }
                    if (!modFile.downloadURL) {
                        console.log("Cannot download mod:", mod.slug);
                        console.log("You can manually download mod and put mod into the file.");
                    }
                    overrideMods.push(modFile.downloadURL);
                }
            }
            modList += "</ul>";
            const output = fs_1.default.createWriteStream(filePath);
            const archive = (0, archiver_1.default)('zip', {
                zlib: { level: 0 }
            });
            archive.pipe(output);
            archive.append(modList, { name: 'modlist.html' });
            archive.append(JSON.stringify(cfManifest), { name: 'manifest.json' });
            for (let modUrl of overrideMods) {
                archive.append((yield axios_1.default.get(modUrl)).data, { name: 'overrides/mods/' + decodeURIComponent(modUrl.split('/').pop()) });
            }
            yield archive.finalize();
            return filePath;
        });
    }
};
