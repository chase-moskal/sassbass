#!/usr/bin/env node

const sassbass = require(".")
const yargs = require("yargs")

const indir = yargs.argv.indir
const outdir = yargs.argv.outdir
const watch = yargs.argv.watch
const sourceMap = yargs.argv.sourcemap

if (!indir) throw new Error(`arg "indir" is required`)
if (!outdir) throw new Error(`arg "outdir" is required`)

if (watch) sassbass.watchDirectory({indir, outdir, sourceMap})
else sassbass.compileDirectory({indir, outdir, sourceMap})
