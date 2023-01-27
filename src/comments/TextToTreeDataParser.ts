import { HtmlComment } from './HtmlComment';
import { OrganasiedTagsAndComments } from './OrganasiedTagsAndComments';


export class TextToTreeDataParser {
    readonly parsedComments: OrganasiedTagsAndComments;
    private regExpComment = /\<div class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>(.+?)\<\/span\>/gm;

    static selectionToComment(commentId: string, selection: string): string {
        return `<div class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>${selection}</div>`;
    }

    constructor(text: string) {
        const parsedCommentsWithTags = new Array<HtmlComment>;

        let arrayMatch;
        const lines = text.split("\n");
        lines.forEach(
            (lineContent, lineNumber) => {
                while ((arrayMatch = this.regExpComment.exec(lineContent)) !== null) {
                    const commentId = arrayMatch[1];
                    const matchedTags = arrayMatch[2];
                    const commentBody = arrayMatch[3];
                    let parsed: HtmlComment;
                    if (matchedTags) {
                        parsed = new HtmlComment(commentId, matchedTags, commentBody, lineNumber);
                    } else {
                        parsed = new HtmlComment(commentId, null, commentBody, lineNumber);
                    }
                    parsedCommentsWithTags.push(parsed);

                }
            }
        );
        this.parsedComments = new OrganasiedTagsAndComments(parsedCommentsWithTags);
    }
}
