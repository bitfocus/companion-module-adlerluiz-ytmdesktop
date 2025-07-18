import { CompanionActionDefinition, CompanionActionDefinitions, CompanionActionEvent } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export const actionDefinitions: Record<
	string,
	Omit<CompanionActionDefinition, 'callback'> & {
		callback: (self: ModuleInstance, action: CompanionActionEvent) => Promise<any>
	}
> = {
	playPause: {
		name: 'Play/Pause',
		description: 'Toggle play/pause state of the player',
		options: [],
		callback: async (self) => {
			await self.sendCommand('playPause')
		},
	},
	play: {
		name: 'Play',
		options: [],
		callback: async (self) => {
			await self.sendCommand('play')
		},
	},
	pause: {
		name: 'Pause',
		options: [],
		callback: async (self) => {
			await self.sendCommand('pause')
		},
	},
	volumeUp: {
		name: 'Volume up',
		description: 'Increase the volume of the player by 10%',
		options: [],
		callback: async (self) => {
			await self.sendCommand('volumeUp')
		},
	},
	volumeDown: {
		name: 'Volume down',
		description: 'Decrease the volume of the player by 10%',
		options: [],
		callback: async (self) => {
			await self.sendCommand('volumeDown')
		},
	},
	setVolume: {
		name: 'Set volume',
		description: 'Set the volume of the player',
		options: [
			{
				type: 'number',
				id: 'volume',
				label: 'Volume',
				default: 100,
				min: 0,
				max: 100,
				range: true,
				step: 1,
				required: true,
			},
		],
		callback: async (self, action) => {
			await self.sendCommand('setVolume', action.options.volume as number)
		},
	},
	mute: {
		name: 'Mute',
		description: 'Mute the player',
		options: [],
		callback: async (self) => {
			await self.sendCommand('mute')
		},
	},
	unmute: {
		name: 'Unmute',
		description: 'Unmute the player',
		options: [],
		callback: async (self) => {
			await self.sendCommand('unmute')
		},
	},
	seekTo: {
		name: 'Seek to',
		description: 'Seek to a specific position in the currently playing track',
		options: [
			{
				type: 'number',
				id: 'position',
				label: 'Position',
				default: 0,
				min: 0,
				max: 99999,
				required: true,
			},
		],
		callback: async (self, action) => {
			await self.sendCommand('seekTo', action.options.position as number)
		},
	},
	next: {
		name: 'Next',
		description: 'Skip to the next track',
		options: [],
		callback: async (self) => {
			await self.sendCommand('next')
		},
	},
	previous: {
		name: 'Previous',
		description: 'Go back to the previous track',
		options: [],
		callback: async (self) => {
			await self.sendCommand('previous')
		},
	},
	repeatMode: {
		name: 'Set repeat mode',
		description: 'Set the repeat mode of the player',
		options: [
			{
				type: 'dropdown',
				id: 'mode',
				label: 'Mode',
				default: '0',
				choices: [
					{ id: '0', label: 'None' },
					{ id: '1', label: 'All' },
					{ id: '2', label: 'One' },
				],
			},
		],
		callback: async (self, action) => {
			await self.sendCommand('setRepeatMode', Number(action.options.mode))
		},
	},
	shuffle: {
		name: 'Shuffle',
		description: 'Enable/disable shuffle mode',
		options: [],
		callback: async (self) => {
			await self.sendCommand('shuffle')
		},
	},

	playQueueIndex: {
		name: 'Play queue index',
		description: 'Play a specific track from the queue',
		options: [
			{
				type: 'number',
				id: 'index',
				label: 'Index',
				default: 0,
				min: 0,
				max: 99999,
				required: true,
			},
		],
		callback: async (self, action) => {
			await self.sendCommand('playQueueIndex', action.options.index as number)
		},
	},

	toggleLike: {
		name: 'Toggle like',
		description:
			'Toggle the like state of the currently playing track (note: this does not toggle like/dislike, it just toggles like/unlike)',
		options: [],
		callback: async (self) => {
			await self.sendCommand('toggleLike')
		},
	},
	toggleDislike: {
		name: 'Toggle dislike',
		description:
			'Toggle the dislike state of the currently playing track (note: this does not toggle like/dislike, it just toggles dislike/undislike)',
		options: [],
		callback: async (self) => {
			await self.sendCommand('toggleDislike')
		},
	},
	changeVideo: {
		name: 'Change track',
		description: 'Change the currently playing track to a specific video or playlist',
		options: [
			{
				type: 'textinput',
				id: 'videoId',
				label: 'Video ID',
				default: '',
				required: false,
			},
			{
				type: 'textinput',
				id: 'playlistId',
				label: 'Playlist ID',
				default: '',
				required: false,
			},
		],
		callback: async (self, action) => {
			if (!action.options.videoId && !action.options.playlistId) {
				return
			}

			await self.sendCommand('changeVideo', {
				videoId: (action.options.videoId as string) ?? null,
				playlistId: (action.options.playlistId as string) ?? null,
			})
		},
	},
}

export function UpdateActions(self: ModuleInstance): void {
	const newActions: CompanionActionDefinitions = {}

	for (const action of Object.keys(actionDefinitions)) {
		const def = actionDefinitions[action]
		newActions[action] = {
			...def,
			callback: async (actionEvent: CompanionActionEvent) => {
				return def.callback(self, actionEvent)
			},
		}
	}

	self.setActionDefinitions(newActions)
}
