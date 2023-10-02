const { Command } = require('commander');
const program = new Command();

const fs = require("fs")

program
    .name("ezpack")
    .description("Easiest way to pack a minecraft modpacks")
    .version("1.0.0")

fs.readdirSync(__dirname+"/commands/").forEach((file: string) => {
    const command = require(__dirname+"/commands/"+file)

    program.command(command.name)
        .description(command.description)
        .action(async function (){
            await command.action(program)
        });
})

program.parse();