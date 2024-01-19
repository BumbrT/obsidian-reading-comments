import * as crypto from 'crypto';
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
    children: AbstractTreeOption[]
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

export interface AbstractTreeOption extends TreeOption {
    isComment: true | false,
    isTag: true | false,
};

export interface PluginStylesSettings {
    commentedTextColorDark: string,
    commentColorDark: string,
    commentedTextColorLight: string,
    commentColorLight: string,
    showCommentWhenCtrlKeyPressed: boolean,
}
class ConstantsAndUtils {
    readonly regExpCommentSingleLine = /\<(?:div|span) class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>([\s\S]+?)\<\/span\>/gm;
    readonly regExpNativeComment = /%%(.+?)%%/gm;
    private readonly regExpCommentWithCommentedText = /\<(?:div|span) class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>([\s\S]+?)\<\/span\>([\s\S]+?)\<\/(?:div|span)\>/gm;
    private readonly regExpTagToggle = /^\<(div|span)( class\=\"ob-html-comment\" id\=\"comment-[0-9a-fA-F\-]+\" data\-tags\=\"\[.*?\]\"\>\<span class\=\"ob-html-comment-body\"\>[\s\S]+?\<\/span\>([\s\S]+?))\<\/(div|span)\>$/;
    public readonly customColorStyleElementId = "ob-html-comment-custom-style";
    constructor() {
    }

    generateNativeCommentId(lineNumber: number, commentBody: string): string | null {
        if (commentBody && commentBody.length > 0) {
            const hash = crypto.createHash('md5').update(commentBody).digest('hex');
            return `${lineNumber}-${hash}`
        }
        return null;
    }

    generateCommentIdWithPrefix(): string {
        return `comment-${uuidv4()}`;
    }

    selectionToComment(defaultTag: string, containerTag: string, selection: string): string | null {
        if (selection.contains('\n')) {
            return null;
        }
        const escapedSelection = escapeHTML(selection);
        return `<${containerTag} class="ob-html-comment" id="${this.generateCommentIdWithPrefix()}" data-tags="[${defaultTag}]"><span class="ob-html-comment-body">CommentPlaceholder</span>${escapedSelection}</${containerTag}>`;
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

    convertParsedCommentsToCommentsNote(organaizedTagsAndComments: OrganaizedTagsAndComments): string {
        const mapTreeOptionToCommentsNoteEntries = function (option: AbstractTreeOption): string[][] {
            if (option.isTag) {
                return mapTagOptionToCommentsNoteEntries(<TagTreeOption>option);
            } else if (option.isComment) {
                const optionComment = <CommentTreeOption>option;
                return [[optionComment.label], [`^${optionComment.commentId}`], [""]];
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
        const replacer = function (match: string, p1: string, p2: string, p3: string, p4: string): string {
            // decode html, could also remove new line when support
            // const decodedComment = htmlDecode(p4)?.replaceAll("\n", '');
            const decodedComment = htmlDecode(p4);
            return `[[${commentNoteName}#^${p1}|${decodedComment}]]`
        }

        return noteWithCommentsContent.replace(this.regExpCommentWithCommentedText, replacer);
    }

    getPopoverLayout(textContent: string) {
        return `<div class="markdown-embed is-loaded" style="height: revert">
        <div class="markdown-embed-content">
            <div
                class="markdown-preview-view markdown-rendered node-insert-event show-indentation-guide allow-fold-headings allow-fold-lists">
                <div class="markdown-preview-sizer markdown-preview-section">
                        <p>${textContent}</p>
                </div>
            </div>
        </div>
    </div>`;
    }
};

const htmlDecode = (input: string) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

const constantsAndUtils = new ConstantsAndUtils();


export { constantsAndUtils };

