import { TextAttributes } from "@opentui/core"
import { useEffect, useMemo, useState } from "react"
import type { AppCommand } from "../commands.js"
import { clampCommandIndex } from "../commands.js"
import { colors } from "./colors.js"
import { centerCell, Divider, fitCell, ModalFrame, PlainLine, TextLine, trimCell } from "./primitives.js"

const scopeOrder: readonly AppCommand["scope"][] = ["Global", "Queue", "Pull request", "Diff", "Navigation", "System"]

const scopeLabels = {
	Global: "App",
	Queue: "Queue",
	"Pull request": "Pull Request",
	Diff: "Diff",
	Navigation: "Navigation",
	System: "System",
} as const satisfies Record<AppCommand["scope"], string>

type CommandPaletteRow =
	| { readonly _tag: "section"; readonly scope: AppCommand["scope"] }
	| { readonly _tag: "command"; readonly command: AppCommand; readonly commandIndex: number }

export const CommandPalette = ({
	commands,
	query,
	selectedIndex,
	modalWidth,
	modalHeight,
	offsetLeft,
	offsetTop,
}: {
	commands: readonly AppCommand[]
	query: string
	selectedIndex: number
	modalWidth: number
	modalHeight: number
	offsetLeft: number
	offsetTop: number
}) => {
	const innerWidth = Math.max(16, modalWidth - 2)
	const contentWidth = Math.max(14, innerWidth - 2)
	const rowWidth = contentWidth
	const listHeight = Math.max(1, modalHeight - 7)
	const clampedIndex = clampCommandIndex(selectedIndex, commands)
	const selectedCommand = commands[clampedIndex] ?? null
	const [scrollTop, setScrollTop] = useState(0)
	const rows = useMemo(() => scopeOrder.flatMap((scope): readonly CommandPaletteRow[] => {
		const scoped = commands.flatMap((command, commandIndex) => command.scope === scope ? [{ _tag: "command" as const, command, commandIndex }] : [])
		return scoped.length === 0 ? [] : [{ _tag: "section" as const, scope }, ...scoped]
	}), [commands])
	const selectedRowIndex = Math.max(0, rows.findIndex((row) => row._tag === "command" && row.commandIndex === clampedIndex))
	const visibleRows = rows.slice(scrollTop, scrollTop + listHeight)
	const bottomPaddingRows = Math.max(0, listHeight - visibleRows.length)
	const title = "Command Palette"
	const countText = commands.length === 1 ? "1 command" : `${commands.length} commands`
	const headerGap = Math.max(1, contentWidth - title.length - countText.length)
	const queryText = query.length > 0 ? query : "type a command, state, or shortcut"
	const queryWidth = Math.max(1, contentWidth - 2)
	const emptyTopRows = Math.max(0, Math.floor((listHeight - 1) / 2))
	const emptyBottomRows = Math.max(0, listHeight - emptyTopRows - 1)
	const detailText = selectedCommand
		? selectedCommand.subtitle ?? selectedCommand.scope
		: "No matching command"

	useEffect(() => {
		setScrollTop((current) => {
			if (rows.length <= listHeight) return 0
			if (selectedRowIndex < current) return selectedRowIndex
			if (selectedRowIndex >= current + listHeight) return selectedRowIndex - listHeight + 1
			return Math.min(current, Math.max(0, rows.length - listHeight))
		})
	}, [listHeight, rows.length, selectedRowIndex])

	return (
		<ModalFrame left={offsetLeft} top={offsetTop} width={modalWidth} height={modalHeight} junctionRows={[2]}>
			<box height={1} paddingLeft={1} paddingRight={1}>
				<TextLine>
					<span fg={colors.accent} attributes={TextAttributes.BOLD}>{title}</span>
					<span fg={colors.muted}>{" ".repeat(headerGap)}</span>
					<span fg={colors.muted}>{countText}</span>
				</TextLine>
			</box>
			<box height={1} paddingLeft={1} paddingRight={1}>
				<TextLine>
					<span fg={colors.count}>› </span>
					<span fg={query.length > 0 ? colors.text : colors.muted}>{fitCell(queryText, queryWidth)}</span>
				</TextLine>
			</box>
			<Divider width={innerWidth} />
			<box height={listHeight} flexDirection="column" paddingLeft={1} paddingRight={1}>
				{rows.length === 0 ? (
					<>
						{Array.from({ length: emptyTopRows }, (_, index) => <box key={`top-${index}`} height={1} />)}
						<PlainLine text={centerCell("No matching command", rowWidth)} fg={colors.muted} />
						{Array.from({ length: emptyBottomRows }, (_, index) => <box key={`bottom-${index}`} height={1} />)}
					</>
				) : (
					<>
						{visibleRows.map((row, index) => {
							const rowIndex = scrollTop + index
							if (row._tag === "section") {
								return <PlainLine key={`section-${row.scope}-${rowIndex}`} text={fitCell(scopeLabels[row.scope], rowWidth)} fg={colors.accent} bold />
							}

							const { command, commandIndex } = row
							const isSelected = commandIndex === clampedIndex
							const shortcut = command.shortcut ? trimCell(command.shortcut, 16) : ""
							const rightWidth = shortcut.length === 0 ? 0 : Math.min(18, Math.max(8, shortcut.length + 1))
							const titleWidth = Math.max(8, rowWidth - rightWidth - 4)

							return (
								<box key={command.id} height={1}>
									<TextLine width={rowWidth} bg={isSelected ? colors.selectedBg : undefined} fg={isSelected ? colors.selectedText : colors.text}>
										<span fg={isSelected ? colors.accent : colors.muted}>{isSelected ? "▸" : " "}</span>
										<span> </span>
										{isSelected ? <span attributes={TextAttributes.BOLD}>{fitCell(command.title, titleWidth)}</span> : <span>{fitCell(command.title, titleWidth)}</span>}
										{rightWidth > 0 ? <span fg={colors.muted}>{fitCell(shortcut, rightWidth, "right")}</span> : null}
									</TextLine>
								</box>
							)
						})}
						{Array.from({ length: bottomPaddingRows }, (_, index) => <box key={`pad-${index}`} height={1} />)}
					</>
				)}
			</box>
			<box height={1} paddingLeft={1} paddingRight={1}>
				<PlainLine text={fitCell(detailText, contentWidth)} fg={colors.muted} />
			</box>
			<box height={1} paddingLeft={1} paddingRight={1}>
				<PlainLine text="up/down select  enter run  ctrl-u clear  esc close" fg={colors.muted} />
			</box>
		</ModalFrame>
	)
}
