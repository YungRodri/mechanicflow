// Test with explicit require path
console.log('Test starting...')
console.log('dirname:', __dirname)
console.log('process.type:', process.type)
console.log('process.versions.electron:', process.versions.electron)

const path = require('path')

// Check what the electron module exports
const electronModule = require('electron')
console.log('electronModule type:', typeof electronModule)
console.log('electronModule:', electronModule)

// Try requiring the internal electron module directly
try {
    // In Electron main process, the modules should be available directly
    const electronPath = path.join(__dirname, 'node_modules', 'electron', 'index.js')
    console.log('electron module path:', electronPath)

    const fs = require('fs')
    if (fs.existsSync(electronPath)) {
        const content = fs.readFileSync(electronPath, 'utf8')
        console.log('electron index.js content (first 500 chars):', content.substring(0, 500))
    }
} catch (e) {
    console.log('error:', e.message)
}
