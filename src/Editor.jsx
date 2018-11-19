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
		let chosenBinColor = acnl.getSwatch()[chosenColor];
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

		return (
			<div className="editor">
				<EditorCanvas />

				<EditorSwatch
					swatch = {acnl.getSwatch()}
					chosenColor = {chosenColor}
					onClick = {this.selectSwatchColor.bind(this)}
				/>

				<EditorPalette
					chosenBinColor = {acnl.getSwatch()[chosenColor]}
					onClick = {this.selectPaletteColor.bind(this)}
				/>
			</div>
		);
	}
}

export default Editor;
