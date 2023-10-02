import axios from "axios";

export async function getVersions(){
    return (await axios.get("https://launchermeta.mojang.com/mc/game/version_manifest.json")).data
}