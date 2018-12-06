import React from 'react';

class EditorMetadataInput extends React.Component {
	constructor(props) {
		super(props);
		this.input = React.createRef();
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.data !== nextProps.data) return true;
		return false;
	}

	limitCharacters () {
		let limit;

		// hex field
		if (this.props.fieldType === "hex") {
			limit = 4;
		}
		// name field
		else {
			if (this.props.field === "pattern") limit = 20;
			else limit = 10;
		}

		if (this.input.current.value.length > limit) {
			this.input.current.value = this.input.current.value.substr(0, limit);
		}
	}

	onChange(event) {
		this.limitCharacters();
		this.props.onUpdate(this.input.current.value);
	}

	render() {	
		let data = this.props.data;
		let className = "metadata-input";
		if (this.props.fieldType === "hex") className += " id";
		else {
			if (this.props.field === "pattern") className += " title";
			else className += " name";
		}

		return (
			// onChange triggers onInput in React,
			// React uses synthetic wrapper events
			<input
				ref = {this.input}
				className = {className}
				type = "text"
				value = {data}	
				onChange = {this.onChange.bind(this)}
			/>
		);
	}
}

export default EditorMetadataInput;
