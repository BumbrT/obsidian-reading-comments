import { App, PluginSettingTab, Setting } from 'obsidian';

import { HtmlCommentsPlugin } from "./plugin";

export interface HtmlCommentsSettings {
    autoExpand: boolean;
}

export const DEFAULT_SETTINGS: HtmlCommentsSettings = {
    autoExpand: false,
}

export class HtmlCommentsSettingTab extends PluginSettingTab {
    plugin: HtmlCommentsPlugin;

    constructor(app: App, plugin: HtmlCommentsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

        new Setting(containerEl)
            .setName('Auto Expand')
            .setDesc('Automatically expand all tags')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoExpand)
                .onChange(
                    async (value) => {
                        this.plugin.settings.autoExpand = value
                        await this.plugin.saveSettings();
                    }
                )
            );
    }
}
