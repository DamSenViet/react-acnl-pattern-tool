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
	renderColor(binColor) {
		let isPicked = this.props.chosenBinColor === binColor;
		let color = ACNL.paletteBinToHex[binColor];
		return (
			<EditorPaletteColor
				isPicked = {isPicked}
				color = {color}
				key = {binColor.toString()}
				onClick = {() => this.props.onClick(binColor)}
			/>
		);
	}

	render() {
		// PROCEDURALLY GENERATING PALETTE
		let colorBlocks = [];
		for (let i = 0x00; i < 0xFF; i+=0x10) {
			let colors = [];
			for (let j = 0x00; j < 0x09; j+=0x01) {
				colors.push(this.renderColor(i + j));
			}

			let colorBlock = (
				<div className = "col_pal_block" key = {i.toString()}>
					{colors}
				</div>
			);

			colorBlocks.push(colorBlock);
		}

		// grey row
		let greyColors = [];
		for (let i = 0x0F; i < 0xFF; i += 0x10) {
			greyColors.push(this.renderColor(i));
		}
		let greyColorBlock = (
			<div className = "col_pal_row" key = {"10"}>
				{greyColors}
			</div>
		);
		colorBlocks.push(greyColorBlock);


		return (
			<div id="color_pal">{colorBlocks}</div>
		);
	}
}

export default EditorPalette;
