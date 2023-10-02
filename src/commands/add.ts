import axios from "axios";
import moment from "moment";
import readline from "readline"
import fs from "fs"
import {BaseMirror} from "../classes/BaseMirror";
import {BaseMod} from "../interfaces/BaseMod";

function input(query: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}
async function checkRedirect(url: string) {
    return (await axios.get(url)).request.res.responseUrl
}

function compareValues(obj: object): boolean {
    let values = Object.values(obj);
    if (values.length === 0) {
        return true;
    }
    let first = values[0];
    for (let i = 1; i < values.length; i++) {
        if (values[i] !== first) {
            return false;
        }
    }
    return true;
}

function compareTimestamps(obj: {[key: string]: moment.Moment}): string[] {
    let result: string[] = []
    let moments = {...obj};
    let values = Object.values(moments);

    let max = moment.max(values);

    for (let [key, value] of Object.entries(moments)) {
        if (!value.isSame(max)) {
            result.push(key)
        }
    }

    return result
}

module.exports = {
    name: "add",
    description: "adds a minecraft mod to modpack.",
    action: async function (program: any){
        const startTime = Date.now();

        const modsFile = JSON.parse(await fs.readFileSync("./mods.json", 'utf-8'))

        let i=0
        for (let mod of modsFile) {
            if (mod.slug == program.args[1]) {
                modsFile.splice(i, 1)
            }
            i++
        }

        const mirrors: BaseMirror[] = []
        const mods: BaseMod[] = []
        await fs.readdirSync(__dirname+"/../mirrors").forEach(async function (f){
            const mirror = require(__dirname + "/../mirrors/" + f)

            mirrors.push(new mirror())
        })

        const notUsableMirrors = []
        const sourceUrls: {[index: string]:string} = {}
        for (const v of mirrors) {
            const mod = await v.getModBySlug(program.args[1])

            if (!mod){
                console.log('Cannot find "'+program.args[1]+'" in '+v.name)
                notUsableMirrors.push(v)

                continue;
            }

            sourceUrls[v.name] = (await checkRedirect(mod.links.sourceURL)).toLowerCase()
            mods.push(mod)
        }

        if (compareValues(sourceUrls) == false) {
            console.log("Is these mods are same mods?. (Y/N)")
            for (const mod of mods) {
                console.log(mod.mirror.getUrlBySlug(mod.slug))
            }

            let i = await input("")

            if (i=="Y"){
                console.log("OK, Ignoring warning..")
            }else{
                const newUrls = {}
                while (true){
                    const newUrl = await input("Please correct the wrong mod url and type here. (Type 'end' to end)\n")

                    if (newUrl == 'end'){
                        break
                    }else{
                        // TODO: Add mod correction - detect mirror site
                    }
                }


                // TODO: Add mod correction
            }
        }

        // TODO: Compare by versions not timestamps
        let timestamps: {[key: string]: moment.Moment} = {}
        for (let mod of mods){
            timestamps[mod.mirror.name] = moment(mod.latestFileDate)
        }
        let removedMirrors = compareTimestamps(timestamps)

        for (let removedMirror of removedMirrors){
            let i = 0
            for (let mod of mods){
                if (mod.mirror.name == removedMirror){
                    mods.splice(i, 1)

                    console.log("!! Looks like mod has discontinued uploading to "+mod.mirror.name+". !!")
                }
                i++
            }
        }

        if (removedMirrors.length >= 1){
            console.log("!! Modpack will be fine, but some features will not work in launcher !!")
        }

        const parsedMods: {[index: string]:any} = {}
        for (let mod of mods){
            parsedMods[mod.mirror.name] = {
                id: mod.idFromMirror
            }
        }

        modsFile.push({
            slug: program.args[1],
            mirrors: parsedMods
        })

        await fs.writeFileSync("./mods.json", JSON.stringify(modsFile))

        console.log(`Adding ${program.args[1]} to modpack was successful. Took: ${(Date.now()-startTime)/1000}s`)
    }
}