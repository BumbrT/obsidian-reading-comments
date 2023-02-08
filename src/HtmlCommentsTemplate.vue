<template>
    <NConfigProvider :theme="theme">
        <NSpace>
            <NButton size="small" circle @click="clearFiltersAndParseCurrentNote">
                <template #icon>
                    <Icon>
                        <SettingsBackupRestoreSharp :style="iconColor" />
                    </Icon>
                </template>
            </NButton>
            <NInput :on-input="onSearchInput" v-model:value="searchInputValue" placeholder="Input to search" size="small" clearable />
        </NSpace>
        <NTree block-line :default-expand-all="plugin.settings.autoExpand" :pattern="searchPattern"
            :data="viewState.viewTreeOptions.value" :selected-keys="[]"
            :on-update:selected-keys="jumpToCommentOrExpandTag" :render-label="renderMethod" :node-props="setNodeProps"
            :expanded-keys="viewState.viewExpandedKeys.value" :on-update:expanded-keys="expand" :filter="viewState.simpleFilter"
            :show-irrelevant-nodes="false" />
    </NConfigProvider>
</template>

<script setup lang="ts">
import { SettingsBackupRestoreSharp } from '@vicons/material';
import { Icon } from '@vicons/utils';
import { marked } from 'marked';
import { darkTheme, GlobalThemeOverrides, NSpace, NButton, NConfigProvider, NInput, NTree, TreeOption, TreeSelectOption } from 'naive-ui';
import { sanitizeHTMLToDom } from 'obsidian';
import { computed, getCurrentInstance, h, HTMLAttributes, onMounted, reactive, ref, watch } from 'vue';

import { constantsAndUtils, TreeItem, TagTreeItem, CommentTreeItem } from './comments/ConstantsAndUtils';
import { HtmlCommentsPlugin } from "./obsidianPlugin";
import { viewState } from './reactiveState';


// toggle light/dark theme
let theme: any = computed(() => {
    if (viewState.settings.dark) {
        return darkTheme;
    }
    return undefined;
});
let iconColor = computed(() => {
    if (viewState.settings.dark) {
        return { color: "#a3a3a3" };
    }
    return { color: "#727272" };
});

let compomentSelf = getCurrentInstance();
if (!compomentSelf) throw Error("vue not found");
let plugin = compomentSelf.appContext.config.globalProperties.plugin as HtmlCommentsPlugin

const setNodeProps = computed(() => {
    return (info: { option: TreeSelectOption; }): HTMLAttributes & Record<string, unknown> => {
        const ellipsis = false
        const labelDirection = "left" as "top" | "bottom" | "left" | "right"
        return {
            "aria-label": ellipsis ? info.option.label : "",
            "aria-label-position": labelDirection,
        };
    };
});


function expand(keys: string[], option: TreeOption[]) {
    viewState.viewExpandedKeys.value = keys;
}

watch(
    () => viewState.colorSettingsChangedTrigger.value,
    () => {
        constantsAndUtils.applySettingsColors(plugin.settings);
    }
);

onMounted(() => {
    constantsAndUtils.applySettingsColors(plugin.settings);
});



// load settings
let renderMethod = computed(() => {
    if (viewState.settings.rederMarkdown) {
        return renderLabel;
    }
    return undefined
});

// search
let searchPattern = ref('');
let searchInputValue = ref('');
let searchTriggered = false;
// workaround for search bug while typing, just delay and aggregate inputs
function onSearchInput(value: string) {
    searchTriggered = true;
    setTimeout(() => {
        if (searchTriggered) {
            searchTriggered = false;
            viewState.viewExpandedKeys.value = [];
            searchPattern.value = searchInputValue.value;
        }
     }, 100);
}

// click and jump
async function jumpToCommentOrExpandTag(_selected: any, nodes: TreeSelectOption[]) {
    if (nodes[0] === undefined) {
        return;
    }
    const selectedOption = nodes[0] as TreeItem;
    if (selectedOption.isComment) {
        const line: number = (selectedOption as CommentTreeItem).line as number
        jumpToComment(line);
    } else if (selectedOption.isTag) {
        const tagKey = (selectedOption as TagTreeItem).fullName as string;
        expandOrCollapseTag(tagKey);
    }
}

function jumpToComment(line: number) {
    const view = plugin.currentNote;
    if (view) {
        view.editor.focus();

        if (view.getMode() == "source") {
            view.setEphemeralState({ line });
            setTimeout(() => { view.editor.setCursor(line - 1) }, 100);
        } else {
            let scrollToPosition: number = line - 1;
            if (scrollToPosition < 0) {
                scrollToPosition = 0;
            }
            const state = { scroll: scrollToPosition };
            view.setEphemeralState(state);
        }
    } else {
        console.error(`view not found`);
    }
}

function expandOrCollapseTag(tagKey: string) {
    if (viewState.viewExpandedKeys.value.contains(tagKey)) {
        viewState.viewExpandedKeys.value.remove(tagKey);
    } else {
        viewState.viewExpandedKeys.value.push(tagKey);
    }
}

function clearFiltersAndParseCurrentNote() {
    searchInputValue.value = "";
    searchPattern.value = "";
    plugin.parseActiveViewToComments();
}

function renderLabel({ option, checked, selected }: { option: TreeOption; checked: boolean; selected: boolean; }) {
    let result = marked.parse(option.label ?? "").trim();

    // save mjx elements
    let i = 0;
    let mjxes = result.match(/<mjx-container.*?>.*?<\/mjx-container>/g) ?? [];

    result = sanitizeHTMLToDom(`<div>${result}</div>`).children[0].innerHTML;

    // restore mjx elements
    result = result.replace(/<math.*?>.*?<\/math>/g, () => {
        return mjxes[i++];
    });

    return h("div", { innerHTML: result });
}

</script>
