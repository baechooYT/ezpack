import {BaseMirror} from "../classes/BaseMirror";
import {BaseMod} from "../interfaces/BaseMod";
import axios, {AxiosResponse} from "axios";
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
        const versionsRes: AxiosResponse = await axios.get(`https://api.modrinth.com/v2/project/${modId}/version`, {})
        const versions = versionsRes.data.reverse()

        let matchVersion = versions[0]
        // for (let version of versions){
        //     const baseVersion = game_version.split(".")[0] + '.' + game_version.split(".")[1]
        //     if (version.game_versions.includes(baseVersion) && version.loaders.includes(modLoader)){
        //         matchVersion = version
        //     }
        // }

        for (let version of versions){
            if (version.game_versions.includes(game_version) && version.loaders.includes(modLoader)){
                matchVersion = version
            }
        }

        return matchVersion
    }

    async getModFileByGameVersion(game_version: string, modId: string, modLoader: string){
        const matchVersion = await this.getVersionByGameVersion(game_version, modId, modLoader)

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
}