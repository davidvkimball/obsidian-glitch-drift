import { Plugin, Editor, MarkdownView } from "obsidian";
import { DEFAULT_SETTINGS, GlitchDriftSettings, GlitchDriftSettingTab } from "./settings";

export default class GlitchDriftPlugin extends Plugin {
	settings: GlitchDriftSettings;
	private glitchTimeout: number | null = null;
	private isLoading: boolean = true;

	async onload() {
		await this.loadSettings();

		// Register editor change listener
		this.registerEvent(
			this.app.workspace.on("editor-change", (editor: Editor) => {
				this.handleEditorChange(editor);
			})
		);

		// Add settings tab
		this.addSettingTab(new GlitchDriftSettingTab(this.app, this));

		// Finish loading phase after workspace is ready to prevent startup flicker
		this.app.workspace.onLayoutReady(() => {
			setTimeout(() => {
				this.isLoading = false;
			}, 100);
		});
	}

	onunload() {
		// Clear any pending glitch timeout
		if (this.glitchTimeout) {
			clearTimeout(this.glitchTimeout);
		}
		this.removeGlitchEffect();
	}

	private handleEditorChange(editor: Editor) {
		// Skip glitch during initial load phase
		if (this.isLoading) return;

		const intensity = this.settings.intensity;

		// Update CSS variable for intensity
		document.documentElement.style.setProperty("--glitch-intensity", `${intensity}%`);

		// Apply glitch to active line
		this.applyGlitchToActiveLine();

		// Clear previous timeout
		if (this.glitchTimeout) {
			clearTimeout(this.glitchTimeout);
		}

		// Remove glitch effect after typing stops
		this.glitchTimeout = window.setTimeout(() => {
			this.removeGlitchEffect();
		}, 200);
	}

	private applyGlitchToActiveLine() {
		// Get active editor view
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view?.editor) return;

		// Get cursor position
		const cursorPos = view.editor.getCursor("head");
		const lineElements = document.querySelectorAll(".cm-line");

		// Find and glitch the line at cursor position
		if (lineElements.length > 0) {
			// Get the line element - clamp to valid range
			const lineIndex = Math.min(cursorPos.line, lineElements.length - 1);
			const lineEl = lineElements[lineIndex] as HTMLElement;

			if (lineEl) {
				// Remove and re-add class to restart animation on each keystroke
				lineEl.classList.remove("glitch-drift");
				// Force reflow to trigger animation restart
				void lineEl.offsetHeight;
				lineEl.classList.add("glitch-drift");
			}
		}
	}

	private removeGlitchEffect() {
		const glitchLines = document.querySelectorAll(".cm-line.glitch-drift");
		glitchLines.forEach((el) => {
			el.classList.remove("glitch-drift");
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData() as Partial<GlitchDriftSettings>
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
