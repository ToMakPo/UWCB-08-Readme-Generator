const inquirer = require('inquirer')
const fs = require('fs')
const metadata = require('./lib/scripts/metadata')
const generateDocument = require('./lib/scripts/generateDocument')

let file = metadata.buildFile()

async function init() {
    const modualName = 'index'
    const splitPath = process.argv[1].split('\\').pop().replace('.js', '')

    if (splitPath == modualName && process.argv.length > 2) {
        await call()
    } else {
        await start()
    }
}

/**Function that takes a value passed in from the terminal command line and processes it.
 * 
 * You can pass in any value and to the command line and it will log it's return value.
*/
async function call() {
    const returned = await eval(process.argv[2])

    const formated = (() => {
        if (typeof returned == 'object') return JSON.stringify(returned)
        if (typeof returned == 'function') return returned.toString()
        return returned
    })()

    console.log(formated)
}

async function start() {
    await createOrEditReadme()
    await editFile()

    metadata.addFile(file)

    const {saveFile} = await promptUserAboutSavingFile()

    if (saveFile) {
        let {docType} = await promptUserForDocumentType()
        docType = docType.toLowerCase().replace('markdown', 'md')
        const {savePath} = await promptUserForSavePath()

        file.path = savePath

        const document = generateDocument[docType](file)
        fs.writeFileSync(`${savePath}/README.${docType}`, document)

        return {file, document}
    }

    return {file, document:''}
}

async function createOrEditReadme() {
    const [create, edit] = [
        'Create a new readme file.',
        'Edit an existing readme file.'
    ]
    const options = [create, edit]

    const {action} = await promptUserAboutFirstStep(options)

    switch (action) {
        case create: await createNewReadme(); break
        case edit: await editExisitingReadme(); break
    }
    return file
}
async function promptUserAboutFirstStep(options) {
    return await inquirer.prompt([{
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        prefix: '-',
        choices: options
    }])
}

const sectionCalls = {
    'Goal': setGoalSection,
    'User Story': setUserStorySection,
    'Tasks': setTasksSection,
    'Links': setLinksSection,
    'Project': setProjectSection,
    'Contributors': setContributorsSection,
    'Attributions': setAttributionsSection
}
const sections = Object.keys(sectionCalls)
let unselected

async function createNewReadme() {
    file = metadata.buildFile()
    await setTitle()
    await setDescription()

    unselected = [...sections]
    while(true) {
        const {section} = await promptUserForNextSection()
        if (section != done) {
            unselected.splice(unselected.indexOf(section), 1)
            await sectionCalls[section]()
        } else break
    }
    return {file}
}

async function setTitle() {
    console.log('- What is the title of the project?')
    const {title} = await promptUserForTitle()

    file.title = title
    return {title}
}
async function promptUserForTitle() {
    return await inquirer.prompt([{
        name: 'title',
        type: 'input',
        message: '...',
        prefix: '',
        validate: value => value.length > 3
    }])
}

async function setDescription() {
    console.log('- Provide a brief description of the project.')
    const { description } = await promptUserForDescription()

    file.description = description
    return {description}
}
async function promptUserForDescription() {
    return await inquirer.prompt([{
        name: 'description',
        type: 'input',
        message: '...',
        prefix: '',
        validate: value => value.length > 3
    }])
}

const separator = new inquirer.Separator()
const done = 'Done'
const breakout = [separator, done]

async function promptUserForNextSection() {
    return await inquirer.prompt([{
        name: 'section',
        type: 'list',
        message: 'What section would you like to add to the readme?',
        prefix: '-',
        choices: [...unselected, ...breakout],
        pageSize: 99
    }])
}

async function setGoalSection() {
    console.log('- What is the goal of the project?')
    const { goal } = await promptUserForGoal()

    file.sections.push({section: 'goal', value: goal})
    return {goal}
}
async function promptUserForGoal() {
    return await inquirer.prompt([{
        name: 'goal',
        type: 'input',
        message: '...',
        prefix: ''
    }])
}

async function setTasksSection() {
    const tasks = []

    console.log('- What are some of the tasks for this project? Type "done" when ' +
    'you have finished the list. Use > at the beganing to indicate indentation.')
    while (true) {
        const { task } = await promptUserForTask()
        if (task.trim().toLowerCase() != "done") {
            tasks.push(task)
        } else break
    }

    file.sections.push({section: 'tasks', value: tasks})
    return {tasks}
}
async function promptUserForTask() {
    return await inquirer.prompt([{
        name: 'task',
        type: 'input',
        message: '...',
        prefix: ''
    }])
}

async function setLinksSection() {
    const links = []

    console.log('- Enter the information for your link.');
    while (true) {
        const link = await promptUserForLink()
        links.push(link)

        const { addLink } = await promptUserAboutAddingLink()

        if (!addLink) break
    }

    file.sections.push({section: 'links', value: links})
    return {links}
}
async function promptUserAboutAddingLink() {
    return await inquirer.prompt([{
        name: 'addLink',
        type: 'confirm',
        message: 'Do you have another link?',
        prefix: '-'
    }])
}
async function promptUserForLink() {
    return (link = await inquirer.prompt([{
        name: 'text',
        type: 'input',
        message: 'text |',
        prefix: ''
    }, {
        name: 'url',
        type: 'input',
        message: 'url  |',
        prefix: ''
    }, {
        name: 'info',
        type: 'input',
        message: 'info |',
        prefix: ''
    }]))
}

async function setUserStorySection() {
    console.log('- Please enter the user story.');
    const userStory = await promptUserForUserStory()

    file.sections.push({section: 'user story', value: userStory})
    return {userStory}
}
async function promptUserForUserStory() {
    return await inquirer.prompt([{
        name: 'asA',
        type: 'input',
        message: '...',
        prefix: '',
        transformer: input => {
            const an = input.substr(0, 2) == 'n '
            return `AS A${an ? 'N' : ''} ${an ? input.substr(2) : input}`
        },
        filter: input => {
            const an = input.substr(0, 2) == 'n '
            return `AS A${an ? 'N' : ''} ${an ? input.substr(2) : input}`
        }
    }, {
        name: 'iWant',
        type: 'input',
        message: '...',
        prefix: '',
        transformer: input => `I WANT ${input}`,
        filter: input => `I WANT ${input}`
    }, {
        name: 'soThat',
        type: 'input',
        message: '...',
        prefix: '',
        transformer: input => `SO THAT I ${input}`,
        filter: input => `SO THAT I ${input}`
    }])
}

const projectCalls = {
    'paragraph': promptUserForProjectParagraph,
    'image': promptUserForProjectImage,
    'link': promptUserForProjectLink,
    'code': buildProjectCode,
    'quote': promptUserForProjectQuote,
    'ordered list': buildProjectOrderedList,
    'unordered list': buildProjectList,
    'table': buildProjectTable
}
const projectTypes = Object.keys(projectCalls)
async function setProjectSection() {
    const project = []

    console.log('- Add project blocks to the file.');
    for (let i = 0; true; i++) {
        const {type} = await promptUserForProjectType(i)

        if (type != done)
            project.push({type, ...await projectCalls[type]()})
        else break
    }

    file.sections.push({section: 'project', value: project})
    return {project}
}
async function promptUserForProjectType(index) {
    return await inquirer.prompt([{
        name: 'type',
        type: 'rawlist',
        message: index
            ? 'What is the next project block?'
            : 'What is the first project block?',
        prefix: '-',
        choices: [...projectTypes, ...breakout],
        default: 'paragraph',
        pageSize: 99
    }])
}
async function promptUserForProjectParagraph() {
    return await inquirer.prompt([{
        name: 'text',
        type: 'input',
        message: '...',
        prefix: ''
    }])
}
async function promptUserForProjectImage() {
    return await inquirer.prompt([{
        name: 'alt',
        type: 'input',
        message: 'alt  |',
        prefix: ''
    }, {
        name: 'url',
        type: 'input',
        message: 'url  |',
        prefix: ''
    }, {
        name: 'info',
        type: 'input',
        message: 'info |',
        prefix: ''
    }])
}
async function promptUserForProjectLink() {
    return await inquirer.prompt([{
        name: 'text',
        type: 'input',
        message: 'text |',
        prefix: ''
    }, {
        name: 'url',
        type: 'input',
        message: 'url  |',
        prefix: ''
    }, {
        name: 'info',
        type: 'input',
        message: 'info |',
        prefix: ''
    }])
}
async function buildProjectCode() {
    const {lang} = await promptUserForProjectCodeLanguage()

    const lines = []
    console.log('- Create the code here. Type "done" when you have finished.')
    for (let i = 0; true; i++) {
        const {line} = await promptUserForProjectCodeLine()

        if (line.trim().toLowerCase() != "done") {
            lines.push(line)
        } else break
    }
    return { lang, lines }
}
async function promptUserForProjectCodeLanguage() {
    return await inquirer.prompt([{
        name: 'lang',
        type: 'input',
        message: 'What coding language is this code block for?',
        prefix: '-'
    }])
}
async function promptUserForProjectCodeLine() {
    return await inquirer.prompt([{
        name: 'line',
        type: 'input',
        message: '...',
        prefix: ''
    }])
}
async function promptUserForProjectQuote() {
    return await inquirer.prompt([{
        name: 'text',
        type: 'input',
        message: 'What is the quote?\n...',
        prefix: '-'
    }])
}
async function buildProjectOrderedList() {
    return await buildProjectList(true)
}
async function buildProjectList(ordered=false) {
    const items = []

    console.log('- Create the list. Type "done" when you have finished the list.')
    console.log('  Use > at the beganing to indicate indentation.')
    for (let i = 0; true; i++) {
        const {item} = await promptUserForProjectListItem()
        if (item.trim().toLowerCase() != "done") {
            items.push(item)
        } else break
    }
    return {items, ordered}
}
async function promptUserForProjectListItem() {
    return await inquirer.prompt([{
        name: 'item',
        type: 'input',
        message: '...',
        prefix: ''
    }])
}
async function buildProjectTable() {
    // const columns = []
    const keys = []
    const headers = []
    const widths = []
    const rows = []

    let max = 0

    console.log('- Add the headers for the columns. Type "done" when you have finished the list.')
    console.log('  Enter values in this format: key:display')
    console.log('  Simply providing the key will result in the display equaling the key.')
    console.log('  To make the display blank, formate the value like this: key:')
    console.log('  To hide the entire header, make leave all displays blank.')
    while (true) {
        const {value} = await promptUserForProjectTableColumnValue(keys)
        
        if (value.trim().toLowerCase() != "done") {
            let [key, header] = value.split(':').map(v => v.trim())
            if (header == undefined) header = key

            max = Math.max(max, key.length)
            const width = header.length

            keys.push(key)
            headers.push(header)
            widths.push(width)
        } else break
    }

    const rowQuestions = keys.map((key, i) => [{
        name: key,
        type: 'input',
        message: `${key.padEnd(max[i], ' ')} |`,
        prefix: ''
    }][0])

    console.log('- Enter values for the first row.')
    while (true) {
        const returned = await promptUserForProjectTableRow(rowQuestions)
        
        const row = Object.values(returned).map((value, i) => {
            const len = value.length
            if (widths[i] < len) {
                widths[i] = len
            }
            return value
        })

        rows.push(row)

        var {addRow} = await promptUserAboutAddingProjectTableRow()

        if (!addRow) break
    }

    return { headers, rows, widths }
}
async function promptUserForProjectTableColumnValue(keys) {
    return await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: '...',
        prefix: '',
        validate: value => {
            const key = value.split(':')[0].trim()
            if (/^[^a-z].*?$/.test(key)) return 'The key must start with a lower case letter.'
            if (/^.*[^\w].*$/.test(key)) return 'The key can only contain letters and numbers.'
            if (key.length == 0) return 'You can not have a blank key.'
            if (keys.includes(key)) return 'Can not have duplicate keys.'
            if (keys.length == 0 && value.trim().toLowerCase() == 'done') 
                return 'You must have at least one column header.'
            return true
        }
    }])
}
async function promptUserAboutAddingProjectTableRow() {
    return await inquirer.prompt([{
        name: 'addRow',
        type: 'confirm',
        message: 'Would you like to add a row?',
        prefix: '-'
    }])
}
async function promptUserForProjectTableRow(columns) {
    return await inquirer.prompt(columns)
}

async function setContributorsSection() {
    const contributors = []
    
    let names = metadata.getNames()
    const [pick, create] = [
        'Pick a team member that already exists.', 
        'Create a new team member.'
    ]

    while (true) {
        const options = names.length ? [pick, create] : [create]
        const {action} = await promptUserToSelectActionForContributor(options)

        if (action != done) {
            if (action == pick) {
                const {name} = await promptUserToSelectContributorName(names)

                contributors.push(metadata.getTeamMember(name))
                names.splice(names.indexOf(name), 1)
            } else {
                let member = await buildMember()
                contributors.push(member)

                const save = await promptUserAboutSavingMember()
                const {name, image, phone, email, profiles} = member
                if (save) metadata.addTeamMember(name, image, phone, email, ...profiles)
            }
        } else break
    }

    file.sections.push({section: 'contributors', value: contributors})
    return {contributors}
}
async function promptUserToSelectActionForContributor(options) {
    return await inquirer.prompt([{
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        prefix: '-',
        choices: [...options, ...breakout]
    }])
}
async function promptUserToSelectContributorName(names) {
    return await inquirer.prompt([{
        name: 'name',
        type: 'list',
        message: 'Who would you like to add to the list?',
        prefix: '-',
        choices: names
    }])
}
async function buildMember() {
    const info = await promptUserForMemberInfo()

    const profiles = []
    for (let i = 0; true; i++) {
        const {addProfile} = await promptUserAboutAddingMemberProfile(i)
        if (addProfile) {
            const profile = await promptUserForMemberProfile()
            profiles.push(profile)
        } else break
    }

    return { ...info, profiles }
}
async function promptUserForMemberInfo() {
    const emailFilter = /(?:[a-z0-9!#$%&'*+/=?^_'{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_'{|}~-]+)*|'(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*')@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

    return await inquirer.prompt([{
        name: 'name',
        type: 'input',
        message: 'name       |',
        prefix: '',
        validate: value => value == '' ? 
            'You must have a name for this person.' :
            value.length > 4 || 'The name must be at least 5 characters long.'
    }, {
        name: 'image',
        type: 'input',
        message: 'image path |',
        prefix: ''
    }, {
        name: 'phone',
        type: 'input',
        message: 'phone      |',
        prefix: '',
        validate: value => 
            value == '' || 
            /^\d{10}$/.test(value.replace(/[^0-9]/g, '')) ||
            'The phone number must have 10 digets.',
        filter: value => (value == '' ? '' : value.replace(/[^0-9]/g, ''))
    }, {
        name: 'email',
        type: 'input',
        message: 'email      |',
        prefix: '',
        validate: value => value == '' || emailFilter.test(value)
    }])
}
async function promptUserAboutAddingMemberProfile(index) {
    return await inquirer.prompt([{
        name: 'addProfile',
        type: 'confirm',
        message: index
            ? 'Would you like to add another one?'
            : 'Would you like to add a user profile link?',
        prefix: '-'
    }])
}
async function promptUserForMemberProfile() {
    return await inquirer.prompt([{
        name: 'text',
        type: 'input',
        message: 'text       |',
        prefix: ''
    }, {
        name: 'url',
        type: 'input',
        message: 'url        |',
        prefix: ''
    }])
}
async function promptUserAboutSavingMember() {
    return await inquirer.prompt([{
        name: 'save',
        type: 'confirm',
        message: 'Would you like to save this member to memory?',
        prefix: '-'
    }])
}

async function setAttributionsSection() {
    const attributions = []

    console.log('Provide information about the attribution.')
    while (true) {
        const attribution = await promptUserForAttribution()
        attributions.push(attribution)

        const {addMore} = await promptUserAboutAddingAttribution()
        if (!addMore) break
    }

    file.sections.push({section: 'attributions', value: attributions})
    return {attributions}
}
async function promptUserAboutAddingAttribution() {
    return await inquirer.prompt([{
        name: 'addMore',
        type: 'confirm',
        message: 'Would you like to include another one?',
        prefix: '-'
    }])
}
async function promptUserForAttribution() {
    return await inquirer.prompt([{
        name: 'name',
        type: 'input',
        message: 'name |',
        prefix: ''
    }, {
        name: 'url',
        type: 'input',
        message: 'url  |',
        prefix: ''
    }, {
        name: 'info',
        type: 'input',
        message: 'info |',
        prefix: ''
    }])
}
/** Allow the user to edit an existing file. */
async function editExisitingReadme() {
    const {importOption} = await promptUserForImportOptions()

    if (importOption == 'Pull') {
        const {id} = await promptUserForFileID()
        if (id) {
            file = metadata.getFileByID(id)
            return file
        }
    }
    if (importOption == 'Import') {
        const {importPath} = await promptUserForImportPath()

        const importedFile = metadata.importFile(importPath)
        if (importedFile) {
            file = importedFile
            return file
        } else {
            return await editExisitingReadme()
        }
    }
    console.log(`- Let's start from the begaining.`);
    return await createOrEditReadme()
}
async function promptUserForImportOptions() {
    return await inquirer.prompt([{
        name: 'importOption',
        type: 'list',
        message: 'Would you like to pull the file from local storage or import it from a JSON file?',
        prefix: '-',
        choices: ['Pull', 'Import', separator, 'Back']
    }])
}
async function promptUserForImportPath() {
    return await inquirer.prompt([{
        name: 'importPath',
        type: 'input',
        message: 'What is the path of the JSON file?\n...',
        prefix: '-'
    }])
}
/** Ask the user for the id of the file they would like to pull from metadata. */
async function promptUserForFileID() {
    return await inquirer.prompt([{
        name: 'id',
        type: 'input',
        message: 'What is the id of the readme you would like to edit?',
        prefix: '-',
        validate: value => {
            if (value == '' || /[a-z0-9]{6}/i.test(value)) return true
            return 'The id must be six characters long and can only contain letters and numbers.'
        },
        filter: value => value.toUpperCase()
    }])
}
/** Allow the user to make changes to the file before saving it. */
async function editFile() {
    //TODO: add an editor.
    return file
}
/** Ask the user if they would like to actualy save the file. If not, then it will only be
 *  saved to metadata.json.
 */
async function promptUserAboutSavingFile() {
    return inquirer.prompt([{
        name: 'saveFile',
        type: 'confirm',
        message: 'Would you like to save this file?',
        prefix: '-'
    }])
}
/** Ask the user what type of document they would like to create. */
async function promptUserForDocumentType() {
    return inquirer.prompt([{
        name: 'docType',
        type: 'list',
        message: 'What type of document would you like to create?',
        prefix: '-',
        choices: ['Markdown', 'HTML', 'JSON'],
        default: 'Markdown'
    }])
}
/** As the user if where they would like the document to be saved. */
async function promptUserForSavePath() {
    return inquirer.prompt([{
        name: 'savePath',
        type: 'input',
        message: 'Where would you like to save the document?\n...',
        prefix: '-',
        validate: value => fs.existsSync(value) || 'That path does not exist.',
        default: () => file.path ? file.path : null
    }])
}

init()
