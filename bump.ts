import * as fs from 'fs'
import * as path from 'path'
// eslint-disable-next-line n/no-unpublished-import
import prompts from 'prompts'
import { generateDocs } from './generateDocs.js'
import { execSync } from 'child_process'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

await (async () => {
	const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
	console.log(pkg.version)
	const bump = await prompts({
		type: 'select',
		name: 'bump',
		message: 'Select level of bump',
		choices: [
			{ title: 'patch', value: 'patch' },
			{ title: 'minor', value: 'minor' },
			{ title: 'major', value: 'major' },
			{ title: 'custom', value: 'custom' },
		],
		initial: 0,
	})

	if (!bump.bump) return

	pkg.version = pkg.version.split('.')
	if (bump.bump === 'patch') {
		pkg.version[2] = parseInt(pkg.version[2]) + 1
	} else if (bump.bump === 'minor') {
		pkg.version[1] = parseInt(pkg.version[1]) + 1
		pkg.version[2] = 0
	} else if (bump.bump === 'major') {
		pkg.version[0] = parseInt(pkg.version[0]) + 1
		pkg.version[1] = 0
		pkg.version[2] = 0
	} else if (bump.bump === 'custom') {
		const custom = await prompts({
			type: 'text',
			name: 'custom',
			message: 'Input custom version (current: ' + pkg.version.join('.') + '):',

			validate: (value) => {
				const parts = value.split('.')
				if (parts.length !== 3 || !parts.every((part: string) => /^\d+$/.test(part))) {
					return 'Version must be in the format x.y.z'
				}
				return true
			},
		})
		pkg.version = custom.custom.split('.')
	}

	pkg.version = pkg.version.join('.')

	const sure = await prompts({
		type: 'confirm',
		name: 'sure',
		message: `Bump version to ${pkg.version}. Are you sure?`,
		initial: false,
	})

	if (!sure.sure) {
		console.log('Aborted')
		return
	}

	fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(pkg, null, '\t'))
	const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'companion', 'manifest.json'), 'utf8'))
	manifest.version = pkg.version
	fs.writeFileSync(path.join(__dirname, 'companion', 'manifest.json'), JSON.stringify(manifest, null, '\t'))
	manifest.version = pkg.version
	fs.writeFileSync(path.join(__dirname, 'companion', 'manifest.json'), JSON.stringify(manifest, null, '\t'))

	console.log(`Version bumped to ${pkg.version}`)

	const shouldGenerateDocs = await prompts({
		type: 'confirm',
		name: 'shouldGenerateDocs',
		message: 'Generate documentation?',
		initial: true,
	})

	if (shouldGenerateDocs.shouldGenerateDocs) {
		await generateDocs()
	}

	const shouldCommit = await prompts({
		type: 'confirm',
		name: 'shouldCommit',
		message: 'Commit and push changes?',
		initial: true,
	})

	if (shouldCommit.shouldCommit) {
		execSync('git add README.md package.json companion/manifest.json')
		execSync('git commit -m "Bump version to ' + pkg.version + '"')
		execSync('git push')
		console.log('Changes committed and pushed successfully!')
		execSync(
			'xdg-open https://github.com/bitfocus/companion-module-adlerluiz-ytmdesktop/compare/main...dandanthedev:companion-module-adlerluiz-ytmdesktop:dev',
		)
	}
})()
