import {BaseMirror} from "../classes/BaseMirror";
import {BaseMod} from "../interfaces/BaseMod";
import axios from "axios";
import {BaseModFile} from "../interfaces/BaseModFile";
import moment from "moment/moment";

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

    async getModFileByGameVersion(game_version: string, modId: string, modLoader: string){
        const versions: { [p: string]: any }[] = (await axios.get(`https://api.modrinth.com/v2/project/${modId}/version`, {})).data

        for (let version of versions){
            if (version.game_versions.includes(game_version) && version.loaders.includes(modLoader)){
                const modFile = new BaseModFile()
                modFile.date = moment(version.date_published)
                modFile.hashes.sha1 = version.files[0].hashes.sha1
                modFile.downloadURL = version.files[0].url

                return modFile
            }
        }

        return undefined
    }

    getUrlBySlug(slug: string): string {
        return "https://modrinth.com/mod/"+slug
    }

    async convertFromEzpack(manifest: {[p: string]: any}, mods: {[p: string]: {[p: string]: any}}[], path: string, mcVersion: string): Promise<string>{
        const filePath = `${path}/${this.name}-${mcVersion}.mrpack`

        return filePath
    }
}