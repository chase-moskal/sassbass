
const psass = require("./psass")

async function main() {
	const dep = await psass.listRelevantPaths("test/src/test-importer.scss")
	console.log(dep)
}

main()
