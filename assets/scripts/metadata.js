const fs = require('fs')

const path = './assets/scripts/data.json'

const Data = function({lastSavedPath, team}) {
    let lastSavedPath = lastSavedPath
    this.getLastSavedPath = () => lastSavedPath
    this.setLastSavedPath = path => {
        lastSavedPath = path
        save()
    }

    let team = team
    this.getTeam = () => team
    this.addTeamMember = (name, image='', phone='', email='', ...profiles) => {
        const member = { name, image, phone, email, profiles }
        team.push(member)
        save()
        return member
    }
    this.newProfile = (text, url) => {text, url}

    const save = function() {
        fs.writeFileSync(path, JSON.parse({
            lastSavedPath: this.lastSavedPath,
            team: this.team
        }))
    }
}

const importData = function(path) {
    const raw = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf-8')) : {
        lastSavedPath: './',
        team: []
    }
    return new Data(raw)
}

module.exports = importData()