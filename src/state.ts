import { reactive } from 'vue';
import { HeadingCache, MarkdownView } from 'obsidian';
import { TreeOption } from 'naive-ui';

const state = reactive({
    activateView() {
        this.plugin.activateView();
        this.refreshTree();
    },
    headers: [] as HeadingCache[],
    treeOptions: [] as TreeOption[],
    dark: true,
    autoExpand: true,
    leafChange: false,
    regexSearch: false,
    rederMarkdown: false,
    searchSupport: true,
    hideUnsearched: true,
    refreshTree() {
        this.leafChange = !this.leafChange;
    },
    currentNote: null as MarkdownView | null
});

export { state };
