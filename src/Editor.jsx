import React from 'react';
import EditorCanvas from './EditorCanvas.jsx';
import EditorPalette from './EditorPalette.jsx';
import EditorSwatch from './EditorSwatch.jsx';

// js imports
import ACNL from './ACNL.js';

// control center for all editor things
// maintains control for drawing and data
class Editor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
 			chosenColor: 0,
			chosenColorHex: "#FFFFFF",
		};
	}

	selectColorSwatch(index, colorHex) {
		if (this.state.chosenColorHex !== colorHex) {
			this.setState({
				chosenColor: index,
				chosenColorHex: colorHex
			});
		}
	}

	selectColorPalette(colorHex){
		if (this.state.chosenColorHex !== colorHex) {
			this.setState({
				chosenColorHex: colorHex,
			});

			// update QR code

		}
	}

	render() {
		return (
			<div className="editor">
				<EditorCanvas />

				<EditorSwatch
					chosenColor = {this.state.chosenColor}
					chosenColorHex = {this.state.chosenColorHex}
					onClick = {(index, color) => this.selectColorSwatch(index, color)}
				/>

				<EditorPalette
					chosenColorHex = {this.state.chosenColorHex}
					onClick = {(color) => this.selectColorPalette(color)}
				/>
			</div>
		);
	}
}

export default Editor;
