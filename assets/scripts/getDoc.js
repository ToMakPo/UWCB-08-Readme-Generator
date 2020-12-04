function getDoc(markdown) {
    if (markdown) {
        let version = markdown.match(/<!-- .*?\(?v(.*?)\)? -->/).map(s => s.replace(pattern, '$1'))[0]
        
        switch (version) {
            case '1.0.0':
                return JSON.parse(markdown.match(/<!-- json=(.*?) -->/s).map(s => s.replace(pattern, '$1'))[0])
            default: getDoc()
        }
    } else {
        return {
            title: '', 
            description: '', 
            goal: '', 
            tasks: [], 
            links: [], 
            project: [], 
            contributors: [], 
            attributions: []}
    }
}
module.exports = getDoc