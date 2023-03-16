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
    private readonly regExpCommentWithCommentedText = /\<(?:div|span) class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>([\s\S]+?)\<\/span\>([\s\S]+?)\<\/(?:div|span)\>/gm;
    private readonly regExpTagToggle = /^\<(div|span)( class\=\"ob-html-comment\" id\=\"comment-[0-9a-fA-F\-]+\" data\-tags\=\"\[.*?\]\"\>\<span class\=\"ob-html-comment-body\"\>[\s\S]+?\<\/span\>([\s\S]+?))\<\/(div|span)\>$/;
    private readonly customColorStyleElementId = "ob-html-comment-custom-style";
    constructor() {
    }

    generateCommentId(): string {
        return `comment-${uuidv4()}`;
    }

    selectionToComment(containerTag: string, selection: string): string | null {
        if (selection.contains('\n')) {
            return null;
        }
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

    applySettingsStyles(stylesSettings: PluginStylesSettings) {
        let hoverEffectStyle = "ob-html-comment";
        if (stylesSettings.showCommentWhenCtrlKeyPressed) {
            hoverEffectStyle = "ob-html-comment-ctrl-pressed";
            document.addEventListener('keydown', function(event) {
                if (event.key == "Control") {
                    const commentsEls = document.querySelectorAll('.ob-html-comment');
                    commentsEls.forEach(it => it.classList.add('ob-html-comment-ctrl-pressed'));
                }
            });

            document.addEventListener('keyup', function(event) {
                if (event.key == "Control") {
                    const commentsEls = document.querySelectorAll('.ob-html-comment');
                    commentsEls.forEach(it => it.classList.remove('ob-html-comment-ctrl-pressed'));
                }
            });
        }
        let styleEl = document.getElementById(this.customColorStyleElementId);
        if (styleEl) {
            document.head.removeChild(styleEl);
        }
        styleEl = document.createElement('style');
        styleEl.id = this.customColorStyleElementId;
        styleEl.textContent = `
                .view-content .${hoverEffectStyle}:hover>.ob-html-comment-body {
                    display: inline;
                    position: relative;
                }

                .view-content .ob-html-comment {
                    background-color: ${stylesSettings.commentedTextColorDark};
                }

                .view-content .ob-html-comment:hover>.ob-html-comment-body {
                    background-color: ${stylesSettings.commentColorDark};
                }

                .theme-light .view-content .ob-html-comment {
                    background-color: ${stylesSettings.commentedTextColorLight};
                }

                .theme-light .view-content .ob-html-comment:hover>.ob-html-comment-body {
                    background-color: ${stylesSettings.commentColorLight};
    }`;
        document.head.appendChild(styleEl);
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
};

const htmlDecode = (input: string) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

const constantsAndUtils = new ConstantsAndUtils();


export { constantsAndUtils };

