import React from 'react';
// qrencode library
import qrencode from './qrcode.js';

class EditorQrCode extends React.Component {

	createQrCode(data, typeNumber, multipartNum, multipartTotal,
		multipartParity) {

		let qr = qrencode(typeNumber, "L", multipartNum, multipartTotal, multipartParity);
		qr.addData(data);
		qr.make();
		return qr;
	}

	// only re-render if user has attempted to update that section of the qr code
	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.data !== nextProps.data) return true;
		return false;
	}

	render() {
		// create QR code
		let data = this.props.data;
		let typeNumber = this.props.typeNumber;
		let multipartNum = this.props.multipartNum;
		let multipartTotal = this.props.multipartTotal;
		let multipartParity = this.props.multipartParity;

		let qr = this.createQrCode(data, typeNumber, multipartNum, multipartTotal,
			multipartParity);

		// console.log("rendered QR", multipartNum);
		return (
			<div
				dangerouslySetInnerHTML = {{__html: qr.createImgTag(5)}}
			>
			</div>
		);
	}
}

class EditorQrGenerator extends React.Component {
	// control update, only update qr code when told
	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.shouldQrCodeUpdate;
	}

	render() {
		// console.log("rendered QR code");
		let data = this.props.data;
		let isProPattern = this.props.isProPattern;
		let qrCodes = [];

		if (isProPattern) {
			// split data into parts
			for (let i = 0; i < 4; ++i) {
				qrCodes.push(
					<EditorQrCode
						data = {data.substr(0x21C * i, 0x21C)}
						typeNumber = {16}
						multipartNum = {i}
						multipartTotal = {3}
						multipartParity = {0x77}
						key = {i}
					/>
				);
			}
		}
		else {
			// use all of data
			qrCodes.push(
				<EditorQrCode
					data = {data}
					typeNumber = {17}
					key = {1}
				/>
			);
		}

		return (
			<div>{qrCodes}</div>
		);
	}
}

export default EditorQrGenerator;
