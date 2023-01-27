import { describe, expect, test } from '@jest/globals';
import { exitCode, hasUncaughtExceptionCaptureCallback } from 'process';
import { TextToTreeDataParser } from "../comments/TextToTreeDataParser";
import { HtmlComment } from "../comments/HtmlComment";
import { HtmlCommentTag } from "../comments/HtmlCommentTag";

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

    test.skip('should parse simple hierarchical tag2', () => {
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
        const parsed = new HtmlComment("", tagsStr, "", 0);
        expect(parsed.tags.length).toBe(2);
    });

    test.skip('should parse tags string, ignore coma', () => {
        const tagsStr = "comments,";
        const parsed = new HtmlComment("", tagsStr, "", 0);
        expect(parsed.tags.length).toBe(1);
    });


    test.skip('should parse tags string with duplicate', () => {
        const tagsStr = "comments,tag,tag";
        const parsed = new HtmlComment("", tagsStr, "", 0);
        expect(parsed.tags.length).toBe(2);
    });
});
