import { TreeOption } from 'naive-ui';
import { HtmlCommentTag } from './HtmlCommentTag';
import { HtmlComment } from './HtmlComment';

/**
 * Organise collection of comments with tags to structure to tree:
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

export class OrganasiedTagsAndComments {
    readonly treeOptions: TreeOption[]
    private readonly comments: HtmlComment[]
    private allTags: HtmlCommentTag[] = []

    constructor(commentsWithTags: HtmlComment[]) {
        this.comments = commentsWithTags
        this.treeOptions = []
        const commentsTags = commentsWithTags.filter(
            it => it.tags.length > 0
        ).flatMap(
            it => it.tags
        );
        this.allTags.push(...commentsTags);
        let parents: HtmlCommentTag[] = commentsTags;
        while ((parents = this.extractParents(parents)).length > 0) {
            this.allTags = this.allTags.concat(parents);
        }
        const rootTagsByKey = this.groupTagsByTreeKey(0, null);
        this.processGroupedTags(0, this.treeOptions, rootTagsByKey);
        this.treeOptions.push(...this.commentsWithoutTagsToTreeOptions(this.comments, 0));
    }
    private extractParents(tags: HtmlCommentTag[]): HtmlCommentTag[] {
        return tags.map(it => it.parent).filter((it): it is HtmlCommentTag => it != null);
    }

    private processGroupedTags(currentTreeLevel: number, currentTreeLevelOptions: TreeOption[], groupedTags: Map<string, HtmlCommentTag[]>) {
        groupedTags.forEach(
            (tagsByKey, treeKey) => {
                const childTreeLevel = currentTreeLevel + 1;
                const treeKeyLabel = HtmlCommentTag.stripTreeKeyToTreeLabel(treeKey);
                const currentTreeOptionOption = this.tagToTreeOption(treeKey, treeKeyLabel);
                currentTreeLevelOptions.push(currentTreeOptionOption);
                const taggedComments = this.comments.filter(
                    it =>
                        it.tags.some(
                            tag => tagsByKey.some(
                                ot => ot.treeKey === tag.treeKey
                            )
                        )

                );
                const childTagsByKey = this.groupTagsByTreeKey(childTreeLevel, treeKey);
                this.processGroupedTags(childTreeLevel, currentTreeOptionOption.children, childTagsByKey);
                const currentTagComments = this.commentsWithoutTagsToTreeOptions(taggedComments, childTreeLevel);
                currentTreeOptionOption.children.push(...currentTagComments);
            }
        )
    }

    private commentsWithoutTagsToTreeOptions(comments: HtmlComment[], currentTreeLevel: number): TreeOption[] {
        return comments.filter(
            it => it.tags.length == 0 || it.tags.every(tag => tag.treeLevel < currentTreeLevel)
        ).map(
            it => this.commentToTreeOption(it)
        )
    }

    private commentToTreeOption(comment: HtmlComment): TreeOption {
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

    private groupTagsByTreeKey(treeLevel: number, parentTagKey: string | null): Map<string, HtmlCommentTag[]> {
        const currentLevelTags = this.allTags.filter(it => it.treeLevel == treeLevel);
        const tagsByKey = new Map<string, HtmlCommentTag[]>;
        currentLevelTags.forEach(
            tag => {
                if (parentTagKey != null && tag.parent?.treeKey != parentTagKey) {
                    return;
                }
                let foundTags = tagsByKey.get(tag.treeKey);
                if (foundTags == null) {
                    foundTags = [];
                    tagsByKey.set(tag.treeKey, foundTags);
                }
                foundTags.push(tag);


            }
        );
        return tagsByKey;
    }

}

interface TreeOptionWithChild extends TreeOption {
    children: TreeOption[]
}
