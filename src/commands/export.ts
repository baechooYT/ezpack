import {BaseMirror} from "../classes/BaseMirror";

const readline = require('readline');
import fs from 'fs'
import path from "path";

function input(query: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, (ans: any) => {
        rl.close();
        resolve(ans);
    }))
}


module.exports = {
    name: "export",
    description: "Exports an ezpack project to other formats.",
    args: {"<modpackFormat>": "Format of mod (ex: CurseForge, Modrinth, ModsZip)", "<mcVersion>": "Target version of exported modpack (ex: 1.20.2)"},
    action: async function (program: any){

        const startTime = Date.now()
        const modpackFormatClass = require(path.dirname(__dirname)+"/modpackFormats/" + program.args[1])
        const modpackFormat = new modpackFormatClass()

        if (!fs.existsSync("./exports")){
            fs.mkdirSync("./exports")
        }

        const savedPath = await modpackFormat.convertFromEzpack(JSON.parse(fs.readFileSync("./manifest.json", 'utf-8')), JSON.parse(fs.readFileSync("./mods.json", 'utf-8')), "./exports", program.args[2])

        console.log("Exported to: "+savedPath)
        console.log(`Exported successfully! Took: ${(Date.now()-startTime)/1000}s`)
    }
}