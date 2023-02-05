import { reactive, ref } from 'vue';
import { TreeOption } from 'naive-ui';


const viewState = {
    toggleColorSettingsChanged() {
        this.settingsChangedTrigger = !this.settingsChangedTrigger;
    },
    settings: reactive({
        dark: true,
        rederMarkdown: false,
        hideUnsearched: true,
    }),
    filterPreset: reactive({
        regexSearch: false,
        caseSensitive: false,
    }),
    colorSettingsChangedTrigger: ref(false),
    viewTreeOptions: ref([] as TreeOption[]),
    viewExpandedKeys: ref<string[]>([])
};



export { viewState };
