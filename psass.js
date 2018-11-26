
const sass = require("sass")
const path = require("path")
const fiber = require("fibers")
const shelljs = require("shelljs")
const fastGlob = require("fast-glob")

const toolbox = require("./toolbox")

/**
 * Render a single SCSS file
 * - can be used to compile, or to gather import dependencies
 */
async function render({file, outFile, sourceMap}) {
	return new Promise((resolve, reject) => {
		sass.render({
			file,
			fiber,
			outFile,
			sourceMap,
			sourceMapRoot: sourceMap
				? path.relative(path.dirname(outFile), path.dirname(file))
				: undefined,
			sourceMapContents: sourceMap
				? true
				: undefined,
		}, (error, result) => {
			if (error) reject(error)
			else resolve(result)
		})
	})
}

/**
 * Compile a single SCSS file
 * - parents (importers) of the file are not compiled
 */
async function compile({file, outFile, sourceMap}) {
	const startsWithUnderscore = /^_/i.test(path.basename(file))
	if (startsWithUnderscore && !sourceMap) return

	const result = await render({file, outFile, sourceMap})
	shelljs.mkdir("-p", path.parse(outFile).dir)

	const writes = []

	if (!startsWithUnderscore)
		writes.push(toolbox.writeFile(outFile, result.css))

	if (sourceMap)
		writes.push(toolbox.writeFile(`${outFile}.map`, result.map))

	await Promise.all(writes)
}

/**
 * List the children of an SCSS file
 * - results are relative from the provided directory
 */
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

/**
 * Read SCSS files and produce an ascension graph
 * - an ascension graph is an inverted dependency tree regarding SCSS imports
 * - an ascension graph relates SCSS imports with their parents
 * - an ascension graph is necessary for watch mode, to build upstream importers
 *   whenever a downstream SCSS file is changed
 */
async function makeAscensionGraph(directory) {

	// get all sass files
	const sassFiles = await fastGlob([`${directory}/**/*.scss`])

	// list of children for each file
	const childrenGraph = await Promise.all(
		sassFiles.map(async sassFile => {
			const children = await listChildren(sassFile, directory)
			return {sassFile, children}
		})
	)

	// ascension graph is like an inverted children graph,
	// it's a list of related parents for each child
	const ascensionGraph = []
	const addToAscensionGraph = (sassFile, relatedFile) => {
		const member = ascensionGraph.find(m => m.sassFile === sassFile)
		if (member) member.related.push(relatedFile)
		else ascensionGraph.push({
			sassFile,
			related: [relatedFile]
		})
	}

	// invert the children graph to produce the ascension graph
	for (const node of childrenGraph) {
		addToAscensionGraph(node.sassFile, node.sassFile)
		for (const child of node.children) {
			addToAscensionGraph(child, node.sassFile)
		}
	}

	// return graph
	return ascensionGraph
}

module.exports = {
	render,
	compile,
	makeAscensionGraph
}
