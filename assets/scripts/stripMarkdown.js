// function to generate markdown for README
function stripMarkdown(markdown) {
    let doc = {
        title: '',
        description: '',
        goal: '',
        tasks: []
    }

    markdown = markdown.split('\n')
    
    for (let line of markdown) {
        let arr = line.match(/\<!-- (.+) --\>(.+)/)
        if (arr) {
            let key = arr[1].trim()
            let value = arr[2].trim()
            
            switch (key) {
                case 'task': doc.tasks.push(value.replace(/(.*?)(<br>)?$/, '$1'))
                default: doc[key] = value
            }
        }
    }

    return doc
}

module.exports = stripMarkdown