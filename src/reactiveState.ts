import { reactive, ref } from 'vue';
import { TreeOption } from 'naive-ui';
import { CommentTreeOption } from './comments/ConstantsAndUtils';


const viewState = {
    settings: reactive({
        dark: true,
        renderMarkdown: false,
    }),
	defaultTag: ref(''),
    filterPreset: reactive({
        regexSearch: false,
        caseSensitive: false,
    }),
    viewTreeOptions: ref<TreeOption[]>([]),
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
