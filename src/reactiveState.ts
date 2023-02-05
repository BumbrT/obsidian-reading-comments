import { reactive, ref } from 'vue';
import { TreeOption } from 'naive-ui';


const viewState = {
    toggleSettingsChanged() {
        this.settingsChangedTrigger = !this.settingsChangedTrigger;
    },
    settings: reactive({

        dark: true,
        regexSearch: false,
        rederMarkdown: false,
        hideUnsearched: true,
        settingsChangedTrigger: false,
    }),
    viewTreeOptions: ref([] as TreeOption[]),

    viewExpandedKeys: ref<string[]>([])
};





export { viewState, viewTreeOptions, viewExpandedKeys };
