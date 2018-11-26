
![bass fish](https://upload.wikimedia.org/wikipedia/commons/c/c1/StripedBass.JPG)

&nbsp;&nbsp; *Bass picture from Wikimedia – By Tim Van Vliet – [en:Image:StripedBass.JPG](https://commons.wikimedia.org/w/index.php?curid=1420872), CC BY-SA 3.0*

# sassbass

sassbass compiles directories of SCSS files

1. **install sassbass**  
	`npm install --save-dev sassbass`

2. **use sassbass**  
	`sassbass --indir src --outdir dist`

	- watch mode  
		`sassbass --indir src --outdir dist --watch`

	- source maps  
		`sassbass --indir src --outdir dist --sourcemap`

	- watch mode with source maps  
		`sassbass --indir src --outdir dist --sourcemap --watch`

3. **node functions available**

	```js
	const sassbass = require("sassbass")

	async function main() {

		// compile directory of scss
		await sassbass.compileDirectory({
			indir: "src",
			outdir: "dist",
			sourceMap: true
		})

		// watch directory of scss
		const watchControl = await sassbass.watchDirectory({
			indir: "src",
			outdir: "dist",
			sourceMap: true
		})

		// stop watching
		watchControl.stop()
	}
	```
