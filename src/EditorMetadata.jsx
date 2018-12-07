import React from 'react';
import EditorMetadataInput from './EditorMetadataInput.jsx';

class EditorMetadata extends React.Component {
	
	shouldComponentUpdate(nextProps, nextState) {
		if (
			this.props.patternTitle !== nextProps.patternTitle ||
			this.props.userName !== nextProps.userName ||
			this.props.userID !== nextProps.userID ||
			this.props.townName !== nextProps.townName ||
			this.props.townID !== nextProps.townID
		) return true;
		return false;
	}

	render() {
		return (
			<div className = "metadata-settings">
				<div>
					<span className="metadata-label">Title:</span>
					<EditorMetadataInput
						field = "pattern"
						fieldType = "text"
						data = {this.props.patternTitle}
						onUpdate = {this.props.updatePatternTitle.bind(this)}
					/>
				</div>

				<div>
					<span className="metadata-label">Creator:</span>
					<EditorMetadataInput
						field = "creator"
						fieldType = "text"
						data = {this.props.userName}
						onUpdate = {this.props.updateUserName.bind(this)}
					/>
					<EditorMetadataInput
						field = "creator"
						fieldType = "hex"
						data = {this.props.userID}
						onUpdate = {this.props.updateUserID.bind(this)}
					/>
				</div>
	
				<div>
					<span className="metadata-label">Town:</span>
					<EditorMetadataInput
						field = "town"
						fieldType = "text"
						data = {this.props.townName}
						onUpdate = {this.props.updateTownName.bind(this)}
					/>
					<EditorMetadataInput
						field = "town"
						fieldType = "hex"
						data = {this.props.townID}
						onUpdate = {this.props.updateTownID.bind(this)}
					/>
				</div>
			</div>
		);
	}
}

export default EditorMetadata;
