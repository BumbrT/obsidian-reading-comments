import escapeHTML from "escape-html";

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
        return `<div class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span><pre>${escapedSelection}</pre></div>`;
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

