import escapeHTML from "escape-html";

const constantsAndUtils = {
    regExpComment: /\<div class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>(.+?)\<\/span\>/gm,

    selectionToComment(commentId: string, selection: string): string {
        const escapedSelection = escapeHTML(selection);
        return `<div class="ob-html-comment" id="comment-${commentId}" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span><pre>${escapedSelection}</pre></div>`;
    }
};

export { constantsAndUtils };
