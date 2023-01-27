import { describe, expect, test } from '@jest/globals';
import { exitCode, hasUncaughtExceptionCaptureCallback } from 'process';
import { TextToTreeDataParser, HtmlCommentWithTags, HtmlCommentTag } from './HtmlComments'

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

test.skip("should organise comments to tree view", () => {
    const textToAnalyse = `
    Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
Struct - структура книги (кратко методы и способы чтения)
<span class="ob-html-comment" id="comment-92d3475d-b262-4a8b-8990-b67f182fb4c1" data-tags="[#test]"><span class="ob-html-comment-body">#test CommentPlaceholder</span>Tip - **практический** совет</span>
<span class="ob-html-comment" id="comment-e5e2a999-de9b-4582-ab4d-f7b666a89bd0" data-tags="[Rule/One]"><span class="ob-html-comment-body">CommentPlaceholder</span>Class - классификация книг, наук</span>
    `;
    const parser = new TextToTreeDataParser(textToAnalyse);
    const commentsOptions = parser.parsedComments.treeOptions;
    for (let option of commentsOptions) {
        if (option.key == "comment") {
            expect(option.children?.length).toBe(2)
        } else if (option.key == "tag") {
            expect(option.children?.length).toBe(1)
        } else {
            fail("onlty tags above should be present");
        }
    }
    const commentsWithoutTag = commentsOptions.filter(it => it.type === "comment");
    expect(commentsOptions.length).toBe(2);
    expect(commentsWithoutTag.length).toBe(0);
});

test("should organise hierarchical comment to tree view", () => {
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
            const childOption = option.children
            if (childOption == null) {
                fail("should have child");
            }
            if (childOption[0].key == "Rule/One") {
                expect(option.children?.length).toBe(1)
            } else {
                fail("should have child comment");
            }
        } else {
            fail("onlty tags above should be present");
        }
    }
    const commentsWithoutTag = commentsOptions.filter(it => it.type === "comment");
    expect(commentsOptions.length).toBe(1);
    expect(commentsWithoutTag.length).toBe(0);
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

test('empty comment should match regex', () => {
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

describe("parsing tag", () => {
    test.skip('should parse simple tag', () => {
        const tagStr = "comments";
        const parsedTag = new HtmlCommentTag(tagStr);
        expect(parsedTag.name).toBe("comments");
    });

    test.skip('should parse simple hierarchical tag', () => {
        const tagStr = "parent/child/child-two";
        const parsedTag = new HtmlCommentTag(tagStr);
        expect(parsedTag.name).toBe("child-two");
        expect(parsedTag.treeKey).toBe("parent/child/child-two");
        expect(parsedTag.parent?.name).toBe("child");
        expect(parsedTag.parent?.treeKey).toBe("parent/child");
        expect(parsedTag.parent?.parent?.name).toBe("parent");
        expect(parsedTag.parent?.parent?.treeKey).toBe("parent");
    });
});

describe("parsing multiple tags from coma separated string", () => {
    test.skip('should parse tags string', () => {
        const tagsStr = "comments,tag";
        const parsed = new HtmlCommentWithTags("", tagsStr, "", 0);
        expect(parsed.tags.length).toBe(2);
    });

    test.skip('should parse tags string, ignore coma', () => {
        const tagsStr = "comments,";
        const parsed = new HtmlCommentWithTags("", tagsStr, "", 0);
        expect(parsed.tags.length).toBe(1);
    });


    test.skip('should parse tags string with duplicate', () => {
        const tagsStr = "comments,tag,tag";
        const parsed = new HtmlCommentWithTags("", tagsStr, "", 0);
        expect(parsed.tags.length).toBe(2);
    });
});

