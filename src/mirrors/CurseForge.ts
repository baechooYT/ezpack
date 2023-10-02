import {BaseMirror} from "../classes/BaseMirror";
import {BaseMod} from "../interfaces/BaseMod";
import axios from "axios";
import moment from "moment";

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

            return {
                slug: slug,
                mirror: this,
                idFromMirror: Mod.id,
                links: {
                    sourceURL: Mod.links.sourceUrl ? Mod.links.sourceUrl : ""
                },
                latestFileDate: moment(Mod.latestFiles[0].fileDate)
            }
        }catch (e){
            console.log(e)

            return undefined
        }
    }

    getUrlBySlug(slug: string): string {
        return "https://www.curseforge.com/minecraft/mc-mods/"+slug
    }

    async onvertFromEzpack(manifest: object, mods: object, path: string): string{

    }
}