import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
export interface ModuleConfig {
	host: string
	port: number
	token: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Companion server IP',
			width: 8,
			regex: Regex.IP,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Companion server port',
			width: 4,
			min: 1,
			max: 65535,
			default: 9863,
		},
		{
			type: 'textinput',
			id: 'token',
			width: 12,
			label: 'Token',
			isVisible: () => false,
		},
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'Please ensure "Companion server" and "Enable companion authorization" are enabled in YTM Desktop settings (Settings cog top right -> Integrations).',
		},
	]
}
