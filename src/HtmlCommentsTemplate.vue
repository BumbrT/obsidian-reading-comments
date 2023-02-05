<template>
    <div id="container">
        <!-- :theme-overrides="theme === null ? lightThemeConfig : darkThemeConfig" -->
        <NConfigProvider :theme="theme">
            <div class="function-bar" v-if="true">
                <NButton size="small" circle @click="parseCurrentNote">
                    <template #icon>
                        <Icon>
                            <SettingsBackupRestoreSharp :style="iconColor" />
                        </Icon>
                    </template>
                </NButton>
                <NInput v-model:value="pattern" placeholder="Input to search" size="small" clearable />
            </div>
            <NTree block-line :default-expand-all="plugin.settings.autoExpand" :pattern="pattern"
                :data="viewState.viewTreeOptions.value" :selected-keys="[]" :on-update:selected-keys="jumpToCommentOrExpandTag"
                :render-label="renderMethod" :node-props="setNodeProps" :expanded-keys="viewState.viewExpandedKeys.value"
                :on-update:expanded-keys="expand" :filter="filter" :show-irrelevant-nodes="false" />
        </NConfigProvider>
    </div>
</template>

<script setup lang="ts">
import { SettingsBackupRestoreSharp } from '@vicons/material';
import { Icon } from '@vicons/utils';
import { marked } from 'marked';
import { darkTheme, GlobalThemeOverrides, NButton, NConfigProvider, NInput, NTree, TreeOption, TreeSelectOption } from 'naive-ui';
import { sanitizeHTMLToDom } from 'obsidian';
import { computed, getCurrentInstance, h, HTMLAttributes, onMounted, reactive, ref, watch } from 'vue';

import { constantsAndUtils } from './comments/ConstantsAndUtils';
import { HtmlCommentsPlugin } from "./obsidianPlugin";
import { viewState } from './reactiveState';

const lightThemeConfig = reactive<GlobalThemeOverrides>({
    common: {
        primaryColor: "",
        primaryColorHover: "",
    },
    Slider: {
        handleSize: "10px",
        fillColor: "",
        fillColorHover: "",
        dotBorderActive: ""
    },
});
if (!lightThemeConfig) throw Error("TODO investigate vue undefined")

const darkThemeConfig = reactive<GlobalThemeOverrides>({
    common: {
        primaryColor: "#a3a3a3",
        primaryColorHover: "#a3a3a3",
    },
    Slider: {
        handleSize: "10px",
        fillColor: "#a3a3a3",
        fillColorHover: "#a3a3a3",
        dotBorderActive: ""
    }
});
if (!darkThemeConfig) throw Error("TODO investigate vue undefined")


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
let container = compomentSelf.appContext.config.globalProperties.container as HTMLElement;


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
    () => viewState.colorSettingsChangedTrigger,
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
let pattern = ref("");

function regexFilter(pattern: string, option: TreeOption): boolean {
    let rule = /.*/;
    try {
        rule = RegExp(pattern, "i");
    } catch (e) {

    } finally {
        return rule.test(option.label ?? "");
    }
}

function simpleFilter(pattern: string, option: TreeOption): boolean {
    return (option.label ?? "").toLowerCase().contains(pattern.toLowerCase());
}

let filter = computed(() => {
    return viewState.filterPreset.regexSearch ? regexFilter : simpleFilter;
});


// click and jump
async function jumpToCommentOrExpandTag(_selected: any, nodes: TreeSelectOption[]) {
    if (nodes[0] === undefined) {
        return;
    }
    const selectedOption = nodes[0];
    if (selectedOption.type == "comment") {
        const line: number = selectedOption.line as number
        jumpToComment(line);
    } else if (selectedOption.type == "tag") {
        const tagKey = selectedOption.key as string;
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

function parseCurrentNote() {
    pattern.value = "";
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
