const getPixels = require("get-pixels")
const { extractColors } = require("extract-colors")
const ProxyService = require('./imgproxy.cjs')

function getSplash(c) {
	const fp = JSON.parse(c.focalPoint)
	const path = "/characters/" + c.game + "/" + c.id + "/gachaSplash.webp";
	return ProxyService.getImage(path, [{ key: "gravity", params: ["fp", fp[0], fp[1]] }, { key: "crop", params: ["1000", "1000"] }], 'png');
}

function getColors(c) {
	const options = {
		pixels: 100000,
		distance: 0.18,
		saturationDistance: 0.2,
		colorValidator: (red, green, blue, alpha = 255) => !(isGraytone(red, green, blue)) && alpha > 250,
		lightnessDistance: 0.2,
		hueDistance: 0.083
	}

	getPixels(getSplash(c), (err, pixels) => {
		if (!err) {
			const data = [...pixels.data]
			const [width, height] = pixels.shape

			extractColors({ data, width, height }, options)
				.then(col => {
					return {
						colors: col.sort((a, b) => (b.area - a.area))
					}
				}).catch(console.log)
		}
	})
}


function isGraytone(r, g, b) {
	if ((r == g && r == b && r == 0) || (r + g + b) < 20) {
		return true
	} else {
		const mean = (r + g + b) / 3
		const sum2diff = (r - mean) ** 2 + (g - mean) ** 2 + (b - mean) ** 2
		const variance = sum2diff / 3
		const standDev = Math.sqrt(variance)
		return standDev / mean <= 0.05
	}
}


modules.exports = {
	id: 'operation-extract-colors',
	handler: ({ character }) => {
		return {
			data: getColors(character)
		}
	},
};
