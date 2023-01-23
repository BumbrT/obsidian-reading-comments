import { TreeOption } from 'naive-ui';

// TODO -
export class TextToTreeDataParser {
    readonly parsedComments: HtmlCommentsOrganasiedToViewTree
    private regExSpan =
        /\<span class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>(.+?)\<\/span\>/gm

    constructor(text: string) {
        const parsedCommentsWithTags = new Array<HtmlCommentWithTags>;

        let arrayMatch;
        let lastCommentLine;
        const lines = text.split("\n");
        lines.forEach(
            (lineContent, lineNumber) => {
                while ((arrayMatch = this.regExSpan.exec(lineContent)) !== null) {
                    const commentId = arrayMatch[1];
                    const matchedTags = arrayMatch[2];
                    const commentBody = arrayMatch[3];
                    // console.log(`Found ${arrayMatch[0]}. Line ${lineNumber} Comment id ${commentId} Tags ${matchedTags}`);
                    lastCommentLine = lineNumber;
                    if (matchedTags) {
                        const parsed = new HtmlCommentWithTags(commentId, matchedTags, commentBody, lineNumber);
                        parsedCommentsWithTags.push(parsed);
                    }
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
            this.treeId = `${parentTreeKey}/${this.name}`;
            const childTagString = tagString.substring(index + 1);
            if (childTagString) {
                this.child = new HtmlCommentTag(childTagString, this.treeId, this.treeLevel);
            } else {
                this.child = null;
            }
        } else {
            this.treeId = `${parentTreeKey}/${this.name}`;
            this.name = tagString;
            this.child = null;
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
        this.processGroupedTags(this.treeOptions, rootTagsByName);
    }

    private processGroupedTags(currentTreeLevel: TreeOption[], groupedTags: Map<string, HtmlCommentTag[]>) {
        groupedTags.forEach(
            (optionTags, key) => {
                const currentOption = this.tagToTreeOption(key, key);
                currentTreeLevel.push(currentOption);
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
                this.processGroupedTags(currentOption.children, childTagsByName)
                currentOption.children?.push(...this.commentsWithoutTagsToTreeOptions(comments))
            }
        )

        currentTreeLevel.push(...this.commentsWithoutTagsToTreeOptions(this.commentsWithTags));
    }

    private commentsWithoutTagsToTreeOptions(comments: HtmlCommentWithTags[]): TreeOption[] {
        return comments.filter(
            it => it.tags.length == 0
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
