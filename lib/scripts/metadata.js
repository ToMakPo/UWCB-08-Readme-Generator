const fs = require('fs')

const dataPath = './lib/json/metadata.json'
const version = '1.0.0'

const Metadata = function(data) {
    const files = data.files
    this.getFileByID = id => files[id]
    this.getFilesByTitle = title => {
        title = title.toLowerCase()
        return Object.values(files).filter(file => {
            file.title.toLowerCase().match(title)
        })
    }
    this.buildFile = () => {
        let id
        do {
            id = (Math.floor((Math.random() * 26) + 10).toString(36) +
                Math.floor(Math.random() * 36**5).toString(36).padStart(5, '0')).toUpperCase()
        } while (files[id] != undefined)

        return {
            id, version,
            path: '',
            title: '', 
            description: '',
            sections: []
        }
    }
    this.addFile = file => {
        files[file.id] = file
        save()
        return file
    }
    this.removeFile = id => {
        if (files[id]) {
            delete files[id]
            save()
            return `Deleted file with id '${id}'`
        } else return `Could not find file with id '${id}'.`
    }
    this.importFile = importPath => {
        const fileExists = importPath.substr(importPath.length - 5) == '.json' && fs.existsSync(importPath)
        
        if (fileExists) {
            return JSON.parse(fs.readFileSync(importPath, 'utf-8'))
        } else {
            console.log('- There was an issue with that path.')
        }
    }
    
    const team = data.team
    this.getTeam = () => team
    this.getTeamMember = name => team[name]
    this.getNames = () => Object.keys(team)
    this.addTeamMember = (name, image='', phone='', email='', ...profiles) => {
        // phone = phone.toString().replace(/[^0-9]/g, '')
        const member = { name, image, phone, email, profiles }
        team[name] = member
        save()
        return member
    }
    this.newProfile = (text, url) => { return {text, url} }
    this.removeTeamMember = name => {
        if (team[name]) {
            delete team[name]
            save()
            return `Deleted team member named '${name}'`
        } else return `Could not find team member named '${name}'.`
    }

    const save = function() {
        return fs.writeFileSync(dataPath, JSON.stringify({ files, team }))
    }

    this.getData = () => data

    this.swapData = data
}

const importData = function(path) {
    const data = path.substr(path.length - 5) == '.json' && fs.existsSync(path) ? 
        JSON.parse(fs.readFileSync(path, 'utf-8')) : {
            files: {},
            team: {}
        }
    return new Metadata(data)
}

const metadata = importData(dataPath)

module.exports = metadata