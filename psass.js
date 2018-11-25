
const fs = require("fs")
const path = require("path")
const sass = require("sass")
const fiber = require("fibers")
const shelljs = require("shelljs")

module.exports = async function psass({input, output, sourceMap}) {
	return new Promise((resolve, reject) => {
		sass.render({
			file: input,
			fiber,
			sourceMap,
			outFile: output
		}, (error, result) => {
			if (error) reject(error)
			else {
				shelljs.mkdir("-p", path.parse(output).dir)
				fs.writeFile(output, result.css, error2 => {
					if (error2) reject(error2)
					else resolve()
				})
			}
		})
	})
}
