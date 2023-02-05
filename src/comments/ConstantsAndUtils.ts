import escapeHTML from "escape-html";

export interface TreeItem {
    isComment: true | false,
    isTag: true | false,
};

export interface TagTreeItem extends TreeItem {
    isTag: true,
    isComment: false,
    key: string,
    children: TagTreeItem | CommentTreeItem[]
};

export interface CommentTreeItem {
    isTag: false,
    isComment: true,
    line: number,
    searchIndex: string
};

export interface PluginColors {
    commentedTextColorDark: string,
    commentColorDark: string,
    commentedTextColorLight: string,
    commentColorLight: string
}

const constantsAndUtils = {
    regExpComment: /\<div class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>([\s\S]+?)\<\/span\>/gm,

    selectionToComment(commentId: string, selection: string): string {
        const escapedSelection = escapeHTML(selection);
        return `<div class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>${escapedSelection}</div>`;
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

export { constantsAndUtils };

