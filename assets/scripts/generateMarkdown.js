// function to generate markdown for README
const format = {
    goal: value => value,
    tasks: value => value.map(task => task.replace('^([>]*)(.*)$', '$1- $2')).join('\n'),
    links: value => value.map(({text, url, info}) => `[${text}](${url})${info ? ` - ${info}` : ''}`).join('\n'),
    project: value => value.map(line => {
        if (typeof line === 'object') {
            switch (line.type) {
                case 'img': return `![${line.alt}](${line.url})`
                default: return JSON.stringify(line)
            }
        } else return line
    }).join('\n'),
    contributors: value => ['<div style="display:flex; flex-wrap:wrap">',
        ...value.map(c => {
            let card = []
                            card.push(`    <span style="display:flex; flex-wrap:wrap; background:#333; padding:10px; border-radius:10px; margin:5px; flex-grow: 1">`)
                            card.push(`        <span style="display:flex; flex-direction: column">`)
                            card.push(`            <h2>${c.name}</h2>`)
            if (c.image)    card.push(`            <img src='${c.image}' style="width:120px; height:120px; object-fit:cover; margin-right:10px; border-radius: 5px">`)
            if (c.phone)    card.push(`            <a href="tel:+1${c.phone}" target="_blank" style="font-size:10px">${c.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}</a>`)
            if (c.email)    card.push(`            <a href="mailto:${c.email}" target="_blank" style="font-size:10px">${c.email}</a>`)
            for (const p of c.profiles)
                            card.push(`            <a href="${p.url}" target="_blank" style="font-size:10px">${p.text}</a>`)
                            card.push(`        </span>`)
                            card.push(`    </span>`)
            return card.join('\n')
        }),
        '</div>'
    ].join('\n'),
    attributions: value => value.map(val => {
        if (typeof val === 'object') {
            const {text, url, info} = val
            return `[${text}](${url})${info ? ` - ${info}` : ''}`
        } else return val
    }).join('\n')
}

const versionNumber = '1.0.0'

function generateMarkdown(data, includeMetadata=true) {
    const include = (section, icon) => {
        const value = data[section]

        if (value && value.length)
            document += `${document ? '\n' : ''}## ${icon} ${section.toUpperCase()}\n` +
                `${format[section]}\n`
    }
    
    const {title, description} = data
    let document = ''
    if (includeMetadata) document += `<!-- Created by Makai's Readme Generator (v${versionNumber}) -->\n`
    if (title) document += `# ${title}\n`
    if (description) document += `${description}\n`
    include('goal', '🎯')
    include('tasks', '✅')
    include('links', '📌')
    include('project', '⚔️')
    include('contributors', '👾')
    include('attributions', '🏆')
    if (includeMetadata) document += `\n<!-- json='${JSON.stringify(data)}' -->`
}

module.exports = generateMarkdown