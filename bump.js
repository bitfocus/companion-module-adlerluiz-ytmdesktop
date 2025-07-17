import fs from 'fs'
import path from 'path'

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))

pkg.version = process.argv[2]
if (!pkg.version || pkg.version.length < 1) {
	throw new Error('Version argument is required')
}

fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(pkg, null, '\t'))
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'companion', 'manifest.json'), 'utf8'))
manifest.version = pkg.version
fs.writeFileSync(path.join(__dirname, 'companion', 'manifest.json'), JSON.stringify(manifest, null, '\t'))

console.log(`Version bumped to ${pkg.version}`)
