import { reactive } from 'vue';
import { HeadingCache, MarkdownView } from 'obsidian';

const state = reactive({
    activateView() {
        this.plugin.activateView();
        this.refreshTree();
    },
    headers: [] as HeadingCache[],
    dark: true,
    autoExpand: true,
    leafChange: false,
    regexSearch: false,
    rederMarkdown: false,
    searchSupport: true,
    hideUnsearched: false,
    dragModify: false,
    refreshTree() {
        this.leafChange = !this.leafChange;
    },
    currentNote: null as unknown as MarkdownView
});

export { state };
