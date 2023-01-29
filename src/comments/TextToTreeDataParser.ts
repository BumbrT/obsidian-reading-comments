import { HtmlComment } from './HtmlComment';
import { OrganaizedTagsAndComments } from './OrganaizedTagsAndComments';
import { constantsAndUtils } from './ConstantsAndUtils'

export class TextToTreeDataParser {
    readonly parsedComments: OrganaizedTagsAndComments;
    constructor(text: string) {
        const parsedCommentsWithTags = new Array<HtmlComment>;

        let arrayMatch;
        const lines = text.split("\n");
        lines.forEach(
            (lineContent, lineNumber) => {
                while ((arrayMatch = constantsAndUtils.regExpComment.exec(lineContent)) !== null) {
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
        this.parsedComments = new OrganaizedTagsAndComments(parsedCommentsWithTags);
    }
}
