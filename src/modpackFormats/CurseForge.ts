import {BaseModpackFormat} from "../classes/BaseModpackFormat";
import {getLatestVersion} from "../utils/fabric";
import {BaseMirror} from "../classes/BaseMirror";
import fs from "fs";
import archiver from "archiver";
import axios from "axios";

module.exports = class CurseForgeFormat implements BaseModpackFormat {
    public name: string = "CurseForge"
    async convertFromEzpack(manifest: {[p: string]: any}, mods: {[p: string]: {[p: string]: any}}[], path: string, mcVersion: string): Promise<string>{
        const filePath = `${path}/${this.name}-${mcVersion}.zip`

        const CurseForgeMirrorFile = require(__dirname+"/../mirrors/CurseForge")
        const CurseForgeMirror = new CurseForgeMirrorFile()

        let modList = "<ul>\n"
        let cfManifest = {
            "minecraft": {
                "version": mcVersion,
                "modLoaders": [
                    {
                        "id": manifest.modloader+'-'+(await getLatestVersion()),
                        "primary": true
                    }
                ]
            },
            "manifestType": "minecraftModpack",
            "manifestVersion": 1,
            "name": manifest.name,
            "version": manifest.version,
            "author": manifest.author,
            "files": []
        }

        let overrideMods = []

        for (let mod of mods) {
            const modInfo = mod.mirrors[this.name]

            if (modInfo){
                let mirrorModInfo = (await axios.get("https://api.curseforge.com/v1/mods/"+modInfo.id, {
                    headers: {
                        "x-api-key": CurseForgeMirror.apiKey
                    }
                })).data.data

                modList+=`<li><a href="https://www.curseforge.com/minecraft/mc-mods/${mirrorModInfo.slug}">${mirrorModInfo.name} (by ${mirrorModInfo.authors[0].name})</a></li>\n`

                cfManifest.files.push({
                    "projectID": modInfo.id,
                    "fileID": (await CurseForgeMirror.getModFileByGameVersion(mcVersion, modInfo.id, 'fabric')).id,
                    "required": true,
                } as never)
            }else{
                const mirrorClass: any = require(__dirname + "/../mirrors/" + Object.keys(mod.mirrors)[0])
                const mirror: BaseMirror = new mirrorClass()
                const modFile = await mirror.getModFileByGameVersion(mcVersion, Object.values(mod.mirrors)[0].id, 'fabric')

                if (!modFile){
                    continue;
                }

                if (!modFile.downloadURL){
                    console.log("Cannot download mod:",mod.slug)
                    console.log("You can manually download mod and put mod into the file.")
                }

                overrideMods.push(modFile.downloadURL)
            }
        }
        modList+="</ul>"

        const output = fs.createWriteStream(filePath)
        const archive = archiver('zip', {
            zlib: { level: 0 }
        })

        archive.pipe(output);

        archive.append(modList, { name: 'modlist.html' });
        archive.append(JSON.stringify(cfManifest), { name: 'manifest.json' });

        for (let modUrl of overrideMods){
            archive.append((await axios.get(modUrl)).data, { name: 'overrides/mods/'+decodeURIComponent(modUrl.split('/').pop() as string) })
        }


        await archive.finalize()

        return filePath
    }
}
