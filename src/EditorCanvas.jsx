import React from 'react';

class EditorCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isDrawing: false
		}
	}


	render() {
		// fragmented (since there's no wrapper on the sibling elements)
		return [
				<div id="canvas_editor" key="1">
			    <canvas id="acnl_icon" width="64" height="64"></canvas>
					<canvas id="acnl_icon_zoom" width="128" height="128"></canvas>
			  </div>,
				<canvas id="acnl_icon_zoomier" width="512" height="512" key="2"></canvas>
		];
	}
}

export default EditorCanvas;
