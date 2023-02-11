import { describe, expect, test } from '@jest/globals';
import { constantsAndUtils } from '../comments/ConstantsAndUtils';


describe("toggle comments parsing", () => {
    test("can replace siple inline comment", () => {
        const textToAnalyse = `<span class="ob-html-comment" id="comment-275107f9-fed0-44f4-9988-ba5bb445a885" data-tags="[]"><span class="ob-html-comment-body">Inline test1</span>И чем глубже мы их познаем</span>`;
        const expetedResult = `<div class="ob-html-comment" id="comment-275107f9-fed0-44f4-9988-ba5bb445a885" data-tags="[]"><span class="ob-html-comment-body">Inline test1</span>И чем глубже мы их познаем</div>`;
        const replacement = constantsAndUtils.toggleTagInSelection(textToAnalyse);
        expect(replacement).toBe(expetedResult);
    });

    test("can replace multiline comment", () => {
        const textToAnalyse = `<div class="ob-html-comment" id="comment-9668e8b6-674f-440f-b414-3902aeefc4c2" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
        Struct - структура книги (кратко методы и способы чтения)
        Tip - **практический** совет
        Class - классификация книг, наук</div>`;
        const expetedResult = `<span class="ob-html-comment" id="comment-9668e8b6-674f-440f-b414-3902aeefc4c2" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
        Struct - структура книги (кратко методы и способы чтения)
        Tip - **практический** совет
        Class - классификация книг, наук</span>`;
        const replacement = constantsAndUtils.toggleTagInSelection(textToAnalyse);
        expect(replacement).toBe(expetedResult);
    });
});


describe("remove comments parsing", () => {
    test("can replace siple inline comment", () => {
        const textToAnalyse = `<span class="ob-html-comment" id="comment-275107f9-fed0-44f4-9988-ba5bb445a885" data-tags="[]"><span class="ob-html-comment-body">Inline test1</span>И чем глубже мы их познаем</span>`;
        const expetedResult = `И чем глубже мы их познаем`;
        const replacement = constantsAndUtils.removeCommentInSelection(textToAnalyse);
        expect(replacement).toBe(expetedResult);
    });

    test("can replace multiline comment with escaped html", () => {
        const textToAnalyse = `<div class="ob-html-comment" id="comment-9668e8b6-674f-440f-b414-3902aeefc4c2" data-tags="[comment,]"><span class="ob-html-comment-body">CommentPlaceholder</span>Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
        Struct - структура книги (кратко методы и способы чтения)
        Tip - **практический** совет
        Class - классификация книг, наук&lt;</div>`;
        const expetedResult = `Rule* ( Common, One, Two, Three, Four, Practice, Theory, Hud) - описание правила чтения
        Struct - структура книги (кратко методы и способы чтения)
        Tip - **практический** совет
        Class - классификация книг, наук<`;
        const replacement = constantsAndUtils.removeCommentInSelection(textToAnalyse);
        expect(replacement).toBe(expetedResult);
    });
});
