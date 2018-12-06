import React from 'react';
import ACNL from './acnl.js'

class EditorSwatchColor extends React.Component {
	constructor(props) {
		super(props);

		// for binding events to underlying html elements
		this.editorSwatchColor = React.createRef();
	}

	// event handlers do not have this context matched to the component instance
	// when using es6 classes
	onMouseMove(event) {
		// if holding down click and dragging, change color
		if (event.buttons === 1) {
			this.editorSwatchColor.current.click();
		}
	}

	render() {
		let isPicked = this.props.isPicked;
		let className = "swatch-color";
		if (isPicked) className += " picked";
		let backgroundColor = { backgroundColor : this.props.color };
		let onClick = this.props.onClick;

		return (
			<div
				ref = {this.editorSwatchColor}
				className = {className}
				style = {backgroundColor}
				onClick = {onClick}
				onMouseMove = {this.onMouseMove.bind(this)}
			>
			</div>
		);
	}
}

class EditorSwatch extends React.Component {
	renderColor(i) {
		let isPicked = (this.props.chosenColor === i)
		let binColor = this.props.swatch[i];
		let color = ACNL.paletteBinToHex[binColor];

		return (
			<EditorSwatchColor
				isPicked = {isPicked}
				color = {color}
				onClick = {() => this.props.onClick(i)}
			/>
		);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.chosenColor !== nextProps.chosenColor) return true;
		// check swatch
		for (let i = 0; i < 15; ++i) {
			if (this.props.swatch[i] !== nextProps.swatch[i]) return true;
		}

		return false;
	}

	render() {
		// console.log("rendered swatch");
		return (
			<div className="swatch">
		    <div className="swatch-color-row">
					{this.renderColor(0)}
					{this.renderColor(1)}
					{this.renderColor(2)}
		    </div>
		    <div className="swatch-color-row">
					{this.renderColor(3)}
					{this.renderColor(4)}
					{this.renderColor(5)}
		    </div>
		    <div className="swatch-color-row">
					{this.renderColor(6)}
					{this.renderColor(7)}
					{this.renderColor(8)}
		    </div>
		    <div className="swatch-color-row">
					{this.renderColor(9)}
					{this.renderColor(10)}
					{this.renderColor(11)}
		    </div>
		    <div className="swatch-color-row">
					{this.renderColor(12)}
					{this.renderColor(13)}
					{this.renderColor(14)}
		    </div>
		  </div>
		);
	}
}


export default EditorSwatch;
