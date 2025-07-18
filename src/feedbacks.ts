import {
	combineRgb,
	CompanionFeedbackAdvancedEvent,
	CompanionFeedbackDefinitions,
	CompanionFeedbackDefinition,
} from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { Jimp } from 'jimp'
import { getCurrentItem } from './utils.js'

const tempAlbumCoverStore = new Map<string, ArrayBuffer>()

export const feedbackDefinitions: Record<
	string,
	Omit<CompanionFeedbackDefinition, 'callback'> & {
		callback: (self: ModuleInstance, feedback: CompanionFeedbackAdvancedEvent) => Promise<any>
	}
> = {
	AlbumCover: {
		name: 'Album cover',
		type: 'advanced',
		options: [
			{
				type: 'number',
				id: 'opacity',
				label: 'Opacity',
				default: 1,
				min: 0,
				max: 1,
				range: true,
				step: 0.01,
			},
		],
		description: 'Sets the PNG to the album cover of the currently playing track',

		callback: async (self: ModuleInstance, feedback: CompanionFeedbackAdvancedEvent): Promise<any> => {
			const current = getCurrentItem(self)

			if (!current) {
				return {
					png64: '',
				}
			}

			const id = current?.videoId

			let buffer: ArrayBuffer
			const existing = tempAlbumCoverStore.get(id)
			if (existing) {
				buffer = existing
			} else {
				const image = current.thumbnails?.[4]
				const fetched = await fetch(image?.url)
				if (!fetched.ok) {
					return {
						bgcolor: combineRgb(255, 0, 0),
					}
				}
				buffer = await fetched.arrayBuffer()
			}

			const img = (await Jimp.read(buffer))
				.scaleToFit({
					w: 400,
					h: 400,
				})
				.opacity(feedback.options.opacity === undefined ? 1 : Number(feedback.options.opacity))
			const png64 = await img.getBase64('image/png')

			return {
				png64,
			}
		},
	},
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	//convert functions to include self
	const newFeedbacks: CompanionFeedbackDefinitions = {}
	for (const feedback of Object.keys(feedbackDefinitions)) {
		const def = feedbackDefinitions[feedback]
		newFeedbacks[feedback] = {
			...def,
			type: 'advanced',
			callback: async (feedbackEvent: CompanionFeedbackAdvancedEvent) => {
				return def.callback(self, feedbackEvent)
			},
		}
	}
	self.setFeedbackDefinitions(newFeedbacks)
}
