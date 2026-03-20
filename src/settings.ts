import { App, PluginSettingTab, Setting } from "obsidian";
import GlitchDriftPlugin from "./main";

export interface GlitchDriftSettings {
	intensity: number;
}

export const DEFAULT_SETTINGS: GlitchDriftSettings = {
	intensity: 50
};

export class GlitchDriftSettingTab extends PluginSettingTab {
	plugin: GlitchDriftPlugin;

	constructor(app: App, plugin: GlitchDriftPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Glitch intensity")
			.setDesc(`Control how intense the glitch effect is (0-100). Current: ${this.plugin.settings.intensity}`)
			.addSlider((slider) =>
				slider
					.setLimits(0, 100, 1)
					.setValue(this.plugin.settings.intensity)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.intensity = value;
						await this.plugin.saveSettings();
						this.display();
					})
			);
	}
}
