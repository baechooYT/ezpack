import {BaseMirror} from "../classes/BaseMirror";
import {BaseModFile} from "./BaseModFile";

export class BaseMod {
    public slug = "";
    public idFromMirror= "";
    public mirror: BaseMirror = new BaseMirror();
    public latestFile: BaseModFile = new BaseModFile()
}