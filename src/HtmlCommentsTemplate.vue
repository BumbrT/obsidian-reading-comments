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
            <NInput :on-input="onSearchInput" v-model:value="searchInputValue" placeholder="Input to search" size="small" />
        </NSpace>
        <NTree block-line :default-expand-all="plugin.settings.autoExpand" :pattern="searchPattern"
            :data="viewState.viewTreeOptions.value" :selected-keys="[]" :on-update:selected-keys="jumpToCommentOrExpandTag"
            :render-label="renderMethod" :node-props="setNodeProps" :expanded-keys="viewState.viewExpandedKeys.value"
            :on-update:expanded-keys="expand" :filter="viewState.simpleFilter" :show-irrelevant-nodes="false" />
    </NConfigProvider>
</template>

<script setup lang="ts">
import { SettingsBackupRestoreSharp } from '@vicons/material';
import { Icon } from '@vicons/utils';
import { marked } from 'marked';
import { darkTheme, GlobalThemeOverrides, NSpace, NButton, NConfigProvider, NInput, NTree, TreeOption, TreeSelectOption } from 'naive-ui';
import { sanitizeHTMLToDom } from 'obsidian';
import { computed, getCurrentInstance, h, HTMLAttributes, onMounted, reactive, ref, watch } from 'vue';

import { AbstractTreeOption, CommentTreeOption, constantsAndUtils, TagTreeOption } from './comments/ConstantsAndUtils';
import { EventsAggregator } from './internalUtils';
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

let componentSelf = getCurrentInstance();
if (!componentSelf) throw Error("vue not found");
let plugin = componentSelf.appContext.config.globalProperties.plugin as HtmlCommentsPlugin

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

onMounted(() => {
    plugin.applySettingsStylesAndEvents();
});



// load settings
let renderMethod = computed(() => {
    if (viewState.settings.renderMarkdown) {
        return renderLabel;
    }
    return undefined
});

// search
let searchPattern = ref('');
let searchInputValue = ref('');
const searchEventsAggregator = new EventsAggregator(100, () => {
    viewState.viewExpandedKeys.value = [];
    searchPattern.value = searchInputValue.value;
})
// workaround for search bug while typing, just delay and aggregate inputs
function onSearchInput(value: string) {
    searchEventsAggregator.triggerEvent();
}

// click and jump
async function jumpToCommentOrExpandTag(_selected: any, nodes: TreeSelectOption[]) {
    if (nodes[0] === undefined) {
        return;
    }
    const selectedOption = nodes[0] as AbstractTreeOption;
    if (selectedOption.isComment) {
        const line: number = (selectedOption as CommentTreeOption).line as number
        jumpToComment(line);
    } else if (selectedOption.isTag) {
        const tagKey = (selectedOption as TagTreeOption).fullName as string;
        expandOrCollapseTag(tagKey);
    }
}

function jumpToComment(line: number) {
    plugin.withActiveView(view => {
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
    }
    );
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
    plugin.parseActiveViewToCommentsAndClearExpandedItems();
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
