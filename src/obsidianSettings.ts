import { App, PluginSettingTab, Setting } from 'obsidian';

import { HtmlCommentsPlugin } from "./obsidianPlugin";
import { PluginStylesSettings } from './comments/ConstantsAndUtils'

export interface HtmlCommentsSettings extends PluginStylesSettings {
    autoExpand: boolean;
    liveReloadOnEdit: boolean;
    container: string;
    parseNativeComments: boolean;
	showDefaultTagEditor: boolean;
	defaultTagEditorValue: string;
}

export const DEFAULT_SETTINGS: HtmlCommentsSettings = {
    autoExpand: false,
    liveReloadOnEdit: true,
    container: "span",
    parseNativeComments: true,
    commentedTextColorLight: "#f16e6e",
    commentedTextColorDark: "#585809",
    commentColorLight: "#f3f367",
    commentColorDark: "#330202",
    showCommentWhenCtrlKeyPressed: true,
    showDefaultTagEditor: true,
	defaultTagEditorValue: "comment,"
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

        containerEl.createEl('h2', { text: 'Settings for Reading comments plugin.' });

		new Setting(containerEl)
			.setName('Show default tag editor')
			.setDesc('Adds default tag editor to the comments panel .')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showDefaultTagEditor)
				.onChange(
					async (value) => {
						this.plugin.settings.showDefaultTagEditor = value;
						await this.plugin.saveSettings();
					}
				)
			);

        new Setting(containerEl)
            .setName('Show comment in Hover Popower Window on Ctrl (Command) + Hover')
            .setDesc('Previously comment shown just by cursor hover on commented text.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showCommentWhenCtrlKeyPressed)
                .onChange(
                    async (value) => {
                        this.plugin.settings.showCommentWhenCtrlKeyPressed = value;
                        await this.plugin.saveSettings();
                    }
                )
            );

        new Setting(containerEl)
            .setName('Parse native obsidian comments')
            .setDesc('Native %%Comments%% will be added to the panel')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.parseNativeComments)
                .onChange(
                    async (value) => {
                        this.plugin.settings.parseNativeComments = value;
                        await this.plugin.saveSettings();
                    }
                )
            );

        new Setting(containerEl)
            .setName('Auto Expand Tags')
            .setDesc('Automatically expand all tags')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoExpand)
                .onChange(
                    async (value) => {
                        this.plugin.settings.autoExpand = value;
                        await this.plugin.saveSettings();
                    }
                )
            );

        new Setting(containerEl)
            .setName('Live reload on edit')
            .setDesc('Automatically update comments panel during editing note')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.liveReloadOnEdit)
                .onChange(
                    async (value) => {
                        this.plugin.settings.liveReloadOnEdit = value;
                        await this.plugin.saveSettings();
                    }
                )
            );
        new Setting(containerEl)
            .setName('Add comment inline or as block by default')
            .setDesc('There is also two additional commands: Add comment as inline/ as block. Or you can change manually .ob-html-comment wrapper tag from span to div accordingly.')
            .addDropdown(dropdown => dropdown
                .addOption("span", "Inline")
                .addOption("div", "Block")
                .setValue(this.plugin.settings.container)
                .onChange(
                    async (value) => {
                        this.plugin.settings.container = value;
                        await this.plugin.saveSettings();
                    }
                )
            );

        new Setting(containerEl)
            .setName("Commented Text Color Light/Dark")
            .addColorPicker(color => color
                .setValue(this.plugin.settings.commentedTextColorLight)
                .onChange(async (value) => {
                    this.plugin.settings.commentedTextColorLight = value;
                    this.plugin.saveSettings();
                })
            )
            .addColorPicker(color => color
                .setValue(this.plugin.settings.commentedTextColorDark)
                .onChange(async (value) => {
                    this.plugin.settings.commentedTextColorDark = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("Comment Color Light/Dark")
            .addColorPicker(color => color
                .setValue(this.plugin.settings.commentColorLight)
                .onChange(async (value) => {
                    this.plugin.settings.commentColorLight = value;
                    this.plugin.saveSettings();
                })
            )
            .addColorPicker(color => color
                .setValue(this.plugin.settings.commentColorDark)
                .onChange(async (value) => {
                    this.plugin.settings.commentColorDark = value;
                    this.plugin.saveSettings();
                })
            );
    }
}
