
const yargs = require("yargs")
const {sassCompile, sassWatch} = require("./index")

const indir = yargs.argv.indir
const outdir = yargs.argv.outdir
const watch = yargs.argv.watch
const debug = yargs.argv.debug

if (!indir) throw new Error(`arg "indir" is required`)
if (!outdir) throw new Error(`arg "outdir" is required`)

if (watch) sassWatch({indir, outdir, debug})
else sassCompile({indir, outdir, debug})
