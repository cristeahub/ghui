import { useBindings } from "@opentui/keymap/react"
import type { RefObject } from "react"
import { useRef } from "react"
import type { AppCommand } from "../commands.js"

/**
 * Register every AppCommand as a named keymap command. Bindings can then
 * reference commands by ID (`cmd: "pull.refresh"`) instead of inline closures,
 * which makes the keymap's introspection (queryCommands, useActiveKeys with
 * metadata) work for our own commands.
 *
 * The set of command IDs is captured at first render — adding a new AppCommand
 * to the static `buildAppCommands` list later in the session would not get
 * picked up. That's fine for ghui where the static list is fixed; the runner
 * itself reads the latest AppCommand on every dispatch via `runCommandByIdRef`.
 */
export const useAppCommandRegistry = (
	appCommands: readonly AppCommand[],
	runCommandByIdRef: RefObject<(id: string, options?: { readonly notifyDisabled?: boolean }) => boolean>,
) => {
	const idsRef = useRef(appCommands.map((command) => command.id))

	useBindings(() => ({
		commands: idsRef.current.map((id) => ({
			name: id,
			run: () => {
				runCommandByIdRef.current(id)
				return true
			},
		})),
		bindings: [],
	}), [])
}
