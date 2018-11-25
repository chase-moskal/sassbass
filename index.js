
const path = require("path")
const chokidar = require("chokidar")
const fastGlob = require("fast-glob")

const psass = require("./psass")
const toolbox = require("./toolbox")

async function compileDir({indir, outdir, debug}) {
	const sassFiles = await fastGlob([`${indir}/**/*.scss`])
	await Promise.all(sassFiles.map(sassFile =>
		psass.compile({
			file: sassFile,
			outFile: toolbox.rebasePath({
				path: sassFile,
				directory: indir,
				newDirectory: outdir
			}),
			sourceMap: debug
		})
	))
}

async function watchDir({indir, outdir, debug}) {
	const watcher = chokidar.watch(indir)
	watcher.on("all", async(event, sassFile) => {
		const endsWithScss = /\.scss$/i.test(sassFile)
		if (!endsWithScss) return

		const relevantPaths = await psass.listRelatedFiles(sassFile, indir)
		console.log("RELEVANT", relevantPaths)

		await Promise.all(relevantPaths.map(async file => {
			try {
				const outFile = toolbox.rebasePath({
					path: file,
					directory: indir,
					newDirectory: outdir
				})
				await psass.compile({
					file,
					outFile,
					sourceMap: debug
				})
				console.log(`scss compiled "${file}" to "${outFile}"`)
			}
			catch (error) {
				console.error(`scss error: ${error.message}`)
			}
		}))

		// const absolutePath = path.resolve(sassFile)

		// const outFile = toolbox.rebasePath({
		// 	path: sassFile,
		// 	directory: indir,
		// 	newDirectory: outdir
		// })

		// try {
		// 	await psass.compile({
		// 		file: sassFile,
		// 		outFile,
		// 		sourceMap: debug
		// 	})
		// 	console.log(`compiled "${sassFile}" to "${outFile}"`)
		// }
		// catch (error) {
		// 	console.error(`error compiling "${sassFile}" to "${outFile}": ${error.message}`)
		// }
	})
}

module.exports = {
	watchDir,
	compileDir
}
