import { marked } from 'marked';
import { renderMath, finishRenderMath, loadMathJax } from 'obsidian';
import { state } from './state';

type Extension = marked.TokenizerExtension & marked.RendererExtension;

// parse $xxx$ format
export const formula: Extension = {
    name: "formula",
    level: "inline",
    start(src) {
        return src.match(/\$/)?.index;
    },
    tokenizer(src, tokens) {
        const rule = /^\$([^\$]+)\$/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'formula',
                raw: match[0],
                formula: match[1].trim(),
            };
        }
    },
    renderer(token) {
        try {
            const formula = renderMath(token.formula, false).outerHTML;
            finishRenderMath();
            return formula;
        } catch {
            loadMathJax().then(() => {
                //store.activeView()
                state.refreshTree();
            });
            return false;
        }
    }
};

// parse [[xxx]] format
export const internal_link: Extension = {
    name: "internal",
    level: "inline",
    start(src) {
        return src.match(/\[\[/)?.index;
    },
    tokenizer(src, token) {
        const rule = /^\[\[([^\[\]]+?)\]\]/;
        const match = rule.exec(src);
        if (match) {
            const alias = /.*\|(.*)/.exec(match[1]);
            return {
                type: "internal",
                raw: match[0],
                internal: alias ? alias[1] : match[1],
            };
        }
    },
    renderer(token) {
        return `<span class="internal-link">${token.internal}</span>`;
    }
};

// parse ==xxx== format
export const highlight: Extension = {
    name: "highlight",
    level: "inline",
    start(src) {
        return src.match(/==/)?.index;
    },
    tokenizer(src, token) {
        const rule = /^==([^=]+)==/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: "highlight",
                raw: match[0],
                internal: match[1],
            };
        }
    },
    renderer(token) {
        return `<mark>${token.internal}</mark>`;
    }
};

// parse tags eg. #tag
export const tag: Extension = {
    name: "tag",
    level: "inline",
    start(src) {
        return src.match(/^#|(?<=\s)#/)?.index;
    },
    tokenizer(src, token) {
        const rule = /^#([^\[\]{}:;'"`~,.<>?|\\!@#$%^&*()=+\d\s][^\[\]{}:;'"`~,.<>?|\\!@#$%^&*()=+\s]*)/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: "tag",
                raw: match[0],
                internal: match[1],
            };
        }
    },
    renderer(token) {
        return `<a href="" class="tag" target="_blank" rel="noopener">#${token.internal}</a>`;
    }
};

// remove url inside <a>
export const remove_href = (token: marked.Token) => {
    if (token.type === "link") {
        token.href = "javascript:void(0);";
    }
};


// remove <ol>
export const renderer = {
    list(body: string, ordered: boolean, start: number) {
        if (ordered)
            return `<p>${start}. ${body}</p>`;
        else
            return `<p>${body}</p>`;
    },
    listitem(text: string, task: boolean, checked: boolean) {
        return `${text}`;
    }

};
