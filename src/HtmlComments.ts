
export class HtmlCommentWithTags {
    readonly id: string
    readonly tags: HtmlCommentTag[]
    readonly commentBody: string
    readonly line: number
    private tagsNames: Set<string>
    constructor(id: string, tagsString: string, commentBody: string, line: number) {
        this.id = id;
        this.commentBody = commentBody;
        this.line = line;
        const tagsArr = tagsString.split(",").map(
            tag => tag.trim()
        ).filter(
            tag => tag
        );
        this.tagsNames = new Set(tagsArr);

        this.tags = [...this.tagsNames].map(tag => new HtmlCommentTag(tag));
    }
}

export class HtmlCommentTag {
    // readonly fullName: string
    readonly name: string
    readonly child: HtmlCommentTag | null
    constructor(tagString: string) {
        const index = tagString.indexOf("/");
        if (index > 0) {
            this.name = tagString.substring(0, index);
            const childTagString = tagString.substring(index + 1);
            if (childTagString) {
                this.child = new HtmlCommentTag(childTagString);
            } else {
                this.child = null;
            }
        } else {
            this.name = tagString;
            this.child = null;
        }

    }

}
