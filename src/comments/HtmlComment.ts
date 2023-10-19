import { HtmlCommentTag } from './HtmlCommentTag';


export class HtmlComment {
    readonly id: string?;
    readonly tags: HtmlCommentTag[];
    readonly commentBody: string;
    readonly line: number;
    private tagsNames: Set<string>;
    constructor(id: string?, tagsString: string | null, commentBody: string, line: number) {
        this.id = id;
        this.commentBody = commentBody;
        this.line = line;
        if (tagsString == null) {
            this.tags = [];
            return;
        }
        const tagsArr = tagsString.split(",").map(
            tag => tag.trim()
        ).filter(
            tag => tag
        );
        this.tagsNames = new Set(tagsArr);

        this.tags = [...this.tagsNames].map(tag => new HtmlCommentTag(tag));
    }
}
