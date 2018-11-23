import React from 'react';
import ACNL from './acnl.js';

// tools go with canvas
class EditorCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvas = React.createRef();
	}

	draw(event) {
		let size = this.props.size;

		let actualZoom;
		if (this.props.isProPattern) actualZoom = size / 64;
		else actualZoom = size / 32;

		let bounds = this.canvas.current.getBoundingClientRect();
		let x = event.pageX - bounds.left;
		let y = event.pageY - bounds.top;

		x = Math.floor(x / actualZoom);
		y = Math.floor(y / actualZoom);

		// console.log(x, y);
		this.props.onClick(x, y);
	}

	onClick(event) {
		// canvas size
		this.draw(event);
	}

	onMouseMove(event) {
		if (this.props.isDrawing) {
			this.draw(event);
		}
	}

	onMouseDown(event) {
		this.props.setDrawing(true);
		// console.log("drawing");
	}

	onMouseUp(event) {
		this.props.setDrawing(false);
		// console.log("not drawing");
	}

	drawPatterns() {
		let size = this.props.size;
		// adjust zoom factor for pattern size
		let actualZoom;
		if (this.props.isProPattern) actualZoom = size / 64;
		else actualZoom = size / 32;

		let context = this.canvas.current.getContext("2d");
		let patterns = this.props.patterns;
		for (let i = 0; i < patterns.length; ++i) {
				let pixelPair = patterns.charCodeAt(i);
				// get pixel binColors
				let firstColor = pixelPair & 0x0F;
				let secondColor = pixelPair >> 4;
				this.drawOffset(context, i * 2, firstColor, actualZoom);
				this.drawOffset(context, i * 2 + 1, secondColor, actualZoom);
		}
	}

	drawOffset(context, offset, chosenColor, zoom) {
		let x = (offset % 32);
		let y = Math.floor(offset / 32);
		this.drawPixel(context, x, y, chosenColor, zoom);
	}

	drawPixel(context, x, y, chosenColor, zoom) {
		if (y > 63) {
			y-= 64; x+= 32;
		}

		try {
			context.fillStyle = ACNL.paletteBinToHex[this.props.swatch[chosenColor]];
			context.fillRect(x * zoom, y * zoom, zoom, zoom);

			if (zoom > 5) {
				context.fillStyle = "#AAAAAA";
				context.fillRect(x * zoom + zoom - 1, y * zoom, 1, zoom);
				context.fillRect(x * zoom, y * zoom + zoom - 1, zoom, 1);
			}
		} catch(e) {};
	}

	// can't call draw inside render b/c on the first render
	// there's no reference to the actual node
	componentDidMount() {
		this.drawPatterns();
	}
	componentDidUpdate() {
		this.drawPatterns();
	}

	render() {
		let size = this.props.size;
		let zoom = this.props.zoom;

		let id = "acnl_icon";
		if (zoom === 2) id += "_zoom";
		else if (zoom === 5) id += "_zoomier";

		// fragmented (since there's no wrapper on the sibling elements)
		return (
			<canvas
				ref = {this.canvas}
				id = {id}
				width = {size}
				height = {size}
				onClick = {this.onClick.bind(this)}
				onMouseDown = {this.onMouseDown.bind(this)}
				onMouseUp = {this.onMouseUp.bind(this)}
				onMouseMove = {this.onMouseMove.bind(this)}
			>
			</canvas>
		);
	}
}

export default EditorCanvas;
