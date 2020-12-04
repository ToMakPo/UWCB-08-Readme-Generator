const fs = require('fs')

const path = './assets/scripts/data.json'

const Data = function(data) {
    let lastSavedPath = data.lastSavedPath
    this.getLastSavedPath = () => lastSavedPath
    this.setLastSavedPath = path => {
        lastSavedPath = path
        save()
    }

    let team = data.team
    this.getTeam = () => team
    this.addTeamMember = (name, image='', phone='', email='', ...profiles) => {
        phone = phone.toString().replace(/[^0-9]/g, '')
        console.log('profiles:', profiles);
        const member = { name, image, phone, email, profiles }
        team[name] = member
        save()
        return member
    }
    this.newProfile = (text, url) => { return {text, url} }
    this.removeTeamMember = name => {
        delete team[name]
        save()
    }

    const save = function() {
        fs.writeFileSync(path, JSON.stringify({ lastSavedPath, team }))
    }
}

const importData = function() {
    const raw = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf-8')) : {
        lastSavedPath: './',
        team: {}
    }
    return new Data(raw)
}

module.exports = importData()