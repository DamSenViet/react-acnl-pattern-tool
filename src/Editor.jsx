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

	selectColorSwatch(index, color) {
		this.setState({
			chosenColor: index,
			chosenColorHex: color
		});
	}

	selectColorPalette(color){
		this.setState({
			chosenColorHex: color,
		})
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
