import { ModuleInstance } from './main.js'

export function getCurrentItem(self: ModuleInstance): null | Record<string, any> {
	const queue = self?.data?.player?.queue?.items || []
	if (queue.length === 0) {
		return null
	}
	const current = queue.find((item: any) => item.selected)

	if (!current) {
		return null
	}

	return current
}
