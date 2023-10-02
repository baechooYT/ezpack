import {BaseMirror} from "../classes/BaseMirror";

const readline = require('readline');
import fs from 'fs'

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
    action: async function (program: any){

        const startTime = Date.now()
        const mirrorClass = require(__dirname + "/../mirrors/" + program.args[1])
        const mirror = new mirrorClass()

        if (!fs.existsSync("./exports")){
            fs.mkdirSync("./exports")
        }

        const savedPath = await mirror.convertFromEzpack(JSON.parse(fs.readFileSync("./manifest.json", 'utf-8')), JSON.parse(fs.readFileSync("./mods.json", 'utf-8')), "./exports", program.args[2])

        console.log("Exported to: "+savedPath)
        console.log(`Exported successfully! Took: ${(Date.now()-startTime)/1000}s`)
    }
}