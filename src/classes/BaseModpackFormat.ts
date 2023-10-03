export class BaseModpackFormat {
    public name: string = "example"
    async convertFromEzpack(manifest: {[p: string]: any}, mods: {[p: string]: {[p: string]: any}}[], path: string, mcVersion: string): Promise<string>{
        return ""
    }
}