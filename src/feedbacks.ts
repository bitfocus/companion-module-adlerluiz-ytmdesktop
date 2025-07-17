import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { Jimp } from 'jimp'
import { getCurrentItem } from './utils.js'

const tempAlbumCoverStore = new Map<string, ArrayBuffer>()

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		AlbumCover: {
			name: 'Current album cover',
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
			description: 'Shows the album cover of the currently playing track',

			callback: async (feedback) => {
				const current = getCurrentItem(self)

				if (!current) {
					return {
						bgcolor: combineRgb(255, 0, 0),
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
	})
}
