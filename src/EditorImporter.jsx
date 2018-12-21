import React from 'react';
import qrcode from "./jsqrcode.js";

// handles all imports for the tool
// will do both qr detection and image conversion
class EditorImporter extends React.Component {
	constructor(props) {
		super(props);
		// reads qr code from image or loads .acnl file
		this.loader = React.createRef();
		// converts image to qr code
		this.converter = React.createRef();
		this.converterSetting = React.createRef();

		this.state = {
			loaderPart: 1,
			loaderData : "",
		}
	}

	onLoad() {
		let fileReader = new FileReader();
		// image of some kind (find the qr code in the image)
		if (/image./.test(this.loader.current.files[0].type)) {
			fileReader.onload = (event) => {
				qrcode.callback = (qrData) => {
					if (qrData.length < 0x21C) {
						window.alert(`Could not recognize QR code.\nQR Code too short: ${qrData.length}`);
					}
					
					// part of a pro pattern
					else if (qrData.length === 0x21C) {
						let loaderPart = this.state.loaderPart;
						let loaderData = this.state.loaderData.slice();
						loaderData += qrData;

						// last one, load it
						if (loaderPart === 4) {
							this.props.import(loaderData);
							
							// technically don't even need this since import will cause 
							// entire Editor to rerender
							this.setState({
								loaderPart: 1,
								loaderData: "",
							});
						}

						else {
							loaderPart += 1;
							this.setState({
								loaderPart: loaderPart,
								loaderData: loaderData,
							});

							// can't trigger click for next upload
							// chrome is blocking the qr code
							// tell user about next qr code
							window.alert(`Please add in the next QR code ${loaderPart}/4`);
						}
					}

					// regular pattern
					else if (qrData.length === 0x26C) {
						this.props.import(qrData);
					}
					
				};
				qrcode.decode(event.target.result);
			}
		 fileReader.readAsDataURL(this.loader.current.files[0]);
		}

		// acnl file type (already checks for valid extension and file name)
		// doesn't interfere with qr loading if you're interleaving import methods
		else if (/.\.acnl$/.test(this.loader.current.files[0].name)) {
			fileReader.onload = (event) => {
				this.props.import(event.target.result);
			};
			fileReader.readAsBinaryString(this.loader.current.files[0]);
		}

		// invalid file type
		else {
			window.alert("Chosen file was not valid.");
			// do nothing
		}

		// reset input so filename isn't logged into the input forever
		this.loader.current.value = "";
	}

	onConvert() {
		// only if import is an image
		if (/image./.test(this.converter.current.files[0].type)) {
			let fileReader = new FileReader();
			fileReader.onload = (event) => {
				let img = new Image();
				img.onload = () => {
					// using canvas to convert
					let canvasEle = document.createElement('canvas');
					canvasEle.width = 32;
					canvasEle.height = 32;
					
					let context = canvasEle.getContext("2d");

					// canvas will automatically scale image down for us to desired pixel grid
					context.drawImage(img, 0, 0, 32, 32);
					
					let imgData = context.getImageData(0, 0, 32, 32);

					let convSet = this.converterSetting.current.value;

					// determine conversion method, pass it up
					this.props.convert(imgData, convSet);
				};
				img.src = event.target.result;
			};
			fileReader.readAsDataURL(this.converter.current.files[0]);				
		}
		// reset input
		this.converter.current.value = "";
	}

	shouldComponentUpdate() {
		// no need to update
		return false;
	}

	render() {
		return (
			<div>
				<div>
					<span className="metadata-label">Load ACNL file or QR-image:</span>
					<input
						ref = {this.loader}
						type = "file"
						onChange = {this.onLoad.bind(this)}
					/>
				</div>

				<div>
					<span className="metadata-label">Convert Image</span>
					<input
						ref = {this.converter}
						type = "file"
						accept = "image*/"
						onChange = {this.onConvert.bind(this)}
					/>
					<select ref = {this.converterSetting} defaultValue = {"top"}>
						<option value="top">Use top 15 most-used nearest colors (ugly, fast)</option>
						<option value="lowest">Optimize out of top 40 most-used nearest colors (best, slow)</option>
						<option value="grey">Convert to greyscale (fast, pre-determined colors)</option>
						<option value="sepia">Convert to sepia (fast, pre-determined colors)</option>
					</select>
				</div>
			</div>
		);
	}
}

export default EditorImporter;
