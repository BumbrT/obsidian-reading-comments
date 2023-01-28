<template>
    <div id="container">
        <!-- :theme-overrides="theme === null ? lightThemeConfig : darkThemeConfig" -->
        <NConfigProvider :theme="theme">
            <div class="function-bar" v-if="state.searchSupport">
                <NButton size="small" circle @click="parseCurrentNote">
                    <template #icon>
                        <Icon>
                            <SettingsBackupRestoreSharp :style="iconColor" />
                        </Icon>
                    </template>
                </NButton>
                <NInput v-model:value="pattern" placeholder="Input to search" size="small" clearable />
            </div>
            <NTree block-line :default-expand-all=true :pattern="pattern" :data="treeData"
                :on-update:selected-keys="jump" :render-label="renderMethod" :node-props="setNodeProps"
                :expanded-keys="expanded" :on-update:expanded-keys="expand" :filter="filter"
                :show-irrelevant-nodes="!state.hideUnsearched" />
        </NConfigProvider>
    </div>
</template>

<script setup lang="ts">
import { ref, toRef, reactive, toRaw, computed, watch, nextTick, getCurrentInstance, onMounted, onUnmounted, HTMLAttributes, h, watchEffect } from 'vue';
import { Notice, MarkdownView, sanitizeHTMLToDom, HeadingCache, debounce } from 'obsidian';
import { NTree, TreeSelectOption, NButton, NInput, NSlider, NConfigProvider, darkTheme, GlobalThemeOverrides, TreeDropInfo, TreeOption } from 'naive-ui';
import { Icon } from '@vicons/utils';
import { SettingsBackupRestoreRound, SettingsBackupRestoreSharp } from '@vicons/material';
import { marked } from 'marked';

import { state } from './state';
import { HtmlCommentsPlugin } from "./plugin";

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
    if (state.dark) {
        return darkTheme;
    }
    return undefined;
});
let iconColor = computed(() => {
    if (state.dark) {
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
        let lev = parseInt((info.option.key as string).split('-')[1]);
        let no = parseInt((info.option.key as string).split('-')[2]);
        const ellipsis = false
        const labelDirection = "left" as "top" | "bottom" | "left" | "right"
        return {
            class: `level-${lev}`,
            id: `no-${no}`,
            "aria-label": ellipsis ? info.option.label : "",
            "aria-label-position": labelDirection,
        };
    };
});

// switch heading expand levels
let expanded = ref<string[]>([]);

function expand(keys: string[], option: TreeOption[]) {
    expanded.value = keys;
}

function switchLevel(lev: number) {
    expanded.value = state.headers
        .map((h, i) => {
            return "item-" + h.level + "-" + i;
        })
        .filter((key, i, arr) => {
            const get_level = (k: string): number => parseInt(k.split('-')[1]);
            if (i === arr.length - 1) return false;
            if (get_level(arr[i]) >= get_level(arr[i + 1])) return false;
            return get_level(key) <= lev;
        });
}

watch(
    () => state.leafChange,
    () => {
        const old_pattern = pattern.value;
        pattern.value = "";
        nextTick(() => {
            pattern.value = old_pattern;
        });

    }
);

// load settings
let renderMethod = computed(() => {
    if (state.rederMarkdown) {
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
    return state.regexSearch ? regexFilter : simpleFilter;
});


// click and jump
async function jump(_selected: any, nodes: TreeSelectOption[]) {
    if (nodes[0] === undefined) {
        return;
    }
    const selectedOption = nodes[0];
    if (selectedOption.type !== "comment") {
        return;
    }
    const line: number = selectedOption.line;

    const view = plugin.currentNote;
    if (view) {
        view.editor.focus();
        view.editor.setCursor(line - 1);
        view.setEphemeralState({ line });
    } else {
        console.error(`view not found`);
    }
}

let treeData = computed(() => {
    return state.treeOptions;
});

function parseCurrentNote() {
    plugin.parseActiveViewToComments();
    pattern.value = "";
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
