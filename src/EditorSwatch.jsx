import React from 'react';

class EditorSwatchColor extends React.Component {
	render() {
		const isPicked = this.props.isPicked;
		const className = (isPicked)? "col_block picked" : "col_block";

		const backgroundColor = { backgroundColor : this.props.color };
		const onClick = this.props.onClick;

		return (
			<div
				className = {className}
				style = {backgroundColor}
				onClick = {onClick}
			>
			</div>
		);
	}
}

class EditorSwatch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			swatchColors: [
				"#FFFFFF",
				"#ECECEC",
				"#DADADA",
				"#C8C8C8",
				"#B6B6B6",
				"#A3A3A3",
				"#919191",
				"#7F7F7F",
				"#6D6D6D",
				"#5B5B5B",
				"#484848",
				"#363636",
				"#242424",
				"#121212",
				"#000000",
			],
		};
	}

	renderColor(i) {
		const color = this.state.swatchColors[i];
		const isPicked = (this.props.chosenColor === i);


		return (
			<EditorSwatchColor
				isPicked = {isPicked}
				color = {color}
				onClick = {() => this.props.onClick(i, color)}
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
