import React from 'react';
import EditorCanvas from './EditorCanvas.jsx';
import EditorPalette from './EditorPalette.jsx';
import EditorSwatch from './EditorSwatch.jsx';
import EditorQrGenerator from './EditorQrGenerator.jsx';

// regular js imports
import ACNL from './acnl.js';

// control center for all editor things
// maintains control for drawing and data
// using async callback patterns (b/c setState is async)
class Editor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			acnl: new ACNL(),
 			chosenColor: 0,
			isDrawing: false,
			// buffers pixel operations for a SINGLE chosen color
			pixelBuffer: [],
			pixelRefreshTimer: null,
			// keep track of canvases so I can make later calls to their draws
			canvases: [
				React.createRef(),
				React.createRef(),
				React.createRef()
			],
			shouldQrCodeUpdate: false,
			qrRefreshTimer: null,
		};
	}

	// canvas will need this to draw and drag across and between multiple canvases
	setIsDrawing(isDrawing) {
		if (isDrawing !== this.state.isDrawing) {
			this.setState({
				isDrawing: isDrawing,
			});
		}
	}

	selectSwatchColor(newChosenColor) {
		// before switching colors, need to empty pixelBuffer
		// each pixelBuffer is specific to the chosen color
		// gotta make sure pixels in buffer are colored with old color, not new one
		this.refreshPixels(() => {
			let chosenColor = this.state.chosenColor;
			if (chosenColor !== newChosenColor) {
				// not setting Qr timer here, because just changing colors
				this.setState({
					chosenColor: newChosenColor,
					shouldQrCodeUpdate: false,
				});
			}
		});
	}

	// any time we make modifications to acnl data, need to reset qr timer
	selectPaletteColor(newBinColor){
		this.refreshPixels(() => {
			let acnl = this.state.acnl.clone();
			let chosenColor = this.state.chosenColor;
			let chosenBinColor = acnl.swatch[chosenColor];
			if (chosenBinColor !== newBinColor) {
				acnl.setSwatchColor(chosenColor, newBinColor);
				this.setState(
					{
						acnl: acnl,
						shouldQrCodeUpdate: false,
					},
					() => this.setQrCodeTimer()
				);
			}
		});
	}

	// store changes
	// need to guarantee a pixel refresh (complete update to ACNL file) sometime
	// support for multi-pixel drawing tools e.g. bucket, bigger pen sizes
	// by adding specific pixels
	updatePixelBuffer(x, y) {
		this.clearQrCodeTimer();

		// mousemove might be called "too quickly" and add the last pixel twice
		// do not handle duplicate pixels in the last pos of the buffer
		let pixelBuffer = this.state.pixelBuffer.slice();
		let pixelBufferLastIndex = pixelBuffer.length - 1;
		if (
			pixelBufferLastIndex < 0 ||
			x !== pixelBuffer[pixelBufferLastIndex][0] ||
			y !== pixelBuffer[pixelBufferLastIndex][1]
		) {
			this.clearPixelRefreshTimer();
			pixelBuffer.push([x, y]);
			let chosenColor = this.state.chosenColor;
			for (let i = 0; i < this.state.canvases.length; ++i) {
				this.state.canvases[i].current.updateContext();
				// losing context here, update context right before drawing
				// not much time spent updating context anyway
				// KEEP CONTEXT CACHED for full re-render speed
				this.state.canvases[i].current.drawPixel(x, y, chosenColor);
			}
			this.setPixelRefreshTimer();
			this.setState({
				pixelBuffer: pixelBuffer,
				shouldQrCodeUpdate: false,
			});
		}
	}

	// batch apply changes in pixel buffer
	refreshPixels(callback) {
		// e.g. selectPaletteColor & setSwatchColor, some don't need to set qr timer
		// callback needs to manually set qr timer (to prevent duplicate setTimers)
		this.clearQrCodeTimer();
		let pixelBuffer = this.state.pixelBuffer.slice();
		// if there's nothing in the buffer, no need to update
		if (pixelBuffer.length === 0) {
			if (callback) callback();
			return;
		}

		let acnl = this.state.acnl.clone();
		let chosenColor = this.state.chosenColor;
		for (let i = 0; i < pixelBuffer.length; ++i) {
			let x = pixelBuffer[i][0];
			let y = pixelBuffer[i][1];
			acnl.colorPixel(x, y, chosenColor);
		}

		// empty pixel buffer and update acnl
		this.setState(
			{
				acnl: acnl,
				pixelBuffer: [],
				shouldQrCodeUpdate: false,
			},
			() => {
				if (callback) callback();
			}
		);
	}

	clearPixelRefreshTimer() {
		// no need to check existence, since this will be called too many times
		window.clearTimeout(this.state.pixelRefreshTimer);
	}

	setPixelRefreshTimer() {
		let pixelRefreshTimer = window.setTimeout(() => {
			this.refreshPixels(() => {
				this.setQrCodeTimer()
			});
		}, 500);
		this.setState({
			pixelRefreshTimer: pixelRefreshTimer
		});
	}

	refreshQrCode() {
		this.setState({
			shouldQrCodeUpdate: true,
			pixelRefreshTimer: null
		});
		// console.log("trigger Qr refresh");
	}

	clearQrCodeTimer() {
		if (this.state.qrRefreshTimer) {
			window.clearTimeout(this.state.qrRefreshTimer);
			this.setState({
				qrRefreshTimer: null,
			});
		}
	}

	setQrCodeTimer() {
		let qrRefreshTimer = window.setTimeout(() => {
			this.refreshQrCode();
		}, 2500);
		this.setState({
			qrRefreshTimer: qrRefreshTimer,
		});
	}

	shouldComponentUpdate(nextProps, nextState) {
		// only update after refresh
		if (nextState.pixelBuffer.length === 0) return true;
		else return false;
	}

	render() {
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;
		let isDrawing = this.state.isDrawing;
		let canvases = this.state.canvases;
		let shouldQrCodeUpdate = this.state.shouldQrCodeUpdate;

		return (
			<div className="editor">
				<div id="canvas_editor">
					<EditorCanvas
						size = {64}
						zoom = {1}
						swatch = {acnl.swatch}
						patterns = {acnl.patterns}
						isProPattern = {acnl.isProPattern()}
						chosenColor = {chosenColor}
						isDrawing = {isDrawing}
						setIsDrawing = {this.setIsDrawing.bind(this)}
						updatePixelBuffer = {this.updatePixelBuffer.bind(this)}
						ref = {canvases[0]}
					/>

					<EditorCanvas
						size = {128}
						zoom = {2}
						swatch = {acnl.swatch}
						patterns = {acnl.patterns}
						isProPattern = {acnl.isProPattern()}
						chosenColor = {chosenColor}
						isDrawing = {isDrawing}
						setIsDrawing = {this.setIsDrawing.bind(this)}
						updatePixelBuffer = {this.updatePixelBuffer.bind(this)}
						ref = {canvases[1]}
					/>
				</div>

				<EditorCanvas
					size = {512}
					zoom = {5}
					swatch = {acnl.swatch}
					patterns = {acnl.patterns}
					isProPattern = {acnl.isProPattern()}
					chosenColor = {chosenColor}
					isDrawing = {isDrawing}
					setIsDrawing = {this.setIsDrawing.bind(this)}
					updatePixelBuffer = {this.updatePixelBuffer.bind(this)}
					ref = {canvases[2]}
				/>

				<EditorSwatch
					swatch = {acnl.swatch}
					chosenColor = {chosenColor}
					onClick = {this.selectSwatchColor.bind(this)}
				/>

				<EditorPalette
					chosenBinColor = {acnl.swatch[chosenColor]}
					onClick = {this.selectPaletteColor.bind(this)}
				/>

				<EditorQrGenerator
					data = {acnl.data}
					isProPattern = {acnl.isProPattern()}
					shouldQrCodeUpdate = {shouldQrCodeUpdate}
				/>
			</div>
		);
	}
}

export default Editor;
