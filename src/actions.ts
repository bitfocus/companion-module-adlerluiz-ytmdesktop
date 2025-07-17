import type { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		playPause: {
			name: 'Play/Pause',
			options: [],
			callback: async () => {
				await self.sendCommand('playPause')
			},
		},
		play: {
			name: 'Play',
			options: [],
			callback: async () => {
				await self.sendCommand('play')
			},
		},
		pause: {
			name: 'Pause',
			options: [],
			callback: async () => {
				await self.sendCommand('pause')
			},
		},
		volumeUp: {
			name: 'Volume up',
			options: [],
			callback: async () => {
				await self.sendCommand('volumeUp')
			},
		},
		volumeDown: {
			name: 'Volume down',
			options: [],
			callback: async () => {
				await self.sendCommand('volumeDown')
			},
		},
		setVolume: {
			name: 'Set volume',
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
			callback: async (action) => {
				await self.sendCommand('setVolume', action.options.volume as number)
			},
		},
		mute: {
			name: 'Mute',
			options: [],
			callback: async () => {
				await self.sendCommand('mute')
			},
		},
		unmute: {
			name: 'Unmute',
			options: [],
			callback: async () => {
				await self.sendCommand('unmute')
			},
		},
		seekTo: {
			name: 'Seek to',
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
			callback: async (action) => {
				await self.sendCommand('seekTo', action.options.position as number)
			},
		},
		next: {
			name: 'Next',
			options: [],
			callback: async () => {
				await self.sendCommand('next')
			},
		},
		previous: {
			name: 'Previous',
			options: [],
			callback: async () => {
				await self.sendCommand('previous')
			},
		},
		repeatMode: {
			name: 'Set repeat mode',
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
			callback: async (action) => {
				await self.sendCommand('setRepeatMode', Number(action.options.mode))
			},
		},
		shuffle: {
			name: 'Shuffle',
			options: [],
			callback: async () => {
				await self.sendCommand('shuffle')
			},
		},

		playQueueIndex: {
			name: 'Play queue index',
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
			callback: async (action) => {
				await self.sendCommand('playQueueIndex', action.options.index as number)
			},
		},

		toggleLike: {
			name: 'Toggle like',
			options: [],
			callback: async () => {
				await self.sendCommand('toggleLike')
			},
		},
		toggleDislike: {
			name: 'Toggle dislike',
			options: [],
			callback: async () => {
				await self.sendCommand('toggleDislike')
			},
		},
		changeVideo: {
			name: 'Change video',
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
			callback: async (action) => {
				if (!action.options.videoId && !action.options.playlistId) {
					return
				}

				await self.sendCommand('changeVideo', {
					videoId: (action.options.videoId as string) ?? null,
					playlistId: (action.options.playlistId as string) ?? null,
				})
			},
		},
	})
}
