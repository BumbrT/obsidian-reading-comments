<template>
    <div id="container">
        <NConfigProvider :theme="theme" :theme-overrides="theme === null ? lightThemeConfig : darkThemeConfig">
            <div class="function-bar" v-if="state.searchSupport">
                <NButton size="small" circle @click="reset">
                    <template #icon>
                        <Icon>
                            <SettingsBackupRestoreRound :style="iconColor" />
                        </Icon>
                    </template>
                </NButton>
                <NInput v-model:value="pattern" placeholder="Input to search" size="small" clearable />
            </div>
            <code v-if="pattern">{{ matchCount }} result(s): </code>
            <NTree block-line :pattern="pattern" :data="treeData" :on-update:value="jump"
                :render-label="renderMethod" :node-props="setNodeProps" :expanded-keys="expanded"
                :on-update:expanded-keys="expand" :key="update_tree" :filter="filter"
                :show-irrelevant-nodes="!state.hideUnsearched" :class="{ 'ellipsis': state.ellipsis }"
                :draggable="state.dragModify" @drop="onDrop" />
        </NConfigProvider>
    </div>
</template>

<script setup lang="ts">
import { ref, toRef, reactive, toRaw, computed, watch, nextTick, getCurrentInstance, onMounted, onUnmounted, HTMLAttributes, h, watchEffect } from 'vue';
import { Notice, MarkdownView, sanitizeHTMLToDom, HeadingCache, debounce } from 'obsidian';
import { NTree, TreeSelectOption, NButton, NInput, NSlider, NConfigProvider, darkTheme, GlobalThemeOverrides, TreeDropInfo, TreeOption } from 'naive-ui';
import { Icon } from '@vicons/utils';
import { SettingsBackupRestoreRound } from '@vicons/material';
import { marked } from 'marked';

import { formula, internal_link, highlight, tag, remove_href, renderer } from './parser';
import { state } from './state';
import { HtmlComments } from "./plugin";
import { createTreeMateOptions } from 'naive-ui/es/tree/src/Tree';

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
        primaryColor: "",
        primaryColorHover: "",
    },
    Slider: {
        handleSize: "10px",
        fillColor: "",
        fillColorHover: "",
        dotBorderActive: ""
    }
});
if (!darkThemeConfig) throw Error("TODO investigate vue undefined")


// toggle light/dark theme
let theme: any = computed(() => {
    if (state.dark) {
        return darkTheme;
    }
    return null;
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

let rainbowColor1 = ref("");
let rainbowColor2 = ref("");
let rainbowColor3 = ref("");
let rainbowColor4 = ref("");
let rainbowColor5 = ref("");

function hexToRGB(hex: string) {
    return `${parseInt(hex.slice(1, 3), 16)},`
        + `${parseInt(hex.slice(3, 5), 16)},`
        + `${parseInt(hex.slice(5, 7), 16)}`;
}

onMounted(() => {
    addEventListener("quiet-outline-reset", reset);
});
onUnmounted(() => {
    removeEventListener("quiet-outline-reset", reset);
});

let compomentSelf = getCurrentInstance();
if (!compomentSelf) throw Error("vue not found");
let plugin = compomentSelf.appContext.config.globalProperties.plugin as HtmlComments;
let container = compomentSelf.appContext.config.globalProperties.container as HTMLElement;

// register scroll event
onMounted(() => {
    document.addEventListener("scroll", handleScroll, true);
});

onUnmounted(() => {
    document.removeEventListener("scroll", handleScroll, true);
});

let toKey = (h: HeadingCache, i: number) => "item-" + h.level + "-" + i;

let handleScroll = debounce(_handleScroll, 100);

function _handleScroll(evt: Event) {
    let target = evt.target as HTMLElement;
    if (!target.classList.contains("markdown-preview-view") && !target.classList.contains("cm-scroller")) {
        return;
    }
    // const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    const view = plugin.current_note;

    if (!view) return;

    let current_line = view.currentMode.getScroll() + 8;
    let current_heading  = null as unknown as HeadingCache;

    let i = state.headers.length;
    while (--i >= 0) {
        if (state.headers[i].position.start.line <= current_line) {
            current_heading = state.headers[i];
            break;
        }
    }
    if (!current_heading) {
        return;
    }

    let index = i;

    if (plugin.settings.autoExpand) {
        let should_expand = index < state.headers.length - 1 && state.headers[index].level < state.headers[index + 1].level
            ? [toKey(current_heading, index)]
            : [];

        let level = current_heading.level;
        while (i-- > 0) {
            if (state.headers[i].level < level) {
                should_expand.push(toKey(state.headers[i], i));
                level = state.headers[i].level;
            }
            if (level === 1) {
                break;
            }
        }
        expanded.value = should_expand;
    }
    let prevLocation = container.querySelector(".n-tree-node.located");
    if (prevLocation) {
        prevLocation.removeClass("located");
    }
    let curLocation = container.querySelector(`#no-${index}`);
    if (curLocation) {
        curLocation.addClass("located");
        curLocation.scrollIntoView({ block: "center", behavior: "smooth" });
    } else {
        setTimeout(() => {
            let curLocation = container.querySelector(`#no-${index}`);
            if (curLocation) {
                curLocation.addClass("located");
                curLocation.scrollIntoView({ block: "center", behavior: "smooth" });
            }
        }, 0);
    }
}


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

let matchCount = computed(() => {
    return state.headers.filter((h) => {
        let node = { label: h.heading } as TreeOption;
        return filter.value(pattern.value, node);
    }).length;
});


// click and jump
async function jump(_selected: any, nodes: TreeSelectOption[]) {
    if (nodes[0] === undefined) {
        return;
    }

    const key_value = (nodes[0].key as string).split("-");
    const key = parseInt(key_value[2]);
    let line: number = state.headers[key].position.start.line;

    // const view = state.plugin.app.workspace.getActiveViewOfType(MarkdownView)
    const view = plugin.current_note;
    if (view) {
        view.setEphemeralState({ line });
        setTimeout(() => { view.setEphemeralState({ line }); }, 100);
    }
}

// prepare data for tree component
let treeData = computed(() => {
    return makeTree(state.headers);
});

function makeTree(headers: HeadingCache[]): TreeOption[] {

    let tree: TreeOption[] = arrToTree(headers);
    return tree;
}

function arrToTree(headers: HeadingCache[]): TreeOption[] {
    const root: TreeOption = { children: [] };
    const stack = [{ node: root, level: -1 }];

    headers.forEach((h, i) => {
        let node: TreeOption = {
            label: h.heading,
            key: "item-" + h.level + "-" + i,
            line: h.position.start.line,
        };

        while (h.level <= (stack.last()?.level ?? -1)) {
            stack.pop();
        }

        let parent = stack.last()?.node;
        if (!parent) {
            parent = root
        }
        if (!parent.children) {
            parent.children = [];
        }
        parent.children.push(node);
        stack.push({ node, level: h.level });
    });

    return root.children ?? [];
}


// render markdown
marked.use({ extensions: [formula, internal_link, highlight, tag] });
marked.use({ walkTokens: remove_href });
marked.use({ renderer });

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


<style>
/* ============ */
/*  彩虹大纲线   */
/* rainbow line */
/* ============ */
.quiet-outline .n-tree .n-tree-node-indent {
    content: "";
    height: unset;
    align-self: stretch;
}

.quiet-outline .level-2 .n-tree-node-indent,
.quiet-outline .level-3 .n-tree-node-indent:first-child,
.quiet-outline .level-4 .n-tree-node-indent:first-child,
.quiet-outline .level-5 .n-tree-node-indent:first-child,
.quiet-outline .level-6 .n-tree-node-indent:first-child {
    border-right: var(--nav-indentation-guide-width) solid v-bind(rainbowColor1);
    /* border-right: 2px solid rgb(253, 139, 31, 0.6); */
}

.quiet-outline .level-3 .n-tree-node-indent,
.quiet-outline .level-4 .n-tree-node-indent:nth-child(2),
.quiet-outline .level-5 .n-tree-node-indent:nth-child(2),
.quiet-outline .level-6 .n-tree-node-indent:nth-child(2) {
    border-right: var(--nav-indentation-guide-width) solid v-bind(rainbowColor2);
    /* border-right: 2px solid rgb(255, 223, 0, 0.6); */
}

.quiet-outline .level-4 .n-tree-node-indent,
.quiet-outline .level-5 .n-tree-node-indent:nth-child(3),
.quiet-outline .level-6 .n-tree-node-indent:nth-child(3) {
    border-right: var(--nav-indentation-guide-width) solid v-bind(rainbowColor3);
    /* border-right: 2px solid rgb(7, 235, 35, 0.6); */
}

.quiet-outline .level-5 .n-tree-node-indent,
.quiet-outline .level-6 .n-tree-node-indent:nth-child(4) {
    border-right: var(--nav-indentation-guide-width) solid v-bind(rainbowColor4);
    /* border-right: 2px solid rgb(45, 143, 240, 0.6); */
}

.quiet-outline .level-6 .n-tree-node-indent {
    border-right: var(--nav-indentation-guide-width) solid v-bind(rainbowColor5);
    /* border-right: 2px solid rgb(188, 1, 226, 0.6); */
}
</style>
