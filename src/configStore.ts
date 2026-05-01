import { mkdir } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { Effect } from "effect"
import { loadBindings, type Bindings } from "./keybindings.js"
import { isThemeId, type ThemeId } from "./ui/colors.js"

interface StoredConfig {
	readonly theme?: unknown
	readonly keybindings?: unknown
}

const configDirectory = () => {
	if (process.env.GHUI_CONFIG_DIR) return process.env.GHUI_CONFIG_DIR
	if (process.env.XDG_CONFIG_HOME) return join(process.env.XDG_CONFIG_HOME, "ghui")
	if (process.platform === "win32" && process.env.APPDATA) return join(process.env.APPDATA, "ghui")
	return join(homedir(), ".config", "ghui")
}

export const configPath = () => join(configDirectory(), "config.json")

const parseConfig = (text: string): StoredConfig => {
	const value = JSON.parse(text) as unknown
	return value && typeof value === "object" ? value : {}
}

export interface StoredAppConfig {
	readonly themeId: ThemeId
	readonly bindings: Bindings
}

const defaultAppConfig: StoredAppConfig = { themeId: "ghui", bindings: loadBindings(undefined) }

export const loadStoredConfig: Effect.Effect<StoredAppConfig> = Effect.catchCause(Effect.tryPromise(async () => {
	const file = Bun.file(configPath())
	if (!(await file.exists())) return defaultAppConfig

	const config = parseConfig(await file.text())
	return {
		themeId: isThemeId(config.theme) ? config.theme : "ghui",
		bindings: loadBindings(config.keybindings),
	}
}), () => Effect.succeed(defaultAppConfig))

export const saveStoredThemeId = (theme: ThemeId): Effect.Effect<void> => Effect.tryPromise(async () => {
	const path = configPath()
	const file = Bun.file(path)
	const config = await file.exists()
		? parseConfig(await file.text())
		: {}
	if (config.theme === theme) return

	await mkdir(dirname(path), { recursive: true })
	await Bun.write(path, `${JSON.stringify({ ...config, theme }, null, "\t")}\n`)
})
