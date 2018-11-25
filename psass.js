
const fs = require("fs")
const path = require("path")
const sass = require("sass")
const fiber = require("fibers")
const shelljs = require("shelljs")

const toolbox = require("./toolbox")

async function writeFile(file, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, error => {
			if (error) reject(error)
			else resolve()
		})
	})
}

async function render({file, sourceMap, outFile}) {
	return new Promise((resolve, reject) => {
		sass.render({
			file,
			fiber,
			sourceMap,
			outFile
		}, (error, result) => {
			if (error) reject(error)
			else resolve(result)
		})
	})
}

async function compile({file, outFile, sourceMap}) {
	const result = await render({file, outFile, sourceMap})
	shelljs.mkdir("-p", path.parse(outFile).dir)
	await writeFile(outFile, result.css)
}

// async function readDependencyGraph({dir}) {

// }

// class SassDependency {

// 	constructor(sassFile, parent) {
// 		this.sassFile = sassFile
// 		this.parent = parent
// 		this.children = []
// 	}

// 	addChild(sassFile) {
// 		const child = new SassDependency(sassFile, this)
// 		this.children.push(child)
// 	}

// 	get chain() {
// 		const c = [this.sassFile]
// 		let node = this
// 		while (node.parent) {
// 			c.push(node.parent.sassFile)
// 			node = node.parent
// 		}
// 		return c
// 	}
// }

async function listRelatedFiles(file, relativeDirectory) {
	const result = await render({file})
	const absolutePaths = Array.from(result.stats.includedFiles)
	const absoluteDirectory = path.resolve(relativeDirectory)
	const relativePaths = absolutePaths.map(absolute =>
		toolbox.rebasePath({
			path: absolute,
			directory: absoluteDirectory,
			newDirectory: relativeDirectory
		})
	)
	const fixedExtensions = relativePaths.map(filePath => {
		const {dir, name} = path.parse(filePath)
		return path.normalize(`${dir}/${name}.scss`)
	})
	return fixedExtensions
	// const dependency = new SassDependency(file, parent)
	// const includes = Array.from(result.stats.includedFiles).slice(1)
	// console.warn("INCLUDES", file, includes)
	// for (include of includes) {
	// 	dependency.addChild(include)
	// 	await crawlDependencies(include, dependency)
	// }
	// return dependency
}

module.exports = {
	render,
	compile,
	listRelatedFiles
}
