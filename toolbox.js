
const pathModule = require("path")

function rebasePath({path, directory, newDirectory}) {
	const relative = pathModule.relative(directory, path)
	const {dir, name} = pathModule.parse(relative)
	const outpath = pathModule.normalize(`${newDirectory}/${dir}/${name}.css`)
	return outpath
}

module.exports = {
	rebasePath
}
