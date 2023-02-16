import escapeHTML from "escape-html";
import { TreeOption } from "naive-ui";
import { v4 as uuidv4 } from 'uuid';
import { OrganaizedTagsAndComments } from "./OrganaizedTagsAndComments";



export interface TagTreeOption extends TreeOption {
    isTag: true,
    isComment: false,
    /* full tag name, include partents */
    fullName: string,
    treeLevel: number,
    label: string,
    children: CommonTreeOption[]
}

export interface CommentTreeOption extends TreeOption {
    isTag: false,
    isComment: true,
    commentId: string,
    line: number,
    /* lower case comment, to search in */
    searchIndex: string,
    label: string,
};

export interface CommonTreeOption extends TreeOption {
    isComment: true | false,
    isTag: true | false,
};

export interface PluginColors {
    commentedTextColorDark: string,
    commentColorDark: string,
    commentedTextColorLight: string,
    commentColorLight: string
}
class ConstantsAndUtils {
    readonly regExpComment = /\<(?:div|span) class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>([\s\S]+?)\<\/span\>([\s\S]+?)\<\/(?:div|span)\>/gm;
    private readonly regExpTagToggle = /^\<(div|span)( class\=\"ob-html-comment\" id\=\"comment-[0-9a-fA-F\-]+\" data\-tags\=\"\[.*?\]\"\>\<span class\=\"ob-html-comment-body\"\>[\s\S]+?\<\/span\>([\s\S]+?))\<\/(div|span)\>$/;
    private readonly customColorStyleElementId = "ob-html-comment-custom-style";
    constructor() {
    }

    generateCommentId(): string {
        return `comment-${uuidv4()}`;
    }

    selectionToComment(containerTag: string, selection: string): string {
        const escapedSelection = escapeHTML(selection);
        return `<${containerTag} class="ob-html-comment" id="${this.generateCommentId()}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>${escapedSelection}</${containerTag}>`;
    }

    toggleCommentContainerInSelection(selection: string): string | null {
        const matches = this.regExpTagToggle.exec(selection);
        if (matches == null || matches.length < 5) {
            return null;
        }
        let replacementTag: string | null = null;
        let openTag = matches[1];
        if (openTag == "span") {
            replacementTag = "div";
        } else if (openTag == "div") {
            replacementTag = "span";
        } else {
            return null;
        }
        return `<${replacementTag}${matches[2]}</${replacementTag}>`;
    }

    removeCommentInSelection(selection: string): string | null {
        const matches = this.regExpTagToggle.exec(selection);
        if (matches == null || matches.length < 5) {
            return null;
        }
        let openTag = matches[1];
        if (openTag != "span" && openTag != "div") {
            return null;
        }
        return htmlDecode(matches[3]);
    }

    applySettingsColors(colors: PluginColors) {
        let styleEl = document.getElementById(this.customColorStyleElementId);
        if (styleEl) {
            document.head.removeChild(styleEl);
        }
        styleEl = document.createElement('style');
        styleEl.id = this.customColorStyleElementId;
        styleEl.textContent = `
                .view-content .ob-html-comment {
                    background-color: ${colors.commentedTextColorDark};
                }

                .view-content .ob-html-comment:hover>.ob-html-comment-body {
                    background-color: ${colors.commentColorDark};
                }

                .theme-light .view-content .ob-html-comment {
                    background-color: ${colors.commentedTextColorLight};
                }

                .theme-light .view-content .ob-html-comment:hover>.ob-html-comment-body {
                    background-color: ${colors.commentColorLight};
    }`;
        document.head.appendChild(styleEl);
    }

    convertParsetCommentsToCommentsNote(organaizedTagsAndComments: OrganaizedTagsAndComments): string {
        const mapTreeOptionToCommentsNoteEntries = function (option: TreeOption): string[][] {
            if (option.isTag) {
                return mapTagOptionToCommentsNoteEntries(<TagTreeOption><unknown>option);
            } else if (option.isComment) {
                const optionComment = <CommentTreeOption><unknown>option;
                return [[optionComment.label], [`^${optionComment.commentId}`], ["\n"]];
            }
            return [];
        }
        const mapTagOptionToCommentsNoteEntries = function (option: TagTreeOption): string[][] {
            const tagLevel = option.treeLevel + 1;
            const headingPrefix = "#".repeat(tagLevel);
            const currentTagLine = `${headingPrefix} ${option.label}`;
            const result: string[][] = [];
            result.push([currentTagLine])
            if (option.children.length > 0) {
                const childElements = option.children.map(it => mapTreeOptionToCommentsNoteEntries(it))
                    .flatMap(it => it).flatMap(it => it);
                result.push(childElements);
            }
            return result;
        }
        const treeOptions = organaizedTagsAndComments.treeOptions;
        const orphanCommentsContent = treeOptions.filter(it => it.isComment).map(option =>
            mapTreeOptionToCommentsNoteEntries(option)
        );
        const treeOfTagsContent = treeOptions.filter(it => it.isTag).map(option =>
            mapTreeOptionToCommentsNoteEntries(option)
        );

        const commentsFileContent = [...orphanCommentsContent, ...treeOfTagsContent]
            .flatMap(it => it).flatMap(it => it).join("\n");
        return commentsFileContent;
    }

    convertNoteWithCommentsToOriginalNote(noteWithCommentsContent: string, commentNoteName: string): string {
        return noteWithCommentsContent.replace(this.regExpComment,
            `[[${commentNoteName}#^$1|$4]]`);
    }
};

const htmlDecode = (input: string) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

const constantsAndUtils = new ConstantsAndUtils();


export { constantsAndUtils };

