
const chokidar = require("chokidar")
const fastGlob = require("fast-glob")

const psass = require("./psass")
const toolbox = require("./toolbox")

/**
 * Compile a directory of SCSS files into CSS files in another directory
 */
async function compileDirectory({indir, outdir, sourceMap}) {
	const sassFiles = await fastGlob([`${indir}/**/*.scss`])
	await Promise.all(sassFiles.map(sassFile =>
		psass.compile({
			file: sassFile,
			outFile: toolbox.rebasePath({
				path: sassFile,
				directory: indir,
				newDirectory: outdir
			}),
			sourceMap
		})
	))
}

/**
 * Watch a directory of SCSS files and output CSS files to another directory
 * - starts a watch process which cannot be stopped
 */
async function watchDirectory({indir, outdir, sourceMap}) {
	const watcher = chokidar.watch(indir)
	watcher.on("all", async(event, sassFile) => {
		const endsWithScss = /\.scss$/i.test(sassFile)
		if (!endsWithScss) return

		const ascensionGraph = await psass.makeAscensionGraph(indir)
		const ascensionMember = ascensionGraph.find(member => member.sassFile === sassFile)
		const affectedFiles = ascensionMember.related

		await Promise.all(affectedFiles.map(async file => {
			try {
				const outFile = toolbox.rebasePath({
					path: file,
					directory: indir,
					newDirectory: outdir
				})
				await psass.compile({file, outFile, sourceMap})
				console.log(`scss compiled "${file}" to "${outFile}"`)
			}
			catch (error) {
				console.error(`scss error: ${error.message}`)
			}
		}))
	})
}

module.exports = {
	watchDirectory,
	compileDirectory
}
