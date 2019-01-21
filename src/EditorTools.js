// this class represents the template for drawing tools
class EditorDrawingTool {
	/**
	 * takes in the clicked pixel coordinate and returns a list of other
	 * pixel coordinates to update pixelBuffer with
	 * @param {Number} x the x-coordinate of clicked pixel
	 * @param {Number} y the y-coordinate of clicked pixel
	 * @param {Number} pattern the pattern data
	 * @return {Array(pixels...[x, y])} the list of pixels to color in with the chosen color
	 */
	transform(x, y, pattern) {
		// pseudo-virtual function
		window.alert(
			this.constructor.name
			+ ".transform(x, y, pattern)"
			+ " has not been implemented."
		);
	}

	/**
	 * checks pixelBuffer and determines whether or not pixelBuffer should be
	 * updated with list of pixels passed by transform(x, y, pattern), used for
	 * optimization to reduce (not prevent) addition of duplicate pixels;
	 * can modify pixelsToAdd, but do not modify pixelBuffer
	 * @param {Array} pixelsToAdd pixel coordinates to add to pixelBuffer
	 * @param {Array} pixelBuffer contains pixel coordinates [x,y] to update file
	 * @return {Boolean} true if you plan on adding pixels to transform
	 */
	willUpdatePixelBuffer(pixelsToAdd, pixelBuffer) {
		// by default it returns true if you choose not to override
		return true;
	}
}

// prepackaged with tool, example of implementation
export class Pen extends EditorDrawingTool {
	transform(x, y, pattern) {
		return ([[x, y]]);
	}

	willUpdatePixelBuffer(pixelsToAdd, pixelBuffer) {
		let x = pixelsToAdd[0][0];
		let y = pixelsToAdd[0][1];
		let pixelBufferLastIndex = pixelBuffer.length - 1;
		// if last pixel in buffer doesn't match pixel we're adding
		// we're updating, prevent duplicate of last
		if (
			pixelBufferLastIndex < 0 ||
			x !== pixelBuffer[pixelBufferLastIndex][0] ||
			y !== pixelBuffer[pixelBufferLastIndex][1]
		) return true;
		// found a match in the last index
		return false;
	}
}

// add your other tools below, remember to EXPORT the class like the pen