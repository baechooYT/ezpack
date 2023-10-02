import {BaseMod} from "../interfaces/BaseMod";
import moment from "moment";

export class BaseMirror {
    public name: string = "Example";

    async getModBySlug(slug: string): Promise<BaseMod | undefined>{
        try {
            return {mirror: this, slug: "", idFromMirror: "", links: {sourceURL:""}, latestFileDate: moment()}
        } catch (e) {
            console.log(e)

            return undefined
        }
    }

    getUrlBySlug(slug: string): string {
        return "https://example.com/"+slug
    }
}