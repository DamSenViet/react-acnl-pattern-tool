import React from 'react';
import ACNL from './acnl.js';

// NOTE THAT THIS CLASS WILL ATTEMPT TO SUPRESS UPDATES
// USING BUFFERS AND LOCAL CHANGES AND THEN DEFERRING THEM WHEN
// EDITOR IS FREE, ALLOWS FOR MORE MOUSEMOVE UPDATES FOR SMOOTH DRAWING

class EditorCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvas = React.createRef();

		let actualZoom;
		if (this.props.isProPattern) actualZoom = this.props.size / 64;
		else actualZoom = this.props.size / 32;

		// caching rect to prevent reflows and save cpu
		// stall out qr code for as long as possible
		this.state = {
			actualZoom: actualZoom,
			boundingClientRect: null,
			pixelBuffer: [],
			pixelRefreshTimer: null,
			isDrawing: false,
		};
	}

	preventRefresh() {
		window.clearTimeout(this.state.refreshTimer);
	}

	triggerPixelRefresh() {
		this.props.updatePixels(this.state.pixelBuffer);
		// clear buffer
		this.state.pixelBuffer = [];
	}

	updateBoundingClientRect(){
		let boundingClientRect = this.canvas.current.getBoundingClientRect();
		this.state.boundingClientRect = boundingClientRect;
	}

	draw(event) {
		let actualZoom = this.state.actualZoom;
		let boundingClientRect = this.state.boundingClientRect;
		let x = event.pageX - boundingClientRect.left - window.scrollX;
		let y = event.pageY - boundingClientRect.top - window.scrollY;

		x = Math.floor(x / actualZoom);
		y = Math.floor(y / actualZoom);

		// console.log(x, y);
		// make local changes only, update at a later time
		this.state.pixelBuffer.push([x, y]);
		let context = this.canvas.current.getContext("2d");
		this.drawPixel(context, x, y, this.props.chosenColor, actualZoom);
	}

	onMouseMove(event) {
		// browser will attempt to dump mousemove event before it completes
		// if handler is not fast enough, need to ensure speed, using buffers
		// and direct state changes instead of updates
		this.preventRefresh();
		if (this.state.isDrawing && event.buttons === 1) {
			this.draw(event);
		}
	}

	onMouseDown(event) {
		this.preventRefresh();
		this.state.isDrawing = true;
		// also do the onclick
		this.draw(event);
		// console.log("drawing");
	}

	onMouseUp(event) {
		this.triggerPixelRefresh();
		this.state.isDrawing = false;
		// console.log("not drawing");
	}

	drawPatterns() {
		// adjust zoom factor for pattern size
		let actualZoom = this.state.actualZoom;
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
		this.updateBoundingClientRect();
		// attaching event handlers
		window.addEventListener("scroll", this.updateBoundingClientRect.bind(this));
		window.addEventListener("resize", this.updateBoundingClientRect.bind(this));
	}

	componentDidUpdate() {
		this.drawPatterns();
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", this.updateBoundingClientRect.bind(this));
		window.removeEventListener("resize", this.updateBoundingClientRect.bind(this));
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
				onMouseDown = {this.onMouseDown.bind(this)}
				onMouseUp = {this.onMouseUp.bind(this)}
				onMouseMove = {this.onMouseMove.bind(this)}
			>
			</canvas>
		);
	}
}

export default EditorCanvas;
