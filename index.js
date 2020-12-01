const inquirer = require('inquirer')
const global = require('./assets/scripts/scritps')

inquirer.prompt([
    {
        type: 'input',
        message: global.questionStrings['title'],
        name: 'title'
    }
])
.then(response => {
    const title = global.getProperCase(response.title)
    console.log(title);
})