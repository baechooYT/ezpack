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
    name: "init",
    description: "Initalize an ezpack project.",
    args: {},
    action: async function (){
        const name = await input("Please type the name of modpack:\n")
        const author = await input("Please type the author of modpack:\n")
        const version = await input("Please type the version of modpack:\n")
        // const modloader = await input("Please type the modloader of modpack (fabric/forge):\n")

        const manifest = {
            name: name,
            author: author,
            version: version,
            modloader: "fabric"
        }

        await fs.writeFileSync('manifest.json', JSON.stringify(manifest))
        await fs.writeFileSync('mods.json', "[]")
    }
}