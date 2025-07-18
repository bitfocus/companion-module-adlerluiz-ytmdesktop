import fs from 'fs'
import { feedbackDefinitions } from './src/feedbacks.js'
import { actionDefinitions } from './src/actions.js'
import { variableDefinitions } from './src/variables.js'

export async function generateDocs(): Promise<void> {
	let final = fs.readFileSync('README.md', 'utf8').split('\n\n## Available actions')[0]

	final += '\n\n## Available actions\n\n'
	for (const action of Object.keys(actionDefinitions)) {
		const value = actionDefinitions[action]
		final += `- ${action} (${value.description ?? value.name})\n`
	}

	final += '\n## Available feedbacks\n\n'
	for (const feedback of Object.keys(feedbackDefinitions)) {
		const value = feedbackDefinitions[feedback]
		final += `- ${feedback} (${value.description ?? value.name})\n`
	}

	final += '\n## Available variables\n\n'
	for (const variable of variableDefinitions) {
		final += `- ${variable.variableId} (${variable.name})\n`
	}

	fs.writeFileSync('README.md', final)
	fs.writeFileSync('companion/HELP.md', final.replaceAll('](/companion/', ']('))

	console.log('Documentation generated successfully!')
}

if (require.main === module) {
	await generateDocs()
}
