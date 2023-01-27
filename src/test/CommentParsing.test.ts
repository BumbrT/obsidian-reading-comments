import { describe, expect, test } from '@jest/globals';
import { exitCode, hasUncaughtExceptionCaptureCallback } from 'process';
import { TextToTreeDataParser } from "../comments/TextToTreeDataParser";
import { HtmlComment } from "../comments/HtmlComment";
import { HtmlCommentTag } from "../comments/HtmlCommentTag";

describe("parsing hierarchical comment", () => {

    test("should organise comments to tree view", () => {
        const textToAnalyse = `
        Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
    Struct - структура книги (кратко методы и способы чтения)
    <span class="ob-html-comment" id="comment-92d3475d-b262-4a8b-8990-b67f182fb4c1" data-tags="[#test]"><span class="ob-html-comment-body">#test CommentPlaceholder</span>Tip - **практический** совет</span>
    <span class="ob-html-comment" id="comment-e5e2a999-de9b-4582-ab4d-f7b666a89bd0" data-tags="[Rule/One]"><span class="ob-html-comment-body">CommentPlaceholder</span>Class - классификация книг, наук</span>
        `;
        const parser = new TextToTreeDataParser(textToAnalyse);
        const commentsOptions = parser.parsedComments.treeOptions;
        const commentsWithoutTag = commentsOptions.filter(it => it.type === "comment");
        expect(commentsOptions.length).toBe(2);
        expect(commentsWithoutTag.length).toBe(0);
    });

    test.skip("should organise hierarchical comment to tree view", () => {
        const textToAnalyse = `
        Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
    Struct - структура книги (кратко методы и способы чтения)
    <span class="ob-html-comment" id="comment-e5e2a999-de9b-4582-ab4d-f7b666a89bd0" data-tags="[Rule/One]"><span class="ob-html-comment-body">CommentPlaceholder</span>Class - классификация книг, наук</span>
        `;
        const parser = new TextToTreeDataParser(textToAnalyse);
        const commentsOptions = parser.parsedComments.treeOptions;
        for (let option of commentsOptions) {
            if (option.key == "Rule") {
                expect(option.children?.length).toBe(1)
                const childOptions = option.children
                if (childOptions == null) {
                    fail("should have child");
                }
                if (childOptions[0].key == "Rule/One") {
                    expect(childOptions[0].children?.length).toBe(1)
                } else {
                    fail("Rule/One should have child comment");
                }
            } else {
                fail("onlty tags above should be present");
            }
        }
        const commentsWithoutTag = commentsOptions.filter(it => it.type === "comment");
        expect(commentsOptions.length).toBe(1);
        expect(commentsWithoutTag.length).toBe(0);
    });
});

describe("parsing comment", () => {
    test.skip("should organise comments to tree view", () => {
        const textToAnalyse = `
        Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
    Struct - структура книги (кратко методы и способы чтения)
    <span class="ob-html-comment" id="comment-92d3475d-b262-4a8b-8990-b67f182fb4c1" data-tags="[comment,#test]"><span class="ob-html-comment-body">#test CommentPlaceholder</span>Tip - **практический** совет</span>
    <span class="ob-html-comment" id="comment-e5e2a999-de9b-4582-ab4d-f7b666a89bd0" data-tags="[]"><span class="ob-html-comment-body">CommentPlaceholder</span>Class - классификация книг, наук</span>
        `;
        const parser = new TextToTreeDataParser(textToAnalyse);
        const comments = parser.parsedComments.treeOptions;
        const commentsWithoutTag = comments.filter(it => it.type === "comment");
        expect(comments.length).toBe(3);
        expect(commentsWithoutTag.length).toBe(1);
        console.log(JSON.stringify(comments));
    });


    test.skip('should match regex', () => {
        const regExSpan =
            /\<span class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>(.+?)\<\/span\>/gm
        const lineContent = `ss
        <span class="ob-html-comment" id="comment-e5e2a999-de9b-4582-ab4d-f7b666a89bd0" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>Class - классификация книг, наук</span>
        zz
        `;
        const result = regExSpan.exec(lineContent);
        expect(result?.length).toBeGreaterThan(0);
        console.log(result);
    });

    test.skip('empty comment should match regex', () => {
        const regExSpan =
            /\<span class\=\"ob-html-comment\" id\=\"comment-([0-9a-fA-F\-]+)\" data\-tags\=\"\[(.*?)\]\"\>\<span class\=\"ob-html-comment-body\"\>(.+?)\<\/span\>/gm
        const lineContent = `ss
        <span class="ob-html-comment" id="comment-e5e2a999-de9b-4582-ab4d-f7b666a89bd0" data-tags="[]"><span class="ob-html-comment-body">CommentPlaceholder</span>Class - классификация книг, наук</span>
        zz
        `;
        const result = regExSpan.exec(lineContent);
        expect(result?.length).toBeGreaterThan(0);
        console.log(result);
    });
});





