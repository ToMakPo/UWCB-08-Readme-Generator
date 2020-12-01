const questionStrings = {
    title: 'What is the title of the project?'
}

/** Convert the string to proper case. */
const getProperCase = function(str) {
    return str.replace(/\w\S*/g, txt => {
        return txt[0].toUpperCase() + txt.substr(1).toLowerCase();
    })
}

module.exports = {
    questionStrings,
    getProperCase
}