import { CompanionVariableDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { getCurrentItem } from './utils.js'

export const variableDefinitions: CompanionVariableDefinition[] = [
	{ variableId: 'title', name: 'Title of the currently playing track' },
	{ variableId: 'artist', name: 'Artist of the currently playing track' },
	{ variableId: 'volume', name: 'Volume of the player (1-100)' },
	{ variableId: 'duration', name: 'Duration of the currently playing track' },
	{ variableId: 'trackProgress', name: 'Video progress of the player (seconds with 2 decimals)' },
	{ variableId: 'trackState', name: 'State of the player (unknown, paused, playing, buffering)' },
	{ variableId: 'videoId', name: 'Video ID of the currently playing track' },
]
export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions(variableDefinitions)
}

export function UpdateVariables(self: ModuleInstance): void {
	const current = getCurrentItem(self)

	const trackStateDict: Record<number, string> = {
		'-1': 'unknown',
		0: 'paused',
		1: 'playing',
		2: 'buffering',
	}

	self.log('debug', `Updating variables: ${JSON.stringify(self.data.player)}`)

	self.setVariableValues({
		title: current?.title,
		artist: current?.author,
		volume: self.data.player.volume,
		duration: current?.duration,
		trackProgress: Number(self.data.player.videoProgress).toFixed(2),
		trackState: trackStateDict[self.data.player.trackState] || 'unknown',
		videoId: current?.videoId,
	})
}
