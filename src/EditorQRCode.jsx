import React from 'react';
import qrcode from 'qrcode-generator';


class EditorQRCode extends React.Component {
	// control update, only update qr code when told to
	shouldComponentUpdate(nextProps, nextState) {
		// console.log(nextProps.shouldQRCodeUpdate);
		return nextProps.shouldQRCodeUpdate;
	}


	createQRCode(data) {
		for (let i = 2; i <= 40; ++i) {
			try {
				let qr = qrcode(i, "L");
				qr.addData(data);
				qr.make();
				return qr;
			}
			catch (error) {};
		}
	}

	render() {
		let data = this.props.data;
		let isProPattern = this.props.isProPattern;
		let patternImgs = [];

		if (isProPattern) {
			for (let i = 0x00; i < 0x870; i+= 0x21C) {
				let qr = this.createQRCode(data.substr(i, 0x21C));
				patternImgs.push(
					<div
						dangerouslySetInnerHTML = {{__html: qr.createImgTag(5)}}
						key = {i}
					>
					</div>
				);
			}
		}
		else {
			let qr = this.createQRCode(data);
			patternImgs.push(
				<div
					dangerouslySetInnerHTML = {{__html: qr.createImgTag(5)}}
					key = {1}
				>
				</div>
			);
		}

		return (
			<div>{patternImgs}</div>
		);
	}
}


export default EditorQRCode;
