import {BaseMod} from "../interfaces/BaseMod";
import moment from "moment";
import {BaseModFile} from "../interfaces/BaseModFile";

export class BaseMirror {
    public name: string = "Example";

    async getModBySlug(slug: string): Promise<BaseMod | undefined>{
        try {
            return {mirror: this, slug: "", idFromMirror: "", latestFile: new BaseModFile()}
        } catch (e) {
            console.log(e)

            return undefined
        }
    }

    getUrlBySlug(slug: string): string {
        return "https://example.com/"+slug
    }

    async getModFileByGameVersion(game_version: string, modId: string, modLoader: string): Promise<BaseModFile | undefined>{
        return new BaseModFile()
    }
}