const metadata = require('./metadata')
const generateMarkdown = require('./generateDocument')

const fs = require('fs')

function saveReadme(file) {
    const markdown = generateMarkdown(file)
    
    file.path = file.path == '' ? './' : file.path.replace(/^(.+\/)?(.+?\..+)$/, '$1').replace(/^(.*[^\/])$/, '$1/')
    
    fs.writeFileSync(file.path + 'README.md', markdown)

    metadata.addFile(file)
}

module.exports = saveReadme