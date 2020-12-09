const metadata = require('./metadata')

const generateDocument = {
    md: file = makeMarkdown,
    html: file = makeHTML,
    json: file = makeJSON
}

function makeMarkdown(file) {
    const {id, version, title, description, sections} = file
    const output = []

    output.push(`<!-- id: ${id}, version: ${version} -->`)
    output.push(`# ${title}`)
    output.push(`${description}`)
    
    makeSectons()

    return output.join('\n')

    function makeSectons() {
        const makeSection = {
            'goal': makeGoal,
            'tasks': makeTasks,
            'user story': makeUserStory,
            'links': makeLinks,
            'project': makeProject,
            'contributors': makeContributors,
            'attributions': makeAttributions
        }

        for (const {section, value} of sections) {
            makeSection[section](value)
        }
    }

    function makeGoal(text) {
        output.push(``)
        output.push(`---`)
        output.push(`## 🎯 GOAL`)
        output.push(`${text}`)
    }

    function makeTasks(taskList) {
        output.push(``)
        output.push(`---`)
        output.push(`## ✅ TASKS`)
        makeList(taskList)
    }

    function makeUserStory({asA, iWant, soThat}) {
        output.push(``)
        output.push(`---`)
        output.push(`## 📖 USER STORY`)
        output.push(`${asA}<br>`)
        output.push(`${iWant}<br>`)
        output.push(`${soThat}`)
    }

    function makeLinks(links) {
        output.push(``)
        output.push(`---`)
        output.push(`## 📌 LINKS`)
        for (const {text, url, info} of links) {
            output.push(`[${text}](${url})${info ? ` - ${info}` : ''}`)
        }
    }

    function makeProject(blocks) {
        const makeBlock = {
            'paragraph': makeParagraphBlock,
            'image': makeImageBlock,
            'link': makeLinkBlock,
            'code': makeCodeBlock,
            'quote': makeQuoteBlock,
            'ordered list': makeListBlock,
            'unordered list': makeListBlock,
            'table': makeTableBlock
        }
        let lastType = ''

        output.push(``)
        output.push(`---`)
        output.push(`## ⚔️ PROJECT`)
        for (const {type, ...values} of blocks) {
            if (type != lastType) output.push(``)
            makeBlock[type](values)
            lastType = type
        }
    }

    function makeParagraphBlock({text}) {
        output.push(text)
    }

    function makeImageBlock({alt, url, info}) {
        output.push(`![${alt}](${url})`)
        if (info) output.push(info)
    }

    function makeLinkBlock({text, url, info}) {
        output.push(`[${text}](${url})${info ? ` - ${info}` : ''}`)
    }
    
    function makeCodeBlock({lang, lines}) {
        output.push('```' + lang)
        for (const line of lines) {
            output.push(line)
        }
        output.push('```')
    }
    
    function makeQuoteBlock({text}) {
        output.push(text.split('\n').map(s => `> ${s}`).join('<br>\n'))
    }
    
    function makeListBlock({items, ordered}) {
        makeList(items, ordered)
    }
    
    function makeTableBlock({headers, rows, widths}) {
        const headerDisplay = headers.map((header, c) => header.padEnd(widths[c], ' '))
        const dividerDisplay = widths.map(width => '-'.repeat(width))
        const rowsDisplay = rows.map(row => row.map((cell, c) => cell.padEnd(widths[c], ' ')))
        
        output.push(`| ${headerDisplay.join(' | ')} |`)
        output.push(`| ${dividerDisplay.join(' | ')} |`)
        for (const row of rowsDisplay) {
            output.push(`| ${row.join(' | ')} |`)
        }
    }

    function makeContributors(contributors) {
        output.push(``)
        output.push(`---`)
        output.push(`## 👾 CONTRIBUTORS`)

        output.push(`<div style='display:flex; flex-wrap:wrap'>`)
        for (const {name, image, phone, email, profiles} of contributors) {
            output.push(`    <span style='display:flex; flex-wrap:wrap; background:#333; padding:5px; border-radius:10px; margin:5px; flex-grow: 1; min-width:calc(50% - 20px)'>`)
            if (image)  output.push(`        <img src='${image}' style='width:120px; height:120px; object-fit:cover; margin-right:10px; border-radius: 5px'>`)
            output.push(`        <span style='display:flex; flex-direction: column'>`)
            output.push(`            <h2>${name}</h2>`)
            if (phone)  output.push(`            <a href='tel:+1${phone}' target='_blank' style='font-size:10px'>${phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}</a>`)
            if (email)  output.push(`            <a href='mailto:${email}' target='_blank' style='font-size:10px'>${email}</a>`)
            for (const {text, url} of profiles) output.push(`            <a href='${url}' target='_blank' style='font-size:10px'>${text}</a>`)
            output.push(`        </span>`)
            output.push(`    </span>`)
        }
        output.push(`</div>`)
    }

    function makeAttributions(attributions) {
        output.push(``)
        output.push(`---`)
        output.push(`## 🏆 ATTRIBUTIONS`)
        for (const {name, url, info} of attributions) {
            output.push(`[${name}](${url})${info ? ` - ${info}` : ''}`)
        }
    }

    function makeList(list, ordered) {
        const x = ordered ? '1. ' : '- '
        const pad = n => '    '.repeat(n) + x
        
        for (let line of list) {
            let shifted = 0

            while (line[0] == '>') {
                shifted++
                line = line.substr(1)
            }

            output.push(pad(shifted) + line)
        }
    }
}

function makeHTML(file) {
    const {id, version, title, description, sections} = file
    const output = []

    output.push(`<!DOCTYPE html>`)
    output.push(`<html lang='en'>`)
    output.push(`<head>`)
    output.push(`    <meta charset='UTF-8'>`)
    output.push(`    <meta name='viewport' content='width=device-width, initial-scale=1.0'>`)
    output.push(`    <meta data-id='${id}' data-version='${version}'>`)
    output.push(`    <title>${title} README</title>`)
    output.push(`    `)
    output.push(`    <!-- STYLES-->`)
    output.push(`    <link rel="stylesheet" href="./lib/styles/html_readme_styles.css">`)
    output.push(`</head>`)
    output.push(`<body>`)
    output.push(`    <header>`)
    output.push(`        <h1>${title}</h1>`)
    output.push(`        <p>${description}</p>`)
    output.push(`    </header>`)
    makeSectons()
    output.push(`    `)
    output.push(`    <!-- SCRIPTS -->`)
    output.push(`    <script src='https://code.jquery.com/jquery-3.5.1.slim.min.js' integrity='sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj' crossorigin='anonymous'></script>`)
    output.push(`    <script src='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.3.2/highlight.min.js'></script>`)
    output.push(`    <script> for (let block of $('.project-code')) hljs.highlightBlock(block) </script>`)
    output.push(`</body>`)
    output.push(`</html>`)

    return output.join('\n')

    function makeSectons() {
        const makeSection = {
            'goal': makeGoal,
            'tasks': makeTasks,
            'user story': makeUserStory,
            'links': makeLinks,
            'project': makeProject,
            'contributors': makeContributors,
            'attributions': makeAttributions
        }

        for (const {section, value} of sections) {
            makeSection[section](value)
        }
    }

    function makeGoal(text) {
        output.push(`    `)
        output.push(`    <section id='goal-section'>`)
        output.push(`        <h2>🎯 GOAL</h2>`)
        output.push(`        <p>${text}</p>`)
        output.push(`    </section>`)
    }

    function makeTasks(taskList) {
        output.push(`    `)
        output.push(`    <section id='tasks-section'>`)
        output.push(`        <h2>✅ TASKS</h2>`)
        makeList(taskList)
        output.push(`    </section>`)
    }

    function makeUserStory({asA, iWant, soThat}) {
        output.push(`    `)
        output.push(`    <section id='tasks-user-Story'>`)
        output.push(`        <h2>📖 USER STORY</h2>`)
        output.push(`        <p>`)
        output.push(`            ${asA}<br>`)
        output.push(`            ${iWant}<br>`)
        output.push(`            ${soThat}`)
        output.push(`        </p>`)
        output.push(`    </section>`)
    }

    function makeLinks(links) {
        output.push(`    `)
        output.push(`    <section id='links-section'>`)
        output.push(`        <h2>📌 LINKS</h2>`)
        for (const {text, url, info} of links) {
            const html = `<a href='${url}' target='_blank'>${text}</a>${info ? ` - ${info}` : ''}`
            output.push(`        ${html}`)
        }
        output.push(`    </section>`)
    }

    function makeProject(blocks) {
        const makeBlock = {
            'paragraph': makeParagraphBlock,
            'image': makeImageBlock,
            'link': makeLinkBlock,
            'code': makeCodeBlock,
            'quote': makeQuoteBlock,
            'ordered list': makeListBlock,
            'unordered list': makeListBlock,
            'table': makeTableBlock
        }
        let lastType = ''

        output.push(`    `)
        output.push(`    <section id='project-section'>`)
        output.push(`        <h2>⚔️ PROJECT</h2>`)
        for (const {type, ...values} of blocks) {
            if (type != lastType) output.push(`        `)
            makeBlock[type](values)
            lastType = type
        }
        output.push(`    </section>`)
    }

    function makeParagraphBlock({text}) {
        output.push(`        <p class='block project-paragraph'>${text}</p>`)
    }

    function makeImageBlock({alt, url, info}) {
        output.push(`        <figure class='block project-image'>`)
        output.push(`            <img src='${url}' alt='${alt}'>`)
        output.push(`            <figcaption>${info}</figcaption>`)
        output.push(`        </figure>`)
    }

    function makeLinkBlock({text, url, info}) {
        output.push(`        <a class='block project-link' href='${url}' target='_blank'>${text}</a>${info ? ` - ${info}` : ''}`)
    }
    
    function makeCodeBlock({lang, lines}) {
        output.push(`<pre class='block project-code ${lang}'>`)
        for (const line of lines) {
            output.push(line)
        }
        output[output.length-1] += `</pre>`
    }
    
    function makeQuoteBlock({text}) {
        output.push(`        <p class='block project-quote'>${text.replace('\n', '<br>\n')}</p>`)
    }
    
    function makeListBlock({items, ordered}) {
        const tag = ordered ? 'ol' : 'ul'
        output.push(`        <${tag} class='block project-list'>`)
        makeList(items, ordered, 0)
    }
    
    function makeTableBlock({headers, rows}) {
        output.push(`        <table class='block project-table'>`)
        
        output.push(`            <tr class='header-row'>`)
        for (const header of headers) {
            output.push(`                <th>${header}</th>`)
        }
        output.push(`            </tr>`)

        for (const row of rows) {
            output.push(`            <tr class='body-row'>`)
            for (const cell of row) {
                output.push(`                <td>${cell}</td>`)
            }
            output.push(`            </tr>`)
        }

        output.push(`        </table>`)
    }

    function makeContributors(contributors) {
        output.push(`    `)
        output.push(`    <section id='contributors-section'>`)
        output.push(`        <h2>👾 CONTRIBUTORS</h2>`)
        output.push(`        <div id='member-cards'>`)

        for (const {name, image, phone, email, profiles} of contributors) {
            output.push(`            <span class='member-card'>`)
            if (image) {
                output.push(`                <img src='${image}' alt='profile image of ${name}.'>`)
            }
            output.push(`                <span>`)
            output.push(`                    <h2>${name}</h2>`)
            if (phone) {
                const text = phone.replace(/(.{3})(.{3})(.{4})/, '($1) $2-$3')
                output.push(`                    <a href='tel:+1${phone}' target='_blank'>${text}</a>`)
            }
            if (email) {
                output.push(`                    <a href='mailto:${email}' target='_blank'>${email}</a>`)
            }
            for (const {text, url} of profiles) {
                output.push(`                    <a href='${url}' target='_blank'>${text}</a>`)
            }
            output.push(`                </span>`)
            output.push(`            </span>`)
        }

        output.push(`        </div>`)
        output.push(`    </section>`)
    }

    function makeAttributions(attributions) {
        output.push(`    `)
        output.push(`    <section id='attributions-section'>`)
        output.push(`        <h2>🏆 ATTRIBUTIONS</h2>`)
        for (const {name, url, info} of attributions) {
            const html = `<a href='${url}' target='_blank'>${name}</a>${info ? ` - ${info}` : ''}`
            output.push(`        ${html}`)
        }
        output.push(`    </section>`)
    }

    function makeList(list, ordered, indents=-1) {
        const start = ' '.repeat(8)
        const [oTag, cTag] = ordered ? ['<ol>', '</ol>'] : ['<ul>', '</ul>']

        const pad = () => start + '    '.repeat(indents)

        for (let line of list) {
            let shifted = 0

            while (line[0] == '>') {
                shifted++
                line = line.substr(1)
            }
            
            while (indents < shifted) {
                indents++
                output.push(pad() + oTag)
            }
            while (indents > shifted) {
                output.push(pad() + cTag)
                indents--
            }
            
            indents++
            output.push(pad() + `<li>${line}</li>`)
            indents--
        }
        while (indents > -1) {
            output.push(pad() + cTag)
            indents--
        }
    }
}
function makeJSON(file) {
    return JSON.stringify(file)
}

module.exports = generateDocument