import {BaseMirror} from "../classes/BaseMirror";
import {BaseMod} from "../interfaces/BaseMod";
import axios from "axios";
import {BaseModFile} from "../interfaces/BaseModFile";
import moment from "moment";

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

            let latestFileInfo = Mod.latestFiles[0]
            for (let FileInfo of Mod.latestFiles){
                if (moment(FileInfo.fileDate).isAfter(moment(latestFileInfo.fileDate))){
                    latestFileInfo = FileInfo
                }
            }

            for (let hash of Mod.latestFiles[0].hashes) {
                if (hash.algo == 1){
                    latestFile.hashes.sha1 = hash.value
                }
            }
            latestFile.date = moment(latestFileInfo.fileDate)
            latestFile.downloadURL = latestFileInfo.downloadUrl
            latestFile.id = latestFileInfo.id

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

        const filesData = (await axios.get(`https://api.curseforge.com/v1/mods/${modId}/files?modLoaderType=${modLoaders[modLoader]}`, {
            headers: {
                'x-api-key': this.apiKey
            }
        })).data.data
        const files = filesData.reverse()

        let fileInfo
        // for (let file of files){
        //     const baseVersion = game_version.split(".")[0] + '.' + game_version.split(".")[1]
        //     if(file.gameVersions.includes(baseVersion)){
        //         fileInfo = file
        //     }
        // }

        for (let file of files){
            if(file.gameVersions.includes(game_version)){
                fileInfo = file
            }
        }

        if (!fileInfo) return

        const modFile = new BaseModFile()
        modFile.date = moment(fileInfo.fileDate)
        for (let hash of fileInfo.hashes) {
            if (hash.algo == 1){
                modFile.hashes.sha1 = hash.value
            }
        }
        modFile.downloadURL = fileInfo.downloadUrl
        modFile.id = fileInfo.id

        return modFile
    }

    getUrlBySlug(slug: string): string {
        return "https://www.curseforge.com/minecraft/mc-mods/"+slug
    }
}