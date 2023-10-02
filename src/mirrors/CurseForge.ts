import {BaseMirror} from "../classes/BaseMirror";
import {BaseMod} from "../interfaces/BaseMod";
import axios from "axios";
import {BaseModFile} from "../interfaces/BaseModFile";
import moment from "moment";
import {getLatestVersion} from "../utils/fabric";
import fs from "fs";
import archiver from 'archiver'
import {json} from "stream/consumers";

class CurseForgeMod extends BaseMod {}

module.exports = class CurseForge extends BaseMirror {
    public name = "CurseForge"
    public apiKey = "$2a$10$Hwk1pMaOPZpEGc50yMeJL.rNqVj1b9rmCO9nCR40d6cchHqsbQCOe"

    async getModBySlug(slug: string) : Promise<BaseMod | undefined>{
        try{
            const SearchResult = await axios.get("https://api.curseforge.com/v1/mods/search?gameId=432&slug="+slug, {
                headers: {
                    'x-api-key': this.apiKey
                }
            })

            if (!SearchResult.data.data[0]){
                return undefined
            }

            const Mod = SearchResult.data.data[0]

            const latestFile = new BaseModFile()

            for (let hash of Mod.latestFiles[0].hashes) {
                if (hash.algo == 1){
                    latestFile.hashes.sha1 = hash.value
                }
            }
            latestFile.date = moment(Mod.latestFiles[0].fileDate)
            latestFile.downloadURL = Mod.latestFiles[0].downloadUrl

            return {
                slug: slug,
                mirror: this,
                idFromMirror: Mod.id,
                latestFile: latestFile
            }
        }catch (e){
            console.log(e)

            return undefined
        }
    }

    async getModFileByGameVersion(game_version: string, modId: string, modLoader: string){
        let modLoaders: {[p: string]: number} = {
            "fabric": 4
        }

        const fileInfo = (await axios.get(`https://api.curseforge.com/v1/mods/${modId}/files?gameVersion=${game_version}&modLoaderType=${modLoaders[modLoader]}`, {
            headers: {
                'x-api-key': this.apiKey
            }
        })).data.data

        const modFile = new BaseModFile()
        modFile.date = moment(fileInfo.fileDate)
        for (let hash of fileInfo.hashes) {
            if (hash.algo == 1){
                modFile.hashes.sha1 = hash.value
            }
        }
        modFile.downloadURL = fileInfo.downloadUrl

        return modFile
    }

    getUrlBySlug(slug: string): string {
        return "https://www.curseforge.com/minecraft/mc-mods/"+slug
    }

    async convertFromEzpack(manifest: {[p: string]: any}, mods: {[p: string]: {[p: string]: any}}[], path: string, mcVersion: string): Promise<string>{
        const filePath = `${path}/${this.name}-${mcVersion}.zip`

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
                        "x-api-key": this.apiKey
                    }
                })).data.data

                modList+=`<li><a href="https://www.curseforge.com/minecraft/mc-mods/${mirrorModInfo.slug}">${mirrorModInfo.name} (by ${mirrorModInfo.authors[0].name})</a></li>\n`

                cfManifest.files.push({
                    "projectID": modInfo.id,
                    "fileID": mirrorModInfo.latestFiles[0].id,
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