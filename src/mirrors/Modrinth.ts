import {BaseMirror} from "../classes/BaseMirror";
import {BaseMod} from "../interfaces/BaseMod";
import axios from "axios";
import moment from "moment";

module.exports = class Modrinth extends BaseMirror {
    public name = "Modrinth"

    async getModBySlug(slug: string) :Promise<BaseMod | undefined>{
        try{
            const Mod = (await axios.get("https://api.modrinth.com/v2/project/"+slug)).data

            if (!Mod){
                return undefined
            }

            // Getting latest file date
            const VersionData = (await axios.get("https://api.modrinth.com/v2/version/"+Mod.versions[Mod.versions.length-1])).data

            return {
                slug: slug,
                mirror: this,
                idFromMirror: Mod.id,
                links: {
                    sourceURL: Mod["source_url"] ? Mod["source_url"] : ""
                },
                latestFileDate: moment(VersionData.date_published)
            }
        }catch (e) {
            console.log(e)

            return undefined
        }
    }

    getUrlBySlug(slug: string): string {
        return "https://modrinth.com/mod/"+slug
    }
}