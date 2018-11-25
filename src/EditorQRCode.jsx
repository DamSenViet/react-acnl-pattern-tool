import React from 'react';
import thingy from './qrcode.js';


class EditorQRCode extends React.Component {
	createQRCode(data, typeNumber, multipartNum,
		multipartTotal, multipartParity) {

		let qr = thingy(typeNumber, "L", multipartNum, multipartTotal, multipartParity);
		qr.addData(data);
		qr.make();
		return qr;
	}

	// control update, only update qr code when told
	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.shouldQRCodeUpdate;
	}

	render() {
		// console.log("rendered QR code");
		let data = this.props.data;
		let isProPattern = this.props.isProPattern;
		let patternImgs = [];

		if (isProPattern) {
			for (let i = 0; i < 4; ++i) {
				let qr = this.createQRCode(data.substr(0x21C * i, 0x21C), 16, i, 3, 0x77);
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
			// use all of data
			let qr = this.createQRCode(data, 17);
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
