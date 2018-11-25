#!/usr/bin/env node

const yargs = require("yargs")
const {compileDir, watchDir} = require("./index")

const indir = yargs.argv.indir
const outdir = yargs.argv.outdir
const watch = yargs.argv.watch
const debug = yargs.argv.debug

if (!indir) throw new Error(`arg "indir" is required`)
if (!outdir) throw new Error(`arg "outdir" is required`)

if (watch) watchDir({indir, outdir, debug})
else compileDir({indir, outdir, debug})
