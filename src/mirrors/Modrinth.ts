import {BaseMirror} from "../classes/BaseMirror";
import {BaseMod} from "../interfaces/BaseMod";
import axios from "axios";
import {BaseModFile} from "../interfaces/BaseModFile";
import moment from "moment/moment";
import {getLatestVersion} from "../utils/fabric";
import fs from "fs";
import archiver from "archiver";

module.exports = class Modrinth extends BaseMirror {
    public name = "Modrinth"

    async getModBySlug(slug: string) :Promise<BaseMod | undefined>{
        try{
            const Mod = (await axios.get("https://api.modrinth.com/v2/project/"+slug)).data

            if (!Mod){
                return undefined
            }

            // Getting latest file
            const VersionData = (await axios.get(`https://api.modrinth.com/v2/project/${slug}/version/${Mod.versions[Mod.versions.length-1]}`)).data
            const latestFile = new BaseModFile()
            latestFile.hashes.sha1 = VersionData.files[0].hashes.sha1
            latestFile.date = moment(VersionData.date_published)
            latestFile.downloadURL = VersionData.files[0].url
            latestFile.id = VersionData.id

            return {
                slug: slug,
                mirror: this,
                idFromMirror: Mod.id,
                latestFile: latestFile
            }
        }catch (e) {
            console.log(e)

            return undefined
        }
    }

    async getVersionByGameVersion(game_version: string, modId: string, modLoader: string){
        const versions: { [p: string]: any }[] = (await axios.get(`https://api.modrinth.com/v2/project/${modId}/version`, {})).data

        let matchVersion = versions[0]
        for (let version of versions){
            const baseVersion = game_version.split(".")[0] + '.' + game_version.split(".")[1]
            if (version.game_versions.includes(baseVersion) && version.loaders.includes(modLoader)){
                matchVersion = version
            }
        }

        for (let version of versions){
            if (version.game_versions.includes(game_version) && version.loaders.includes(modLoader)){
                matchVersion = version
            }
        }

        return matchVersion
    }

    async getModFileByGameVersion(game_version: string, modId: string, modLoader: string){
        const versions: { [p: string]: any }[] = (await axios.get(`https://api.modrinth.com/v2/project/${modId}/version`, {})).data

        let matchVersion = versions[0]
        for (let version of versions){
            const baseVersion = game_version.split(".")[0] + '.' + game_version.split(".")[1]
            if (version.game_versions.includes(baseVersion) && version.loaders.includes(modLoader)){
                matchVersion = version
            }
        }

        for (let version of versions){
            if (version.game_versions.includes(game_version) && version.loaders.includes(modLoader)){
                matchVersion = version
            }
        }

        const modFile = new BaseModFile()
        modFile.date = moment(matchVersion.date_published)
        modFile.hashes.sha1 = matchVersion.files[0].hashes.sha1
        modFile.downloadURL = matchVersion.files[0].url
        modFile.id = matchVersion.id

        return modFile
    }

    getUrlBySlug(slug: string): string {
        return "https://modrinth.com/mod/"+slug
    }

    async convertFromEzpack(manifest: {[p: string]: any}, mods: {[p: string]: {[p: string]: any}}[], path: string, mcVersion: string): Promise<string>{
        const filePath = `${path}/${this.name}-${mcVersion}.mrpack`

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
                const modVersion = await this.getVersionByGameVersion(mcVersion, modInfo.id, manifest.modLoader)

                modrinthIndex.files.push({
                    "downloads": [
                        modVersion.files[0].url
                    ],
                    "fileSize": modVersion.files[0].size,
                    "hashes": modVersion.files[0].hashes,
                    "path": `mods/${decodeURIComponent(modVersion.files[0].url.split('/').pop())}`
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