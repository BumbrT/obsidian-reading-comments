<template>
    <div id="container">
        <!-- :theme-overrides="theme === null ? lightThemeConfig : darkThemeConfig" -->
        <NConfigProvider :theme="theme">
            <div v-if="state.searchSupport">
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
                :expanded-keys="expanded" :on-update:expanded-keys="expand" :key="update_tree" :filter="filter"
                :show-irrelevant-nodes="!state.hideUnsearched" @drop="onDrop" />
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

function getDefaultColor() {
    let button = document.body.createEl("button", { cls: "mod-cta", attr: { style: "width: 0px; height: 0px;" } });
    let color = getComputedStyle(button, null).getPropertyValue("background-color");
    button.remove();
    return color;
}

onMounted(() => {
    addEventListener("quiet-outline-reset", reset);
});
onUnmounted(() => {
    removeEventListener("quiet-outline-reset", reset);
});

let compomentSelf = getCurrentInstance();
if (!compomentSelf) throw Error("vue not found");
let plugin = compomentSelf.appContext.config.globalProperties.plugin as HtmlCommentsPlugin
let container = compomentSelf.appContext.config.globalProperties.container as HTMLElement;

// register scroll event
// onMounted(() => {
//     document.addEventListener("scroll", handleScroll, true);
// });

// onUnmounted(() => {
//     document.removeEventListener("scroll", handleScroll, true);
// });



// add html attributes to nodes

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

// TODO - watching for variable
// watch(
//     level,
//     (cur, prev) => {
//         switchLevel(cur);
//     }
// );

// force remake tree
let update_tree = ref(0);

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

function formatTooltip(value: number): string {
    let num = state.headers.filter((h) => h.level === value).length;

    if (value > 0) {
        return `H${value}: ${num}`;
    }
    return "No expand";
}


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
        // setTimeout(() => { view.setEphemeralState({ line }); }, 100);
    } else {
        console.log(`view not found`);
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

// reset button
function reset() {
    pattern.value = "";
}

// drag and drop
async function onDrop({ node, dragNode, dropPosition }: TreeDropInfo) {
    // return;
    const file = plugin.app.workspace.getActiveFile();
    if (!file) {
        throw Error("File not found");
    }
    let lines = (await plugin.app.vault.read(file)).split("\n");
    let rawExpand = toRaw(expanded.value);

    const dragStart = getNo(dragNode);
    const dragEnd = dragStart + countTree(dragNode) - 1;
    let moveStart = 0, moveEnd = 0;
    switch (dropPosition) {
        case "inside": {
            const lastNode = node.children?.last()
            if (!lastNode) {
                throw new Error("Last node not found")
            }
            node = lastNode;
        }
        case "after": {
            if (dragStart > getNo(node) + countTree(node)) {
                moveStart = getNo(node) + countTree(node);
                moveEnd = dragStart - 1;
            } else {
                moveStart = dragEnd + 1;
                moveEnd = getNo(node) + countTree(node) - 1;
            }
            break;
        }
        case "before": {
            if (dragStart > getNo(node)) {
                moveStart = getNo(node);
                moveEnd = dragStart - 1;
            } else {
                moveStart = dragStart + countTree(dragNode);
                moveEnd = getNo(node) - 1;
            }
            break;
        }
    }
    const levDelta = getLevel(node) - getLevel(dragNode);
    changeExpandKey(rawExpand, dragStart, dragEnd, moveStart, moveEnd, levDelta);
    moveSection(
        lines,
        getLine(dragStart)[0],
        getLine(dragEnd)[1] || lines.length - 1,
        getLine(moveStart)[0],
        getLine(moveEnd)[1] || lines.length - 1,
        levDelta
    );

    plugin.app.vault.modify(file, lines.join("\n"));
}

function getLine(headNo: number) {
    return [
        state.headers[headNo].position.start.line,
        state.headers[headNo + 1]?.position.start.line - 1
    ];
}

// dls: drag lines start  mle: move lines end
function moveSection(lines: string[], dls: number, dle: number, mls: number, mle: number, delta: number) {
    let newPos = 0;
    if (dls < mls) {
        let moved = lines.splice(mls, mle - mls + 1);
        lines.splice(dls, 0, ...moved);
        newPos = dls + (mle - mls) + 1;
    } else {
        let moved = lines.splice(dls, dle - dls + 1);
        lines.splice(mls, 0, ...moved);
        newPos = mls;
    }
    for (let i = newPos; i <= newPos + (dle - dls); ++i) {
        if (lines[i].match(/^#+ /)) {
            delta > 0
                ? lines[i] = Array(delta).fill("#").join("") + lines[i]
                : lines[i] = lines[i].slice(-delta);
        }
    }
}

function changeExpandKey(expanded: string[], ds: number, de: number, ms: number, me: number, delta: number) {
    let dNewPos = 0, mNewPos = 0;
    if (ds < ms) {
        mNewPos = ds;
        dNewPos = ds + (me - ms) + 1;
    } else {
        dNewPos = ms;
        mNewPos = ms + (de - ds) + 1;
    }
    expanded.forEach((key, i) => {
        const no = getNo(key);
        if (ds <= no && no <= de) {
            expanded[i] = `item-${getLevel(key) + delta}-${dNewPos + (no - ds)}`;
        }
        if (ms <= no && no <= me) {
            expanded[i] = `item-${getLevel(key)}-${mNewPos + (no - ms)}`;
        }
    });
}

function getNo(node: TreeOption | string): number {
    if (typeof node !== "string") {
        node = node.key as string;
    }
    return parseInt(node.split("-")[2]);
}
function getLevel(node: TreeOption | string): number {
    if (typeof node !== "string") {
        node = node.key as string;
    }
    return parseInt(node.split("-")[1]);

}
function countTree(node: TreeOption): number {
    if (!node.children) return 1;

    return node.children.reduce((sum, n) => {
        return sum + countTree(n);
    }, 1);
}

</script>
