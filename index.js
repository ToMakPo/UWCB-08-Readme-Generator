const generateMarkdown = require('./assets/scripts/generateMarkdown')
const stripMarkdown = require('./assets/scripts/stripMarkdown')
const inquirer = require('inquirer')
const fs = require('fs')

const data = JSON.parse(fs.readFileSync('./data.json'))
let importPath

// the functions that prompt for each part of the readme
async function setTitle() {
    let {title} = await inquirer.prompt([{
        name: 'title',
        type: 'input',
        message: 'What is the title of the project?\n'
    }])
    doc.title = title
}
async function setDescription() {
    let {description} = await inquirer.prompt([{
        name: 'description',
        type: 'input',
        message: 'Provide a brief description of the project?\n'
    }])
    doc.description = description
}
async function setGoal() {
    let {goal} = await inquirer.prompt([{
        name: 'goal',
        type: 'input',
        message: 'What is the goal of the project?\n'
    }])
    doc.goal = goal
}
const taskMsg = 'What are some of the tasks for this project?\n - Type "done" when you have finished the list.\n? >'
async function setTasks() {
    for (let i = 0; i < 99; i++) {
        let {task} = await inquirer.prompt([{
            name: 'task',
            type: 'input',
            message: i ? '>' : taskMsg
        }])
        if (task.trim().toLowerCase() != 'done') {
            doc.tasks.push(task)
        } else break
    }
}
const nevermind = '*Never mind. It all looks right.'
async function fixTask() {
    let {action} = await inquirer.prompt([{
        name: 'action',
        type: 'list',
        message: 'What would you like to do with tasks?',
        choices: ['edit', 'remove', 'insert', nevermind]
    }])

    switch (action) {
        case 'edit': await editTask(); break
        case 'remove': await removeTask(); break
        case 'insert': await insertTask(); break
        default: await createReadmeFile()
    }
}

function numberedList(list) {
    const buff = `${list.length}`.length
    let newList = list.map((item, i) => `${`${i}`.padStart(buff, ' ')}: ${item}`)
    return newList
}

async function editTask() {
    let {selected} = await inquirer.prompt([{
        name: 'selected',
        type: 'list',
        message: 'What task needs to be edited?',
        choices: [...numberedList(doc.tasks), nevermind]
    }])

    if (selected == nevermind) await createReadmeFile()
    else {
        let [index, task] = selected.split(/: (.+)/).map(s => s.trim())

        let {newTask} = await inquirer.prompt([{
            name: 'newTask',
            type: 'input',
            message: 'What should this task be?',
            default: task
        }])

        doc.tasks[index] = newTask
        
        await checkForErrors()
    }

}

async function removeTask() {
    let {selected} = await inquirer.prompt([{
        name: 'selected',
        type: 'list',
        message: 'What task needs to be removed?',
        choices: [...numberedList(doc.tasks), nevermind]
    }])

    if (selected == nevermind) await createReadmeFile()
    else {
        let index = parseInt(selected.split(':')[0])
        doc.tasks.splice(index, 1)
        
        await checkForErrors()
    }
}

const toTheEnd = 'Add to the end.'
async function insertTask() {
    let {selected} = await inquirer.prompt([{
        name: 'selected',
        type: 'list',
        message: 'Insert new task before:',
        choices: [...numberedList(doc.tasks), toTheEnd, nevermind]
    }])

    if (selected == nevermind) await createReadmeFile()
    else {
        let {newTask} = await inquirer.prompt([{
            name: 'newTask',
            type: 'input',
            message: 'What would you like to insert?\n'
        }])

        if (selected == toTheEnd) {
            doc.tasks.push(newTask)
        } else {
            let index = parseInt(selected.split(':')[0])
            doc.tasks.splice(index, 0, newTask)
        }
        
        await checkForErrors()
    }
}

async function checkForErrors() {
    let md = generateMarkdown(doc, false)
    console.log(`\n-- README.md ----------------------------\n${md}'-----------------------------------------\n`);

    let {correct} = await inquirer.prompt([{
        name: 'correct',
        type: 'confirm',
        message: 'Displayed above is what the final readme file will look like. Is this correct?\n- choose "n" to make changes.'
    }])

    if (correct) {
        await createReadmeFile()
    } else {
        let {section} = await inquirer.prompt([{
            name: 'section',
            type: 'list',
            message: 'What part needs to be fixed?',
            choices: ['title', 'description', 'goal', 'task', nevermind]
        }])

        switch (section) {
            case 'title': await setTitle(); break
            case 'description': await setDescription(); break
            case 'goal': await setGoal(); break
            case 'task': await fixTask(); break
            case nevermind: await createReadmeFile(); break
            default: console.error(`${section} was never taken care of.`);
        }
    }
}

async function createReadmeFile() {
    let md = generateMarkdown(doc)
    
    let {path} = await inquirer.prompt([{
        name: 'path',
        type: 'input',
        message: 'Where would you like to save this readme file?\n',
        default: importPath ? importPath : data.lastSavedPath
    }])
    
    path = path.replace(/\\/g, "/")
    const len = path.length
    if (path.substr(len - 3) != '.md') {
        if (path.substr(len - 1) != '/') path += '/'
        path += 'README.md'
    }

    fs.writeFile(path, md, err => {
        if (err) {
            console.log('The path you provided had an issue, please try again.')
            createReadmeFile()
        } else {
            data.lastSavedPath = path
            fs.writeFile('./data.json', JSON.stringify(data), err => {})
            console.log('Readme file has been created.');
        }
    })
}

let doc = {
    title: '',
    description: '',
    goal: '',
    tasks: [],
}

async function importReadme() {
    const {path} = await inquirer.prompt([{
        name: 'path',
        type: 'input',
        message: 'What is the path of the readme file?\n',
        validate: input => /.+(.md)$/.test(input) || input == ''
    }])

    if (path != '') {
        try { 
            let md = fs.readFileSync(path, 'utf8')
            try {
                doc = stripMarkdown(md)
                importPath = path
            }
            catch (e) {console.log('Could not strip markdown.\n', e);}
        }
        catch (e) {
            console.log('Could not find a file at that location.');
            await importReadme()
        }
        
        await checkForErrors()
    } else {
        console.log('No file was found.')
        await init()
    }
}

// function to initialize program
async function init() {
    const [newFile, editFile] = ['Create a new readme file.', 'Edit an existing readme file.']

    const {selected} = await inquirer.prompt([{
        name: 'selected',
        type: 'list',
        message: 'What would you like to do?',
        choices: [newFile, editFile]
    }])

    if (selected == newFile) {
        importPath = null

        await setTitle()
        await setDescription()
        await setGoal()
        await setTasks()

        await checkForErrors()

        console.log('Done making readme file.');
    } else {
        await importReadme()
    }
}

// function call to initialize program
init();
