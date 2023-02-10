import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createApp, App } from 'vue';
import HtmlCommentsTemplate from './HtmlCommentsTemplate.vue';
import { HtmlCommentsPlugin } from "./obsidianPlugin";

export const VIEW_TYPE: string = 'reading-comments';

export class HtmlCommentsView extends ItemView {
    vueApp: App;
    plugin: HtmlCommentsPlugin;
    constructor(leaf: WorkspaceLeaf, plugin: HtmlCommentsPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Reading Comments";
    }

    getIcon(): string {
        return "lines-of-text";
    }

    async onOpen(this: HtmlCommentsView) {
        const container = this.containerEl.children[1];
        container.empty();
        const mountPoint = container.createEl("div", {
            cls: "reading-comments"
        });
        this.vueApp = createApp(HtmlCommentsTemplate);
        this.vueApp.config.globalProperties.plugin = this.plugin;
        this.vueApp.config.globalProperties.container = mountPoint;
        this.vueApp.mount(mountPoint);
    }

    async onClose() {
    }
    onunload(): void {
        this.vueApp.unmount();
    }

}
