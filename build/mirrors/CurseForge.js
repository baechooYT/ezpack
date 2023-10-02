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
                return {
                    slug: slug,
                    mirror: this,
                    idFromMirror: Mod.id,
                    links: {
                        sourceURL: Mod.links.sourceUrl ? Mod.links.sourceUrl : ""
                    },
                    latestFileDate: (0, moment_1.default)(Mod.latestFiles[0].fileDate)
                };
            }
            catch (e) {
                console.log(e);
                return undefined;
            }
        });
    }
    getUrlBySlug(slug) {
        return "https://www.curseforge.com/minecraft/mc-mods/" + slug;
    }
};
