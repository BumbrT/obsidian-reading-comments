import { reactive, ref } from 'vue';
import { TreeOption } from 'naive-ui';

const viewState = reactive({
    toggleSettingsChanged() {
        this.settingsChangedTrigger = !this.settingsChangedTrigger;
    },
    dark: true,
    regexSearch: false,
    rederMarkdown: false,
    hideUnsearched: true,
    settingsChangedTrigger: false,
});

let viewTreeOptions = ref([] as TreeOption[]);

let viewExpandedKeys = ref<string[]>([]);


export { viewState, viewTreeOptions, viewExpandedKeys };
