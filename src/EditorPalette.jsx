import React from 'react';
import ACNL from './acnl.js';

class EditorPaletteColor extends React.Component {
	constructor(props) {
		super(props);
		// for binding events to underlying html elements
		this.editorPaletteColor = React.createRef();
	}

	// event handlers do not have this context matched to the component instance
	// when using es6 classes
	onMouseMove(event) {
		// if holding down click and dragging, change color
		if (event.buttons === 1) {
			this.editorPaletteColor.current.click();
		}
	}

	render() {
		let isPicked = this.props.isPicked;
		let className = "palette-color";
		if (isPicked) className += " picked";
		let backgroundColor = { backgroundColor : this.props.color };
		let onClick = this.props.onClick;

		return (
			<div
				ref = {this.editorPaletteColor}
				className = {className}
				style = {backgroundColor}
				onClick = {onClick}
				onMouseMove = {this.onMouseMove.bind(this)}
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

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.chosenBinColor !== nextProps.chosenBinColor) return true;
		return false;
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
				<div className = "palette-color-block" key = {i.toString()}>
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
			<div className = "palette-color-row" key = {"10"}>
				{greyColors}
			</div>
		);
		colorBlocks.push(greyColorBlock);


		return (
			<div className="palette">{colorBlocks}</div>
		);
	}
}

export default EditorPalette;
