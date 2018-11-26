
const fs = require("fs")
const path = require("path")
const sass = require("sass")
const fiber = require("fibers")
const shelljs = require("shelljs")
const fastGlob = require("fast-glob")

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

async function listChildren(file, relativeDirectory) {
	const result = await render({file})
	const absolutePaths = Array.from(result.stats.includedFiles).slice(1)
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
}

// async function makeSassNode(file, baseDirectory) {
// 	const node = new SassNode(file, undefined)
// 	const children = await listChildren(file, baseDirectory)
// 	for (child of children) {
// 		node.addChild(child)
// 	}
// 	return node
// }

async function readSassGraph(directory) {
	const sassFiles = await fastGlob([`${directory}/**/*.scss`])
	const root = new SassNode()
	const nodes = await Promise.all(
		sassFiles.map(async sassFile => {
			const node = root.addChild(sassFile)
			// const node = new SassNode(file)
			const children = await listChildren(sassFile, directory)
			for (child of children) {
				node.addChild(child)
			}
			return node
		})
	)
	return root
}

async function makeAscensionGraph(directory) {

	// get all sass files
	const sassFiles = await fastGlob([`${directory}/**/*.scss`])

	// list children for each file
	const childrenGraph = await Promise.all(
		sassFiles.map(async sassFile => {
			const children = await listChildren(sassFile, directory)
			return {sassFile, children}
		})
	)

	// flip upside down to create ascension graph
	const ascensionGraph = []
	const addToAscensionGraph = (sassFile, relatedFile) => {
		const member = ascensionGraph.find(m => m.sassFile === sassFile)
		if (member) member.related.push(relatedFile)
		else ascensionGraph.push({
			sassFile,
			related: [relatedFile]
		})
	}
	for (const node of childrenGraph) {
		addToAscensionGraph(node.sassFile, node.sassFile)
		for (const child of node.children) {
			addToAscensionGraph(child, node.sassFile)
		}
	}

	// return graph
	return ascensionGraph
}

class SassNode {

	constructor(sassFile, parent) {
		this.sassFile = sassFile
		this.children = []
		this.parent = parent
	}

	addChild(sassFile) {
		const child = new SassNode(sassFile, this)
		this.children.push(child)
		return child
	}

	get chain() {
		const c = [this.sassFile]
		let node = this
		while (node.parent && node.parent.sassFile) {
			c.push(node.parent.sassFile)
			node = node.parent
		}
		return c
	}

	find(sassFile) {
		if (this.sassFile === sassFile) return [this]
		else {
			for (const child of this.children) {
				const result = child.find(sassFile)
				if (result) return result
			}
		}
		return undefined
	}
}

/*

[
	{
		file: "...",
		children: []
	}
]

*/

module.exports = {
	render,
	compile,
	listChildren,
	makeAscensionGraph
}
