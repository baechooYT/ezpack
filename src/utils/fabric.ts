import axios from "axios";

export async function getLatestVersion(){
    let versions = (await axios.get("https://api.github.com/repos/FabricMC/fabric-loader/git/refs/tags")).data

    return versions[versions.length-1].ref.split('/')[2]
}