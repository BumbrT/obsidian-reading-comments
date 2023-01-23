import {describe, expect, test} from '@jest/globals';
import { HtmlCommentWithTags, HtmlCommentTag } from './HtmlComments'


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


test.skip('should parse simple tag', () => {
    const tagStr = "comments";
    const parsedTag = new HtmlCommentTag(tagStr);
    expect(parsedTag.name).toBe("comments");
});

test.skip('should parse simple hierarchical tag', () => {
    const tagStr = "parent/child/child-two";
    const parsedTag = new HtmlCommentTag(tagStr);
    expect(parsedTag.name).toBe("parent");
    expect(parsedTag.child?.name).toBe("child");
    expect(parsedTag.child?.child?.name).toBe("child-two");
});

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
