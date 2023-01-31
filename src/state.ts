import { reactive } from 'vue';
import { MarkdownView } from 'obsidian';
import { TreeOption } from 'naive-ui';

const state = reactive({
    activateView() {
        this.plugin.activateView();
        this.refreshTree();
    },
    toggleSettingsChanged() {
        this.settingsChanged = !this.settingsChanged;
    },
    treeOptions: [] as TreeOption[],
    dark: true,
    expandedKeys: [] as string[],
    leafChange: false,
    regexSearch: false,
    rederMarkdown: false,
    hideUnsearched: true,
    settingsChanged: false,
    refreshTree() {
        this.leafChange = !this.leafChange;
    },
    currentNote: null as MarkdownView | null
});

export { state };
