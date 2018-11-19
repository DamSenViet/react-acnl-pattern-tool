import React from 'react';
import EditorCanvas from './EditorCanvas.jsx';
import EditorPalette from './EditorPalette.jsx';
import EditorSwatch from './EditorSwatch.jsx';

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

	selectSwatchColor(chosenColor) {
		let oldChosenColor = this.state.chosenColor;
		if (oldChosenColor !== chosenColor) {
			this.setState({
				chosenColor: chosenColor,
			});
		}
	}

	selectPaletteColor(colorHex){
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;
		if (acnl.getSwatch()[chosenColor] !== colorHex) {
			acnl.setSwatchColor(chosenColor, colorHex);
			this.setState({
				acnl: acnl,
			});
		}
	}

	render() {
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;

		return (
			<div className="editor">
				<EditorCanvas />

				<EditorSwatch
					swatch = {acnl.getSwatch()}
					chosenColor = {chosenColor}
					onClick = {this.selectSwatchColor.bind(this)}
				/>

				<EditorPalette
					chosenColorHex = {acnl.getSwatch()[chosenColor]}
					onClick = {this.selectPaletteColor.bind(this)}
				/>
			</div>
		);
	}
}

export default Editor;
