import React from 'react';
import ACNL from './acnl.js';

class EditorPaletteColor extends React.Component {
	constructor(props) {
		super(props);
		this.editorPaletteColor = React.createRef();
	}

	onMouseOver(event) {
		if (event.buttons === 1) {
			this.editorPaletteColor.current.click();
		}
	}

	render() {
		const isPicked = this.props.isPicked;
		const className = (isPicked)? "col_pal picked" : "col_pal";
		const backgroundColor = { backgroundColor : this.props.color };
		const onClick = this.props.onClick;

		return (
			<div
				ref = {this.editorPaletteColor}
				className = {className}
				style = {backgroundColor}
				onClick = {onClick}
				onMouseOver = {this.onMouseOver.bind(this)}
			>
			</div>
		);
	}
}


class EditorPalette extends React.Component {
	// input (color) is a hex code used for mapping to ACNL file
	renderColor(isPicked, color) {
		return (
			<EditorPaletteColor
				isPicked = {isPicked}
				color = {color}
				key = {color}
				onClick = {() => this.props.onClick(color)}
			/>
		);
	}

	render() {
		// PROCEDURALLY GENERATING PALETTE
		let colorBlocks = [];
		for (let i = 0x00; i < 0xFF; i+=0x10) {
			let colorBlock = [];
			for (let j = 0x00; j < 0x09; j+=0x01) {
				let color = ACNL.paletteBinToHex[i + j];
				let isPicked = this.props.chosenColorHex === color;

				colorBlock.push(this.renderColor(isPicked, color));
			}

			colorBlocks.push(
				<div className = "col_pal_block" key = {i + ""}>
					{colorBlock}
				</div>
			);
		}

		// grey row
		let greyColorBlock = [];
		for (let i = 0x0F; i < 0xFF; i += 0x10) {
			let color = ACNL.paletteBinToHex[i];
			let isPicked = (this.props.chosenColorHex === color);
			greyColorBlock.push(this.renderColor(isPicked, color));
		}
		colorBlocks.push(
			<div className = "col_pal_row" key = {10 + ""}>
				{greyColorBlock}
			</div>
		);

		return (
			<div id="color_pal">{colorBlocks}</div>
		);
	}
}

export default EditorPalette;
