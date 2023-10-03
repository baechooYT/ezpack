import {BaseModpackFormat} from "../classes/BaseModpackFormat";
import {getLatestVersion} from "../utils/fabric";
import {BaseMirror} from "../classes/BaseMirror";
import fs from "fs";
import archiver from "archiver";
import axios from "axios";

module.exports = class ModsZipFormat implements BaseModpackFormat {
    public name: string = "ModsZip"
    async convertFromEzpack(manifest: {[p: string]: any}, mods: {[p: string]: {[p: string]: any}}[], path: string, mcVersion: string): Promise<string>{
        const filePath = `${path}/${this.name}-${mcVersion}.zip`

        const modFileUrls = []

        for (let mod of mods){
            let modUrl: string = ""
            for (let [key, value] of Object.entries(mod.mirrors)){
                const mirrorFile = require(__dirname + "/../mirrors/" + key)
                const mirror = new mirrorFile()
                const modFile = await mirror.getModFileByGameVersion(mcVersion, value.id, manifest.modloader)

                if (modFile.downloadURL) {
                    modUrl = modFile.downloadURL
                    break
                }
            }

            if (modUrl == "") {
                console.log("Failed to download mod:", mod.slug)
                console.log("Please download mod manually and put mod into the .zip file.")
            }else{
                modFileUrls.push(modUrl)
            }
        }

        const output = fs.createWriteStream(filePath)
        const archive = archiver('zip', {
            zlib: { level: 0 }
        })

        archive.pipe(output);

        for (let modUrl of modFileUrls){
            archive.append((await axios.get(modUrl)).data, { name: decodeURIComponent(modUrl.split('/').pop() as string) })
        }

        await archive.finalize()

        return filePath
    }
}