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
const axios_1 = __importDefault(require("axios"));
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
function input(query) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}
function checkRedirect(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield axios_1.default.get(url)).request.res.responseUrl;
    });
}
function compareTimestamps(obj) {
    let result = [];
    let moments = Object.assign({}, obj);
    let values = Object.values(moments);
    let max = moment_1.default.max(values);
    for (let [key, value] of Object.entries(moments)) {
        if (!value.isSame(max)) {
            result.push(key);
        }
    }
    return result;
}
module.exports = {
    name: "add",
    description: "Adds a minecraft mod to modpack.",
    action: function (program) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const modsFile = JSON.parse(yield fs_1.default.readFileSync("./mods.json", 'utf-8'));
            // checks duplicate and deletes it
            let i = 0;
            for (let mod of modsFile) {
                if (mod.slug == program.args[1]) {
                    modsFile.splice(i, 1);
                }
                i++;
            }
            // pushes mirrors in to mirrors array
            const mirrors = [];
            const mods = [];
            yield fs_1.default.readdirSync(__dirname + "/../mirrors").forEach(function (f) {
                return __awaiter(this, void 0, void 0, function* () {
                    const mirror = require(__dirname + "/../mirrors/" + f);
                    mirrors.push(new mirror());
                });
            });
            const hashes = {};
            for (const v of mirrors) {
                const mod = yield v.getModBySlug(program.args[1]);
                if (!mod) {
                    continue;
                }
                mods.push(mod);
                hashes[mod.latestFile.hashes.sha1] = v.name;
            }
            if (Object.keys(hashes).length != 1) {
                let timestamps = {};
                for (let mod of mods) {
                    timestamps[mod.mirror.name] = (0, moment_1.default)(mod.latestFile.date).startOf('day');
                }
                let removedMirrors = compareTimestamps(timestamps);
                for (let removedMirror of removedMirrors) {
                    let i = 0;
                    for (let mod of mods) {
                        if (mod.mirror.name == removedMirror) {
                            mods.splice(i, 1);
                            console.log("!! Looks like mod has discontinued uploading to " + mod.mirror.name + ". !!");
                        }
                        i++;
                    }
                }
                if (removedMirrors.length >= 1) {
                    console.log("!! Modpack will be fine, but some features will not work in launcher !!");
                }
            }
            const parsedMods = {};
            for (let mod of mods) {
                parsedMods[mod.mirror.name] = {
                    id: mod.idFromMirror
                };
            }
            modsFile.push({
                slug: program.args[1],
                mirrors: parsedMods
            });
            yield fs_1.default.writeFileSync("./mods.json", JSON.stringify(modsFile));
            console.log(`Adding ${program.args[1]} to modpack was successful. Took: ${(Date.now() - startTime) / 1000}s`);
        });
    }
};
