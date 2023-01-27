import { TreeOption } from 'naive-ui';

// TODO -
export class TextToTreeDataParser {
    readonly parsedComments: HtmlCommentsOrganasiedToViewTree
    private regExpComment =
        /\<span class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>(.+?)\<\/span\>/gm

    static selectionToComment(commentId: string, selection: string): string {
        return `<span class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>${selection}</span>`;
    }

    constructor(text: string) {
        const parsedCommentsWithTags = new Array<HtmlCommentWithTags>;

        let arrayMatch;
        const lines = text.split("\n");
        lines.forEach(
            (lineContent, lineNumber) => {
                while ((arrayMatch = this.regExpComment.exec(lineContent)) !== null) {
                    const commentId = arrayMatch[1];
                    const matchedTags = arrayMatch[2];
                    const commentBody = arrayMatch[3];
                    let parsed: HtmlCommentWithTags;
                    if (matchedTags) {
                        parsed = new HtmlCommentWithTags(commentId, matchedTags, commentBody, lineNumber);
                    } else {
                        parsed = new HtmlCommentWithTags(commentId, null, commentBody, lineNumber);
                    }
                    parsedCommentsWithTags.push(parsed);

                }
            }
        );
        this.parsedComments = new HtmlCommentsOrganasiedToViewTree(parsedCommentsWithTags);
    }
}

export class HtmlCommentWithTags {
    readonly id: string
    readonly tags: HtmlCommentTag[]
    readonly commentBody: string
    readonly line: number
    private tagsNames: Set<string>
    constructor(id: string, tagsString: string | null, commentBody: string, line: number) {
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

export class HtmlCommentTag {
    // readonly fullName: string
    readonly name: string
    readonly treeKey: string
    readonly treeLevel: number
    readonly parent: HtmlCommentTag | null
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

/**
 * Organise collection of comments with tags to structure for tree:
 [
    {
        label: "test",
        key: "item-0",
        type: "tag",
        children: [
            {
                label: "child test1",
                key: "item-1",
                type: "tag",
                children: [
                    label: "Comment body",
                    key: "comment-id",
                    line: 112,
                    type: "comment",
                ]
            }
        ]
    }
];
 */

interface TreeOptionWithChild extends TreeOption {
    children: TreeOption[]
}

export class HtmlCommentsOrganasiedToViewTree {
    readonly treeOptions: TreeOption[]
    readonly commentsWithTags: HtmlCommentWithTags[]
    private readonly allTags: HtmlCommentTag[] = []

    constructor(commentsWithTags: HtmlCommentWithTags[]) {
        this.commentsWithTags = commentsWithTags
        this.treeOptions = []
        const commentsTags = commentsWithTags.filter(
            it => it.tags.length > 0
        ).flatMap(
            it => it.tags
        );
        this.allTags.push(...commentsTags);
        let parents: HtmlCommentTag[]
        while ((parents = this.extractParents(commentsTags)).length > 0) {
            this.allTags.push(...parents);
        }
        const rootTagsByName = this.groupTagsByTreeKey(0);
        this.processGroupedTags(0, this.treeOptions, this.commentsWithTags, rootTagsByName);
        this.treeOptions.push(...this.commentsWithoutTagsToTreeOptions(this.commentsWithTags, 0));
    }
    private extractParents(tags: HtmlCommentTag[]): HtmlCommentTag[] {
        return tags.map(it => it.parent).filter((it): it is HtmlCommentTag => it != null);
    }

    private processGroupedTags(currentTreeLevel: number, currentTreeLevelOptions: TreeOption[], currentComments: HtmlCommentWithTags[], groupedTags: Map<string, HtmlCommentTag[]>) {
        groupedTags.forEach(
            (tagsByName, treeKey) => {
                const childTreeLevel = currentTreeLevel + 1;
                const treeKeyLabel = HtmlCommentTag.stripTreeKeyToTreeLabel(treeKey);
                const currentTreeOptionOption = this.tagToTreeOption(treeKeyLabel, treeKeyLabel);
                currentTreeLevelOptions.push(currentTreeOptionOption);
                const comments = currentComments.filter(
                    it => {
                        it.tags.some(
                            tag => tagsByName.some(
                                ot => ot.treeKey === tag.treeKey
                            )
                        )
                    }
                );
                const childTagsByName = this.groupTagsByTreeKey(childTreeLevel);
                this.processGroupedTags(currentTreeLevel + 1, currentTreeOptionOption.children, comments, childTagsByName)
                currentTreeOptionOption.children.push(...this.commentsWithoutTagsToTreeOptions(comments, childTreeLevel))
            }
        )
    }

    private commentsWithoutTagsToTreeOptions(comments: HtmlCommentWithTags[], currentTreeLevel: number): TreeOption[] {
        return comments.filter(
            it => it.tags.length == 0 || it.tags.every(tag => tag.treeLevel < currentTreeLevel)
        ).map(
            it => this.commentToTreeOption(it)
        )
    }

    private commentToTreeOption(comment: HtmlCommentWithTags): TreeOption {
        return <TreeOption>{
            type: "comment",
            key: comment.id,
            label: comment.commentBody,
            line: comment.line,
        }
    }

    private tagToTreeOption(key: string, name: string): TreeOptionWithChild {
        return <TreeOptionWithChild>{
            type: "tag",
            key: key,
            label: name,
            children: []
        }
    }

    private groupTagsByTreeKey(treeLevel: number): Map<string, HtmlCommentTag[]> {
        const tags = this.allTags.filter(it => it.treeLevel == treeLevel);
        const tagsByKey = new Map<string, HtmlCommentTag[]>;
        tags.forEach(
            tag => {
                let foundTags = tagsByKey.get(tag.treeKey);
                if (foundTags == null) {
                    foundTags = [];
                    tagsByKey.set(tag.name, foundTags);
                }
                foundTags.push(tag);
            }
        );
        return tagsByKey;
    }

}
