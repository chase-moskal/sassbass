
const path = require("path")
const chokidar = require("chokidar")
const fastGlob = require("fast-glob")

const psass = require("./psass")

async function sassWatch({indir, outdir, debug}) {
	const watcher = chokidar.watch(indir)
	watcher.on("all", async(event, sassFile) => {
		const endsWithScss = /\.scss$/i.test(sassFile)
		const startsWithUnderscore = /^_/i.test(sassFile)
		if (!endsWithScss || startsWithUnderscore) return
		const output = indirToOutdir({indir, outdir, inpath: sassFile})
		try {
			await psass({
				input: sassFile,
				output,
				sourceMap: debug
			})
			console.log(`compiled "${sassFile}" to "${output}"`)
		}
		catch (error) {
			console.error(`error compiling "${sassFile}" to "${output}": ${error.message}`)
		}
	})
}

async function sassCompile({indir, outdir, debug}) {
	const sassFiles = await fastGlob([`${indir}/**/*.scss`])
	await Promise.all(sassFiles.map(sassFile => {
		const output = indirToOutdir({indir, outdir, inpath: sassFile})
		return psass({
			input: sassFile,
			output,
			sourceMap: debug
		})
	}))
}

function indirToOutdir({indir, outdir, inpath}) {
	const relative = path.relative(indir, inpath)
	const {dir, name} = path.parse(relative)
	const outpath = path.normalize(`${outdir}/${dir}/${name}.css`)
	return outpath
}

module.exports = {
	sassWatch,
	sassCompile
}
