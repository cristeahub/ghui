export type Action =
	// Navigation
	| "navigateUp"
	| "navigateDown"
	| "navigateGroupUp"
	| "navigateGroupDown"
	| "halfPageUp"
	| "halfPageDown"
	| "goToTop"
	| "goToBottom"
	// Selection & views
	| "select"
	| "back"
	| "openDiff"
	| "openInBrowser"
	| "copyMetadata"
	// PR operations
	| "merge"
	| "close"
	| "toggleDraft"
	| "labels"
	| "refresh"
	// List
	| "filter"
	| "clearFilter"
	| "switchTab"
	// Diff view
	| "toggleDiffView"
	| "toggleDiffWrap"
	| "enterCommentMode"
	| "jumpFileNext"
	| "jumpFilePrev"
	// Theme
	| "openTheme"
	// App
	| "quit"

export type KeyCombo = {
	readonly key: string
	readonly ctrl?: true
	readonly shift?: true
	readonly meta?: true
}

export type Binding = string | KeyCombo

const ctrl = (name: string): KeyCombo => ({ key: name, ctrl: true })
const shift = (name: string): KeyCombo => ({ key: name, shift: true })
const meta = (name: string): KeyCombo => ({ key: name, meta: true })

export const defaultBindings: Record<Action, readonly Binding[]> = {
	navigateUp: ["up", "k"],
	navigateDown: ["down", "j"],
	navigateGroupUp: ["[", shift("k"), "K", meta("up"), meta("k")],
	navigateGroupDown: ["]", shift("j"), "J", meta("down"), meta("j")],
	halfPageUp: [ctrl("u")],
	halfPageDown: [ctrl("d")],
	goToTop: ["g"],
	goToBottom: ["G"],
	select: ["return", "enter"],
	back: ["escape", "return", "enter"],
	openDiff: ["d"],
	openInBrowser: ["o"],
	copyMetadata: ["y"],
	merge: ["m", "M"],
	close: ["x"],
	toggleDraft: ["s", "S"],
	labels: ["l"],
	refresh: ["r"],
	filter: ["/"],
	clearFilter: ["escape"],
	switchTab: ["tab"],
	toggleDiffView: ["v"],
	toggleDiffWrap: ["w"],
	enterCommentMode: ["c"],
	jumpFileNext: ["]", "right", "l"],
	jumpFilePrev: ["[", "left", "h"],
	openTheme: ["t", "T"],
	quit: ["q", ctrl("c")],
}

type KeyEvent = {
	readonly name: string
	readonly ctrl?: boolean
	readonly shift?: boolean
	readonly meta?: boolean
	readonly option?: boolean
	readonly sequence: string
}

export type Bindings = Record<Action, readonly Binding[]>

const actions = new Set<Action>(Object.keys(defaultBindings) as Action[])
const isAction = (value: unknown): value is Action => typeof value === "string" && actions.has(value as Action)

const parseBinding = (raw: string): Binding => {
	const parts = raw.toLowerCase().split("+")
	const key = parts.pop()!
	if (parts.length === 0) return raw
	const combo: KeyCombo = { key } as KeyCombo
	for (const mod of parts) {
		if (mod === "ctrl") (combo as { ctrl: true }).ctrl = true
		else if (mod === "shift") (combo as { shift: true }).shift = true
		else if (mod === "meta" || mod === "alt" || mod === "opt" || mod === "option") (combo as { meta: true }).meta = true
	}
	return combo
}

export const loadBindings = (raw: unknown): Bindings => {
	if (!raw || typeof raw !== "object") return defaultBindings
	const overrides = raw as Record<string, unknown>
	const result = { ...defaultBindings }
	for (const [key, value] of Object.entries(overrides)) {
		if (!isAction(key)) continue
		const values = Array.isArray(value) ? value : [value]
		const parsed = values.filter((v): v is string => typeof v === "string").map(parseBinding)
		if (parsed.length > 0) result[key] = parsed
	}
	return result
}

export const formatBinding = (binding: Binding): string => {
	if (typeof binding === "string") return binding
	const parts: string[] = []
	if (binding.ctrl) parts.push("ctrl")
	if (binding.meta) parts.push("alt")
	if (binding.shift) parts.push("shift")
	parts.push(binding.key)
	return parts.join("+")
}

export const hintLabel = (action: Action, bindings: Bindings = defaultBindings): string => {
	const candidates = bindings[action]
	if (candidates.length === 0) return "?"
	return formatBinding(candidates[0]!)
}

export const matchesAction = (key: KeyEvent, action: Action, bindings: Bindings = defaultBindings): boolean => {
	const candidates = bindings[action]
	return candidates.some((binding) => {
		if (typeof binding === "string") {
			return key.name === binding && !key.ctrl && !key.meta && !key.option
		}
		return key.name === binding.key
			&& (binding.ctrl ? !!key.ctrl : !key.ctrl)
			&& (binding.shift ? !!(key.shift || key.name !== key.name.toLowerCase()) : true)
			&& (binding.meta ? !!(key.meta || key.option) : !key.meta && !key.option)
	})
}
