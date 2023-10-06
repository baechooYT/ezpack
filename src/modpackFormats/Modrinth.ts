import {BaseModpackFormat} from "../classes/BaseModpackFormat";
import {getLatestVersion} from "../utils/fabric";
import {BaseMirror} from "../classes/BaseMirror";
import fs from "fs";
import archiver from "archiver";
import axios from "axios";

const pathM = require('path')

module.exports = class ModrinthFormat implements BaseModpackFormat {
    public name: string = "Modrinth"
    async convertFromEzpack(manifest: {[p: string]: any}, mods: {[p: string]: {[p: string]: any}}[], path: string, mcVersion: string): Promise<string>{
        const filePath = `${path}/${this.name}-${mcVersion}.mrpack`
        const modrinthMirrorFile = require(pathM.dirname(__dirname)+"/mirrors/Modrinth")
        const modrinthMirror = new modrinthMirrorFile()

        let modLoaders: {[p: string]: string} = {
            "fabric": "fabric-loader"
        }

        let modrinthIndex = {
            "formatVersion": 1,
            "game": "minecraft",
            "name": manifest.name,
            "versionId": manifest.version,
            "dependencies": {
                "minecraft": mcVersion
            } as {[p: string]: string},
            "files": [

            ]
        }

        // todo: add forge?
        modrinthIndex.dependencies[modLoaders[manifest.modloader]] = await getLatestVersion()

        let overrideMods = []

        for (let mod of mods) {
            const modInfo = mod.mirrors[this.name]

            if (modInfo){
                const modVersion = await modrinthMirror.getVersionByGameVersion(mcVersion, modInfo.id, manifest.modloader)

                modrinthIndex.files.push({
                    "downloads": [
                        modVersion.files[0].url
                    ],
                    "fileSize": modVersion.files[0].size,
                    "hashes": modVersion.files[0].hashes,
                    "path": `mods/${decodeURIComponent(modVersion.files[0].url.split('/').pop())}`
                } as never)
            }else{
                const mirrorClass: any = require(pathM.dirname(__dirname)+"/mirrors/" + Object.keys(mod.mirrors)[0] + ".js")
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

        const output = fs.createWriteStream(filePath)
        const archive = archiver('zip', {
            zlib: { level: 0 }
        })

        archive.pipe(output);

        archive.append(JSON.stringify(modrinthIndex), { name: 'modrinth.index.json' });

        for (let modUrl of overrideMods){
            archive.append((await axios.get(modUrl)).data, { name: 'overrides/mods/'+decodeURIComponent(modUrl.split('/').pop() as string) })
        }

        await archive.finalize()

        return filePath
    }
}