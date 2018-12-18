import React from 'react';
import ACNL from './acnl.js';

// this component will attempt to supress updates to minimize full re-renders
class EditorCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvas = React.createRef();

		// not using state for these since these are technically static
		// to be updated as the DOM model updates/moves
		// cannot afford to be asynchronous, since these need to always be current
		// e.g. boundingClientRect or context
		// caching rect to prevent reflows and save cpu
		// also cache context for speed on full-redraws
		this.boundingClientRect = null;
		this.context = null;
	}

	updateContext() {
		let context = this.canvas.current.getContext("2d");
		this.context = context;
	}

	updateBoundingClientRect(){
		let boundingClientRect = this.canvas.current.getBoundingClientRect();
		this.boundingClientRect = boundingClientRect;
	}

	draw(event) {
		let actualZoom = this.props.actualZoom;
		let boundingClientRect = this.boundingClientRect;
		let x = event.pageX - boundingClientRect.left - window.scrollX;
		let y = event.pageY - boundingClientRect.top - window.scrollY;

		x = Math.floor(x / actualZoom);
		y = Math.floor(y / actualZoom);

		// browser will attempt to dump mousemove event before it completes
		// if handler is not fast enough, need to ensure speed, using buffers
		// updatePixelBuffer will command all canvases to draw the pixels too
		// console.log(x, y);
		this.props.updatePixelBuffer(x, y);
	}


	// occurs as the last event in a click-n-drag, if it completes
	// refresh, and kill timers to force refresh
	onClick(event) {
		// console.log("mouse click");
		this.draw(event);
	}

	onMouseDown(event) {
		this.props.setIsDrawing(true);
		// console.log("started drawing");
	}

	onMouseMove(event) {
		let isDrawing = this.props.isDrawing;
		if (isDrawing && event.buttons === 1) {
			this.draw(event);
		}
	}

	// WILL NOT TRIGGER IF MOUSEUP OUTSIDE OF CANVAS ELEMENTS
	// timer exists in the editor to force refresh
	// mouseup triggers before mouseclick
	onMouseUp(event) {
		// console.log("mouse up");
		this.props.setIsDrawing(false);
	}

	drawPatterns() {
		// adjust zoom factor for pattern size
		let patterns = this.props.patterns;
		for (let i = 0; i < patterns.length; ++i) {
				let pixelPair = patterns.charCodeAt(i);
				// get pixel binColors
				let firstColor = pixelPair & 0x0F;
				let secondColor = pixelPair >> 4;
				this.drawOffset(i * 2, firstColor);
				this.drawOffset(i * 2 + 1, secondColor);
		}
	}

	drawOffset(offset, chosenColor) {
		let x = (offset % 32);
		let y = Math.floor(offset / 32);
		this.drawPixel(x, y, chosenColor);
	}

	drawPixel(x, y, chosenColor) {
		let context = this.context;
		let zoom = this.props.actualZoom;

		if (y > 63) {
			y-= 64; x+= 32;
		}

		context.fillStyle = ACNL.paletteBinToHex[this.props.swatch[chosenColor]];
		context.fillRect(x * zoom, y * zoom, zoom, zoom);
		// draw the grid lines if zoom is large enough
		if (zoom > 5) {
			context.fillStyle = "#AAAAAA";
			context.fillRect(x * zoom + zoom - 1, y * zoom, 1, zoom);
			context.fillRect(x * zoom, y * zoom + zoom - 1, zoom, 1);
		}
	}

	// can't call draw inside render b/c on the first render
	// there's no reference to the actual node
	// create reference
	componentDidMount() {
		this.updateContext();
		this.updateBoundingClientRect();
		this.drawPatterns();
		// attaching event handlers
		window.addEventListener("scroll", this.updateBoundingClientRect.bind(this));
		window.addEventListener("resize", this.updateBoundingClientRect.bind(this));
	}

	// only fully re-render when pattern is updated or swatch colors change
	// only occurs after editor applies refresh changes
	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.patterns !== nextProps.patterns) return true;

		// manually check swatch b/c of object instance comparison
		// if swatch has changed, colors have changed
		// doesn't work for some reason, throwing error for context
		for (let i = 0; i < 15; ++i) {
			if (this.props.swatch[i] !== nextProps.swatch[i]) return true;
		}

		return false;
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// upon re-rendering, update the context and bounds since technically new
		// canvas, redraw patterns too
		this.updateContext();
		this.updateBoundingClientRect();
		this.drawPatterns();
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", this.updateBoundingClientRect.bind(this));
		window.removeEventListener("resize", this.updateBoundingClientRect.bind(this));
	}

	render() {
		// console.log("rendered canvas");
		let size = this.props.size;
		let canvasNumber = this.props.canvasNumber;

		let className = "canvas";
		if (canvasNumber === 0) void(0);
		else if (canvasNumber === 1) className += "-zoom";
		else if (canvasNumber === 2) className += "-zoomier";

		return (
			<canvas
				className = {className}
				width = {size}
				height = {size}
				onClick = {this.onClick.bind(this)}
				onMouseDown = {this.onMouseDown.bind(this)}
				onMouseMove = {this.onMouseMove.bind(this)}
				onMouseUp = {this.onMouseUp.bind(this)}
				ref = {this.canvas}
			>
			</canvas>
		);
	}
}

export default EditorCanvas;
