import axios from "axios";

export async function getVersions(){
    // types: old_alpha(ax.y.z) old_beta(bx.y.z) release(x.y.z) snapshot
    return (await axios.get("https://launchermeta.mojang.com/mc/game/version_manifest.json")).data
}