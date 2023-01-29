import { reactive } from 'vue';
import { MarkdownView } from 'obsidian';
import { TreeOption } from 'naive-ui';

const state = reactive({
    activateView() {
        this.plugin.activateView();
        this.refreshTree();
    },
    treeOptions: [] as TreeOption[],
    dark: true,
    autoExpand: true,
    expandedKeys: [] as string[],
    leafChange: false,
    regexSearch: false,
    rederMarkdown: false,
    hideUnsearched: true,
    refreshTree() {
        this.leafChange = !this.leafChange;
    },
    currentNote: null as MarkdownView | null
});

export { state };
