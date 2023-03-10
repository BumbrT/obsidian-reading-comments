import { reactive, ref } from 'vue';
import { TreeOption } from 'naive-ui';
import { CommentTreeOption } from './comments/ConstantsAndUtils';


const viewState = {
    toggleColorSettingsChanged() {
        this.colorSettingsChangedTrigger.value = !this.colorSettingsChangedTrigger.value;
    },
    settings: reactive({
        dark: true,
        renderMarkdown: false,
    }),
    filterPreset: reactive({
        regexSearch: false,
        caseSensitive: false,
    }),
    colorSettingsChangedTrigger: ref(false),
    viewTreeOptions: ref([] as TreeOption[]),
    viewExpandedKeys: ref<string[]>([]),
    regexFilter(pattern: string, option: TreeOption): boolean {
        let rule = /.*/;
        try {
            rule = RegExp(pattern, "i");
        } catch (e) {

        } finally {
            return rule.test(option.label ?? "");
        }
    },

    simpleFilter(pattern: string, option: TreeOption): boolean {
        const commentOption = option as unknown as CommentTreeOption;
        if (commentOption.searchIndex) {
            return commentOption.searchIndex.includes(pattern.toLowerCase());
        } else {
            return false;
        }
    }
};



export { viewState };
