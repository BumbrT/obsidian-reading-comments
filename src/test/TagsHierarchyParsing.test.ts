import { describe, expect, test } from '@jest/globals';
import { exitCode, hasUncaughtExceptionCaptureCallback } from 'process';
import { TextToTreeDataParser } from "../comments/TextToTreeDataParser";
import { HtmlComment } from "../comments/HtmlComment";
import { HtmlCommentTag } from "../comments/HtmlCommentTag";

describe("parsing hierarchical comment", () => {
    test("should organise hierarchical coma separated comments", () => {
        const textToAnalyse = `
            <div class="ob-html-comment" id="comment-82842b99-b212-45e6-9703-e58ec1733feb" data-tags="[Overview/Tags,TestTag]"><span class="ob-html-comment-body">CommentPlaceholder</span>Commented Text</div>`
            const parser = new TextToTreeDataParser(textToAnalyse, false);
            const commentsOptions = parser.parsedComments.treeOptions;
            const commentsWithoutTag = commentsOptions.filter(it => it.type === "comment");
            expect(commentsOptions.length).toBe(2);
            expect(commentsWithoutTag.length).toBe(0);
    });

});
