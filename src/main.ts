import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, UpdateVariables } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import io from 'socket.io-client'
import type { Socket } from 'socket.io-client'
function attemptParseJson(response: Response) {
	let data: unknown
	try {
		data = response.json()
	} catch {
		return null
	}
	return data
}

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	token?: string
	socket: Socket | null = null

	data: Record<string, any> = {}

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		if (!this.config.token || this.config.token === '') {
			this.updateStatus(InstanceStatus.Connecting, 'Requesting code')

			const code = await fetch('http://' + config.host + ':' + config.port + '/api/v1/auth/requestcode', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					appId: 'bitfocus-companion',
					appName: 'Bitfocus Companion',
					appVersion: '1.0.0',
				}),
			}).catch(() => {
				return null
			})

			if (!code) {
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Connection to server failed')
				return
			}

			const data = (await attemptParseJson(code)) as {
				code?: string
				error?: string
			}
			if (!data) {
				this.updateStatus(InstanceStatus.UnknownError, 'Failed to parse code response')
				return
			}

			if (data.error) {
				const errorDictionary: Record<string, string> = {
					AUTHORIZATION_DISABLED: 'Authorization is not enabled',
				}
				this.updateStatus(
					InstanceStatus.ConnectionFailure,
					`Failed to get code: ${data.code ? errorDictionary[data.code] : data.code}`,
				)
				return
			}

			this.updateStatus(InstanceStatus.Connecting, 'Waiting for authorization (' + data.code + ')')
			const token = await fetch('http://' + config.host + ':' + config.port + '/api/v1/auth/request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					appId: 'bitfocus-companion',
					code: data.code,
				}),
			}).catch(() => {
				return null
			})

			if (!token) {
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Failed to request token')
				return
			}

			const tokenData = (await attemptParseJson(token)) as {
				token?: string
				code?: string
			}
			if (!tokenData) {
				this.updateStatus(InstanceStatus.UnknownError, 'Failed to parse token response')
				return
			}

			if (tokenData.code) {
				this.updateStatus(InstanceStatus.ConnectionFailure, `Failed to get token: ${tokenData.code}`)
				return
			}

			if (!tokenData.token) {
				this.updateStatus(InstanceStatus.UnknownError, 'No token received')
				return
			}

			this.token = tokenData.token
			config.token = this.token
			this.saveConfig(config)
		} else {
			this.updateStatus(InstanceStatus.Connecting, 'Using provided token')
			this.token = config.token
		}

		this.updateStatus(InstanceStatus.Connecting, 'Connecting to socket')
		this.socket = io('http://' + config.host + ':' + config.port + '/api/v1/realtime', {
			transports: ['websocket'],
			auth: {
				token: this.token,
			},
		})

		const connected = await new Promise<boolean>((resolve, reject) => {
			this.socket?.on('connect', () => {
				this.log('info', 'Connected to socket')
				resolve(true)
			})
			this.socket?.on('connect_error', (err) => {
				this.log('error', 'Socket connection error: ' + err.message)
				reject(err)
			})
		}).catch(async (err) => {
			if (err.message === 'Authentication not provided or invalid') {
				this.log('error', 'Invalid token, requesting new token')
				config.token = ''
				await this.init(config)
				return false
			}
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Socket connection failed: ' + err.message)
			return false
		})

		if (!connected) {
			return
		}

		this.socket?.onAny((event, data) => {
			if (event === 'state-update') {
				this.data = data as Record<string, unknown>

				this.checkFeedbacks()
				UpdateVariables(this)
			}
		})

		this.socket?.on('disconnect', async () => {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Socket disconnected, attempting to reconnect')
			await this.init(this.config)
		})

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}

	async sendCommand(command: string, data?: number | Record<string, string | null>): Promise<void> {
		if (!this.token) {
			throw new Error('No token')
		}
		const res = await fetch('http://' + this.config.host + ':' + this.config.port + '/api/v1/command', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: this.token,
			},
			body: JSON.stringify({
				command: command,
				data: data,
			}),
		})

		if (!res.ok) {
			throw new Error('Failed to send command')
		}
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
		}
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		await this.destroy() // Clean up before reinitializing
		await this.init(config) // Reinitialize with new config
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
