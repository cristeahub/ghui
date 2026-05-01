import type { Action } from "../keybindings.js"
import { Data } from "effect"
import { colors } from "./colors.js"
import { TextLine } from "./primitives.js"

export type RetryProgress = Data.TaggedEnum<{
	Idle: {}
	Retrying: { readonly attempt: number; readonly max: number }
}>

export const RetryProgress = Data.taggedEnum<RetryProgress>()
export const initialRetryProgress: RetryProgress = RetryProgress.Idle()

export const FooterHints = ({
	filterEditing,
	showFilterClear,
	detailFullView,
	diffFullView,
	diffCommentMode,
	hasSelection,
	canCloseSelection,
	hasError,
	isLoading,
	loadingIndicator,
	retryProgress,
	hint,
}: {
	filterEditing: boolean
	showFilterClear: boolean
	detailFullView: boolean
	diffFullView: boolean
	diffCommentMode: boolean
	hasSelection: boolean
	canCloseSelection: boolean
	hasError: boolean
	isLoading: boolean
	loadingIndicator: string
	retryProgress: RetryProgress
	hint: (action: Action) => string
}) => {
	if (filterEditing) {
		return (
			<TextLine>
				<span fg={colors.count}>search</span>
				<span fg={colors.muted}> typing  </span>
				<span fg={colors.count}>↑↓</span>
				<span fg={colors.muted}> move  </span>
				<span fg={colors.count}>enter</span>
				<span fg={colors.muted}> apply  </span>
				<span fg={colors.count}>esc</span>
				<span fg={colors.muted}> cancel  </span>
				<span fg={colors.count}>ctrl-u</span>
				<span fg={colors.muted}> clear  </span>
				<span fg={colors.count}>ctrl-w</span>
				<span fg={colors.muted}> word</span>
			</TextLine>
		)
	}

	if (diffFullView) {
		if (diffCommentMode) {
			return (
				<TextLine>
					<span fg={colors.count}>↑↓</span>
					<span fg={colors.muted}> line  </span>
					<span fg={colors.count}>pgup/pgdn</span>
					<span fg={colors.muted}> jump  </span>
					<span fg={colors.count}>←→</span>
					<span fg={colors.muted}> side  </span>
					<span fg={colors.count}>{hint("select")}</span>
					<span fg={colors.muted}> open  </span>
					<span fg={colors.count}>a</span>
					<span fg={colors.muted}> comment  </span>
					<span fg={colors.count}>{hint("enterCommentMode")}</span>
					<span fg={colors.muted}> done  </span>
					<span fg={colors.count}>{hint("jumpFilePrev")}{hint("jumpFileNext")}</span>
					<span fg={colors.muted}> files  </span>
					<span fg={colors.count}>{hint("back")}</span>
					<span fg={colors.muted}> back</span>
				</TextLine>
			)
		}
		return (
			<TextLine>
				<span fg={colors.count}>{hint("back")}</span>
				<span fg={colors.muted}> back  </span>
				<span fg={colors.count}>{hint("toggleDiffView")}</span>
				<span fg={colors.muted}> view  </span>
				<span fg={colors.count}>{hint("toggleDiffWrap")}</span>
				<span fg={colors.muted}> wrap  </span>
				<span fg={colors.count}>{hint("enterCommentMode")}</span>
				<span fg={colors.muted}> comment  </span>
				<span fg={colors.count}>{hint("jumpFilePrev")}{hint("jumpFileNext")}</span>
				<span fg={colors.muted}> files  </span>
				<span fg={colors.count}>{hint("refresh")}</span>
				<span fg={colors.muted}> reload  </span>
				<span fg={colors.count}>{hint("openInBrowser")}</span>
				<span fg={colors.muted}> open  </span>
				<span fg={colors.count}>{hint("quit")}</span>
				<span fg={colors.muted}> quit</span>
			</TextLine>
		)
	}

	if (detailFullView) {
		return (
			<TextLine>
				<span fg={colors.count}>{hint("back")}</span>
				<span fg={colors.muted}> back  </span>
				<span fg={colors.count}>↑↓</span>
				<span fg={colors.muted}> scroll  </span>
				<span fg={colors.count}>{hint("refresh")}</span>
				<span fg={colors.muted}>{hasError ? " retry  " : " refresh  "}</span>
				<span fg={colors.count}>{hint("openTheme")}</span>
				<span fg={colors.muted}> theme  </span>
				{hasSelection ? (
					<>
						<span fg={colors.count}>{hint("toggleDraft")}</span>
						<span fg={colors.muted}> state  </span>
						<span fg={colors.count}>{hint("openDiff")}</span>
						<span fg={colors.muted}> diff  </span>
						<span fg={colors.count}>{hint("labels")}</span>
						<span fg={colors.muted}> labels  </span>
						<span fg={colors.count}>{hint("merge")}</span>
						<span fg={colors.muted}> merge  </span>
						{canCloseSelection ? (
							<>
								<span fg={colors.count}>{hint("close")}</span>
								<span fg={colors.muted}> close  </span>
							</>
						) : null}
					</>
				) : null}
				<span fg={colors.count}>{hint("openInBrowser")}</span>
				<span fg={colors.muted}> open  </span>
				<span fg={colors.count}>{hint("copyMetadata")}</span>
				<span fg={colors.muted}> copy  </span>
				<span fg={colors.count}>{hint("quit")}</span>
				<span fg={colors.muted}> quit</span>
			</TextLine>
		)
	}

	return (
		<TextLine>
			<span fg={colors.count}>{hint("switchTab")}</span>
			<span fg={colors.muted}> queue  </span>
			<span fg={colors.count}>{hint("filter")}</span>
			<span fg={colors.muted}> filter  </span>
			<span fg={colors.count}>{hint("openTheme")}</span>
			<span fg={colors.muted}> theme  </span>
			{showFilterClear ? (
				<>
					<span fg={colors.count}>{hint("clearFilter")}</span>
					<span fg={colors.muted}> clear  </span>
				</>
			) : null}
			{retryProgress._tag === "Retrying" ? (
				<>
					<span fg={colors.status.pending}>retry</span>
					<span fg={colors.muted}> {retryProgress.attempt}/{retryProgress.max}  </span>
				</>
			) : isLoading ? (
				<>
					<span fg={colors.status.pending}>{loadingIndicator}</span>
					<span fg={colors.muted}> loading  </span>
				</>
			) : null}
			<span fg={colors.count}>{hint("refresh")}</span>
			<span fg={colors.muted}>{hasError ? " retry  " : " refresh  "}</span>
			{hasSelection ? (
				<>
					<span fg={colors.count}>{hint("toggleDraft")}</span>
					<span fg={colors.muted}> state  </span>
					<span fg={colors.count}>{hint("openDiff")}</span>
					<span fg={colors.muted}> diff  </span>
					<span fg={colors.count}>{hint("labels")}</span>
					<span fg={colors.muted}> labels  </span>
					<span fg={colors.count}>{hint("merge")}</span>
					<span fg={colors.muted}> merge  </span>
					{canCloseSelection ? (
						<>
							<span fg={colors.count}>{hint("close")}</span>
							<span fg={colors.muted}> close  </span>
						</>
					) : null}
					<span fg={colors.count}>{hint("openInBrowser")}</span>
					<span fg={colors.muted}> open  </span>
					<span fg={colors.count}>{hint("copyMetadata")}</span>
					<span fg={colors.muted}> copy  </span>
				</>
			) : null}
			<span fg={colors.count}>{hint("quit")}</span>
			<span fg={colors.muted}> quit</span>
		</TextLine>
	)
}
