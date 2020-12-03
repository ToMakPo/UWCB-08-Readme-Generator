// function to generate markdown for README
function generateMarkdown({title, description, goal, tasks}, includeNotes=true) {
    if (includeNotes)
/// WITH NOTES ///
        return `<!-- Created by Makai's Readme Generator (v1.0.0) -->
# <!-- title -->${title}
<!-- description -->${description}

## 🎯 GOAL
<!-- goal -->${goal}

## ✅ TASKS
${tasks.map(task => `<!-- task -->${task}<br>`).join('\n')}
`

/// WITHOUT NOTES ///
    else return `# ${title}
${description}

## 🎯 GOAL
${goal}

## ✅ TASKS
${tasks.join('\n')}
`
}

module.exports = generateMarkdown