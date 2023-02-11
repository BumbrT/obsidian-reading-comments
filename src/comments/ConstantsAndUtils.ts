import escapeHTML from "escape-html";

export interface TreeItem {
    isComment: true | false,
    isTag: true | false,
};

export interface TagTreeItem {
    isTag: true,
    isComment: false,
    /* full tag name, include partents */
    fullName: string,
};

export interface CommentTreeItem {
    isTag: false,
    isComment: true,
    line: number,
    /* lower case comment, to search in */
    searchIndex: string
};

export interface PluginColors {
    commentedTextColorDark: string,
    commentColorDark: string,
    commentedTextColorLight: string,
    commentColorLight: string
}

const constantsAndUtils = {
    regExpComment: /\<(?:div|span) class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>([\s\S]+?)\<\/(?:div|span)\>/gm,
    regExpTagToggle: /^\<(div|span)( class\=\"ob-html-comment\" id\=\"comment-[0-9a-fA-F\-]+\" data\-tags\=\"\[.*?\]\"\>\<span class\=\"ob-html-comment-body\"\>[\s\S]+?\<\/span\>([\s\S]+?))\<\/(div|span)\>$/,

    selectionToComment(containerTag: string, commentId: string, selection: string): string {
        const escapedSelection = escapeHTML(selection);
        return `<${containerTag} class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>${escapedSelection}</${containerTag}>`;
    },

    toggleTagInSelection(selection: string): string | null {
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
    },

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
    },

    applySettingsColors(colors: PluginColors) {
        let styleEl = document.getElementById(customColorStyleElementId);
        if (styleEl) {
            document.head.removeChild(styleEl);
        }
        styleEl = document.createElement('style');
        styleEl.id = customColorStyleElementId;
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
};

const customColorStyleElementId = "ob-html-comment-custom-style";
const htmlDecode = (input: string) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

export { constantsAndUtils };

