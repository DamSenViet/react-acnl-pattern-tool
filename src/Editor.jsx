import React from 'react';
import EditorCanvas from './EditorCanvas.jsx';
import EditorPalette from './EditorPalette.jsx';
import EditorSwatch from './EditorSwatch.jsx';


// control center for all editor things
class Editor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// maintains control of drawing
			chosenColor: 0,
			chosenColorHex: "#FFFFFF",
		};
	}

	render() {
		return (
			<div className="editor">
				<EditorCanvas />

				// swatch communicates in index (according to ACNL data layout)
				// hex communicates in hex color strings
				<EditorSwatch
					chosenColor = {this.state.chosenColor}
				/>
				<EditorPalette
					chosenColorHex = {this.state.chosenColorHex}
				/>
			</div>
		);
	}
}

export default Editor;
