#! /usr/bin/env node
const { Command } = require('commander');
const program = new Command();

const fs = require("fs")

program
    .name("ezpack")
    .description("Easiest way to pack a minecraft modpacks")
    .version("1.1.9")

fs.readdirSync(__dirname+"/commands/").forEach((file: string) => {
    const command = require(__dirname+"/commands/"+file)

    let newCommand = program.command(command.name)
        .description(command.description)
        .action(async function (){
            await command.action(program)
        });

    for (let [key, value] of Object.entries(command.args)){
        newCommand.argument(key, value)
    }
})

program.parse();