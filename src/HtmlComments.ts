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

        this.tags = [...this.tagsNames].map(tag => new HtmlCommentTag(tag, null, null));
    }
}

export class HtmlCommentTag {
    // readonly fullName: string
    readonly name: string
    readonly treeId: string
    readonly treeLevel: number
    readonly child: HtmlCommentTag | null
    constructor(tagString: string, parentTreeKey: string | null = null, parentTreeLevel: number | null = null) {
        // this.fullName = tagString;
        if (parentTreeLevel == null) {
            this.treeLevel = 0;
        } else {
            this.treeLevel = parentTreeLevel + 1;
        }
        if (this.treeLevel > 3) {
            throw Error("Only three nested tags supported, test/test1/test2/test3")
        }
        const index = tagString.indexOf("/");
        if (index > 0) {
            this.name = tagString.substring(0, index);
            this.treeId = this.getTreeId(parentTreeKey, this.name);
            const childTagString = tagString.substring(index + 1);
            if (childTagString) {
                this.child = new HtmlCommentTag(childTagString, this.treeId, this.treeLevel);
            } else {
                this.child = null;
            }
        } else {
            this.name = tagString;
            this.treeId = this.getTreeId(parentTreeKey, this.name);
            this.child = null;
        }

    }

    private getTreeId(parentTreeKey: string | null, name: string) {
        if (parentTreeKey != null) {
            return  `${parentTreeKey}/${this.name}`;
        } else {
            return name;
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

    constructor(commentsWithTags: HtmlCommentWithTags[]) {
        this.commentsWithTags = commentsWithTags
        this.treeOptions = []
        const rootTags = commentsWithTags.filter(
            it => it.tags.length > 0
        ).flatMap(
            it => it.tags
        );
        const rootTagsByName = this.groupTagsByName(rootTags);
        this.processGroupedTags(0, this.treeOptions, rootTagsByName);
        this.treeOptions.push(...this.commentsWithoutTagsToTreeOptions(this.commentsWithTags, 0));
    }

    private processGroupedTags(currentTreeLevel: number, currentTreeLevelOptions: TreeOption[], groupedTags: Map<string, HtmlCommentTag[]>) {
        groupedTags.forEach(
            (optionTags, key) => {
                const currentOption = this.tagToTreeOption(key, key);
                currentTreeLevelOptions.push(currentOption);
                const comments = this.commentsWithTags.filter(
                    it => it.tags.some(
                        tag => optionTags.some(
                            ot => ot.treeId === tag.treeId
                        )
                    )
                );
                const childTags = optionTags.map(
                    it => it.child
                ).filter((it): it is HtmlCommentTag => it != null);
                const childTagsByName = this.groupTagsByName(childTags);
                this.processGroupedTags(currentTreeLevel + 1, currentOption.children, childTagsByName)
                currentOption.children?.push(...this.commentsWithoutTagsToTreeOptions(comments, currentTreeLevel + 1))
            }
        )
    }

    private commentsWithoutTagsToTreeOptions(comments: HtmlCommentWithTags[], currentTreeLevel: number): TreeOption[] {
        return comments.filter(
            it => it.tags.length == 0 || it.tags.every( tag => tag.treeLevel < currentTreeLevel)
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

    private groupTagsByName(tags: Array<HtmlCommentTag>): Map<string, HtmlCommentTag[]> {
        const tagsByName = new Map<string, HtmlCommentTag[]>;
        tags.forEach(
            tag => {
                let tags = tagsByName.get(tag.name);
                if (tags == null) {
                    tags = [];
                    tagsByName.set(tag.name, tags);
                }
                tags.push(tag);
            }
        );
        return tagsByName;
    }

}
