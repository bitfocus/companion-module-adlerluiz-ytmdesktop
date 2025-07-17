import type { ModuleInstance } from './main.js'
import { getCurrentItem } from './utils.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'title', name: 'Title of the currently playing track' },
		{ variableId: 'artist', name: 'Artist of the currently playing track' },
		{ variableId: 'volume', name: 'Volume of the player' },
		{ variableId: 'duration', name: 'Duration of the currently playing track' },
		{ variableId: 'videoProgress', name: 'Video progress of the player' },
		{ variableId: 'trackState', name: 'State of the player (unknown, paused, playing, buffering)' },
		{ variableId: 'videoId', name: 'Video ID of the currently playing track' },
	])
}

export function UpdateVariables(self: ModuleInstance): void {
	const current = getCurrentItem(self)

	const trackStateDict: Record<number, string> = {
		'-1': 'unknown',
		0: 'paused',
		1: 'playing',
		2: 'buffering',
	}

	self.setVariableValues({
		title: current?.title,
		artist: current?.author,
		volume: self.data.player.volume,
		duration: current?.duration,
		videoProgress: self.data.player.videoProgress,
		trackState: trackStateDict[self.data.player.trackState],
		videoId: current?.videoId,
	})
}
