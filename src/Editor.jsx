import React from 'react';
import EditorCanvas from './EditorCanvas.jsx';
import EditorPalette from './EditorPalette.jsx';
import EditorSwatch from './EditorSwatch.jsx';
import EditorQRCode from './EditorQRCode.jsx';

// js imports
import ACNL from './acnl.js';

// control center for all editor things
// maintains control for drawing and data
class Editor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			acnl: new ACNL(),
 			chosenColor: 0,
			isDrawing: false,
			pixelBuffer: [],
			pixelRefreshTimer: null,
			canvases: [
				React.createRef(),
				React.createRef(),
				React.createRef()
			],
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

	// draw
	// need to implement additional tools (e.g. bigger drawing)
	colorPixel(x, y) {
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;
		if (acnl.colorPixel(x, y, chosenColor)) {
			this.setState({
				acnl: acnl,
			});
		}
	}

	// support for multi-pixel drawing tools e.g. bucket, bigger pen sizes
	colorPixels(coordinates) {
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;
		for (let i = 0; i < coordinates.length; ++i) {
			let x = coordinates[i][0];
			let y = coordinates[i][1];
			acnl.colorPixel(x, y, chosenColor);
		}
		this.setState({
			acnl: acnl,
		});
	}

	selectSwatchColor(newChosenColor) {
		let chosenColor = this.state.chosenColor;
		if (chosenColor !== newChosenColor) {
			this.setState({
				chosenColor: newChosenColor,
			});
		}
	}


	selectPaletteColor(newBinColor){
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;
		let chosenBinColor = acnl.swatch[chosenColor];
		if (chosenBinColor !== newBinColor) {
			acnl.setSwatchColor(chosenColor, newBinColor);
			this.setState({
				acnl: acnl,
			});
		}
	}

	// store changes
	// need to guarantee a pixel refresh (complete update to ACNL) sometime
	updatePixelBuffer(x, y, isTriggeringRefresh) {
		// console.log("cleared from update", this.state.pixelRefreshTimer);
		// if not setting timer, this will clear the last timer set
		window.clearTimeout(this.state.pixelRefreshTimer);

		// cannot slice buffer else race conditions occur
		// need to mutate :(
		let pixelBuffer = this.state.pixelBuffer.slice();
		pixelBuffer.push([x, y]);

		let chosenColor = this.state.chosenColor;
		for (let i = 0; i < this.state.canvases.length; ++i) {
			this.state.canvases[i].current.drawPixel(x, y, chosenColor);
		}

		// decide how to guarantee pixel refresh, timer or immediate
		if (!isTriggeringRefresh) {
			let pixelRefreshTimer = window.setTimeout(() => {
				// console.log("from timer", pixelRefreshTimer);
				this.triggerPixelRefresh();
			}, 500);
			// console.log("set timer", pixelRefreshTimer);
			this.setState({
				pixelBuffer: pixelBuffer,
				pixelRefreshTimer: pixelRefreshTimer,
			});
		}
		else {
			// setState supports callbacks
			// will guarantee latest pixelBuffer
			this.setState(
				{
					pixelBuffer: pixelBuffer,
				},
				() => this.triggerPixelRefresh()
			);
		}
	}

	// batch apply changes
	triggerPixelRefresh() {
		let pixelBuffer = this.state.pixelBuffer.slice();
		// console.log(pixelBuffer);
		this.colorPixels(pixelBuffer);
		this.setState({
			pixelBuffer: [],
		});
		// console.log("refreshed, synced");
	}

	shouldComponentUpdate(nextProps, nextState) {
		// only update allow update editor after refresh
		if (nextState.pixelBuffer.length === 0) return true;
		else return false;
	}

	render() {
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;
		let isDrawing = this.state.isDrawing;
		let canvases = this.state.canvases;

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
						triggerPixelRefresh = {this.triggerPixelRefresh.bind(this)}
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
						triggerPixelRefresh = {this.triggerPixelRefresh.bind(this)}
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
					triggerPixelRefresh = {this.triggerPixelRefresh.bind(this)}
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
				
			</div>
		);
	}
}

export default Editor;
