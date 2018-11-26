
const psass = require("./psass")

async function main() {
	const result = await psass.makeAscensionGraph("test/src")
	console.log(result)
}

main()
