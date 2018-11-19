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
	onMouseOver(event) {
		if (event.buttons === 1) {
			this.editorSwatchColor.current.click();
		}
	}

	render() {
		const isPicked = this.props.isPicked;
		const className = (isPicked)? "col_block picked" : "col_block";

		const backgroundColor = { backgroundColor : this.props.color };
		const onClick = this.props.onClick;

		return (
			<div
				ref = {this.editorSwatchColor}
				className = {className}
				style = {backgroundColor}
				onClick = {onClick}
				onMouseOver = {this.onMouseOver.bind(this)}
			>
			</div>
		);
	}
}

class EditorSwatch extends React.Component {
	renderColor(i) {
		const isPicked = (this.props.chosenColor === i)
		const binColor = this.props.swatch[i];
		const color = ACNL.paletteBinToHex[binColor];

		return (
			<EditorSwatchColor
				isPicked = {isPicked}
				color = {color}
				onClick = {() => this.props.onClick(i)}
			/>
		);
	}

	render() {
		return (
			<div id="colors">
		    <div className="col_row">
					{this.renderColor(0)}
					{this.renderColor(1)}
					{this.renderColor(2)}
		    </div>
		    <div className="col_row">
					{this.renderColor(3)}
					{this.renderColor(4)}
					{this.renderColor(5)}
		    </div>
		    <div className="col_row">
					{this.renderColor(6)}
					{this.renderColor(7)}
					{this.renderColor(8)}
		    </div>
		    <div className="col_row">
					{this.renderColor(9)}
					{this.renderColor(10)}
					{this.renderColor(11)}
		    </div>
		    <div className="col_row">
					{this.renderColor(12)}
					{this.renderColor(13)}
					{this.renderColor(14)}
		    </div>
		  </div>
		);
	}
}


export default EditorSwatch;
