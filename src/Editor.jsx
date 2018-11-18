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

	updateQRCode() {
		// updates QR code to match canvas contents
	}

	// swatch notifies of color switch
	selectColorSwatch(index, color) {
		// update chosen, that's it
		this.setState({
			chosenColor: index,
			chosenColorHex: color
		});
	}

	// palette notifies of color select
	selectColorPalette(color){
		// make swatch color match palette's selected
		// update QR code data (swatch)
		// trigger rerender of pattern
	}


	render() {
		return (
			<div className="editor">
				<EditorCanvas />

				<EditorSwatch
					chosenColor = {this.state.chosenColor}
					onClick = {(index, color) => this.selectColorSwatch(index, color)}
				/>
				<EditorPalette
					chosenColorHex = {this.state.chosenColorHex}
				/>
			</div>
		);
	}
}

export default Editor;
