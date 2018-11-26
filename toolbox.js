
const fs = require("fs")
const pathModule = require("path")

/**
 * Promise wrapper for fs writeFile
 */
async function writeFile(file, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, error => {
			if (error) reject(error)
			else resolve()
		})
	})
}

/**
 * Splice a subpath from one path onto another
 */
function rebasePath({path, directory, newDirectory}) {
	const relative = pathModule.relative(directory, path)
	const {dir, name} = pathModule.parse(relative)
	const outpath = pathModule.normalize(`${newDirectory}/${dir}/${name}.css`)
	return outpath
}

module.exports = {
	writeFile,
	rebasePath
}
