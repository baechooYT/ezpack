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
const { Command } = require('commander');
const program = new Command();
const fs = require("fs");
program
    .name("ezpack")
    .description("Easiest way to pack a minecraft modpacks")
    .version("0.0.1");
fs.readdirSync(__dirname + "/commands/").forEach((file) => {
    const command = require(__dirname + "/commands/" + file);
    program.command(command.name)
        .description(command.description)
        .action(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield command.action(program);
        });
    });
});
program.parse();
