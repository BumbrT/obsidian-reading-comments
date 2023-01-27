
export class HtmlCommentTag {
    readonly name: string;
    readonly treeKey: string;
    readonly treeLevel: number;
    readonly parent: HtmlCommentTag | null;
    constructor(tagString: string) {
        const index = tagString.lastIndexOf("/");
        if (index > 0 && index < tagString.length - 1) {
            this.treeLevel = (tagString.match(/\//g) || []).length;
            this.name = tagString.substring(index + 1);
            this.treeKey = tagString;
            const parentTagString = tagString.substring(0, index);
            if (parentTagString) {
                this.parent = new HtmlCommentTag(parentTagString);
            } else {
                this.parent = null;
            }
        } else {
            this.name = tagString;
            this.treeKey = tagString;
            this.treeLevel = 0;
        }
    }
    static stripTreeKeyToTreeLabel(treeKey: string): string {
        const index = treeKey.lastIndexOf("/");
        if (index > 0 && index < treeKey.length - 1) {
            return treeKey.substring(index + 1);
        } else {
            return treeKey;
        }
    }
}
