import {BaseMod} from "./BaseMod";
import moment, {Moment} from "moment";

export class BaseModFile {
    public hashes: {[index: string]:string} = {
        sha1: ""
    }
    public date: Moment = moment()
    public downloadURL: string = ""
}