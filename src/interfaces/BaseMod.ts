import {BaseMirror} from "../classes/BaseMirror";
import moment, {Moment} from "moment";

export class BaseMod {
    public slug = "";
    public idFromMirror= "";
    public mirror: BaseMirror = new BaseMirror();
    public links = {
        sourceURL: ""
    }
    public latestFileDate: Moment = moment()
}