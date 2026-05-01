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

export const matchesAction = (key: KeyEvent, action: Action, bindings: Record<Action, readonly Binding[]> = defaultBindings): boolean => {
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
