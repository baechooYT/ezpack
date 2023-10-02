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
const readline = require('readline');
const fs_1 = __importDefault(require("fs"));
function input(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
}
module.exports = {
    name: "init",
    description: "Initalize an ezpack project.",
    action: function () {
        return __awaiter(this, void 0, void 0, function* () {
            const name = yield input("Please type the name of modpack:\n");
            const author = yield input("Please type the author of modpack:\n");
            const version = yield input("Please type the version of modpack:\n");
            // const modloader = await input("Please type the modloader of modpack (fabric/forge):\n")
            const manifest = {
                name: name,
                author: author,
                version: version,
                modloader: "fabric"
            };
            yield fs_1.default.writeFileSync('manifest.json', JSON.stringify(manifest));
            yield fs_1.default.writeFileSync('mods.json', "[]");
        });
    }
};
