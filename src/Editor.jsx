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
		};
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

	render() {
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;
		let isDrawing = this.state.isDrawing;

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
						updatePixels = {this.colorPixels.bind(this)}
					/>

					<EditorCanvas
						size = {128}
						zoom = {2}
						swatch = {acnl.swatch}
						patterns = {acnl.patterns}
						isProPattern = {acnl.isProPattern()}
						chosenColor = {chosenColor}
						updatePixels = {this.colorPixels.bind(this)}
					/>

				</div>
				<EditorCanvas
					size = {512}
					zoom = {5}
					swatch = {acnl.swatch}
					patterns = {acnl.patterns}
					isProPattern = {acnl.isProPattern()}
					chosenColor = {chosenColor}
					updatePixels = {this.colorPixels.bind(this)}
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
