import React from 'react';
import EditorCanvas from './EditorCanvas.jsx';
import EditorPalette from './EditorPalette.jsx';
import EditorSwatch from './EditorSwatch.jsx';
import EditorMetadata from './EditorMetadata.jsx';
import EditorImporter from './EditorImporter.jsx';
import EditorQrGenerator from './EditorQrGenerator.jsx';
import * as EditorTools from './EditorTools.js';

// regular js imports
import ACNL from './acnl.js';

// control center for all editor things
// maintains control for drawing and data
// using async callback patterns (b/c setState is async)
class Editor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			acnl: new ACNL(),
			chosenColor: 0,
			chosenTool: new EditorTools.Pen(),
			isDrawing: false,
			// buffers pixel operations for a SINGLE chosen color
			pixelBuffer: [],
			pixelRefreshTimer: null,
			// keep track of canvases so I can make later calls to their draws
			canvases: [
				React.createRef(),
				React.createRef(),
				React.createRef()
			],
			shouldQrCodeUpdate: false,
			qrRefreshTimer: null,
		};
	}

	// canvas will need this to draw and drag across and between multiple canvases
	setIsDrawing(isDrawing) {
		if (isDrawing !== this.state.isDrawing) {
			this.setState({
				isDrawing: isDrawing,
			});
		}
	}

	selectSwatchColor(newChosenColor) {
		// before switching colors, need to empty pixelBuffer
		// each pixelBuffer is specific to the chosen color
		// gotta make sure pixels in buffer are colored with old color, not new one
		this.refreshPixels(() => {
			let chosenColor = this.state.chosenColor;
			if (chosenColor !== newChosenColor) {
				// not setting Qr timer here, because just changing colors
				this.setState({
					chosenColor: newChosenColor,
					shouldQrCodeUpdate: false,
				});
			}
		});
	}

	// any time we make modifications to acnl data, need to reset qr timer
	selectPaletteColor(newBinColor) {
		this.refreshPixels(() => {
			let acnl = this.state.acnl.clone();
			let chosenColor = this.state.chosenColor;
			let chosenBinColor = acnl.swatch[chosenColor];
			if (chosenBinColor !== newBinColor) {
				acnl.setSwatchColor(chosenColor, newBinColor);
				this.setState(
					{
						acnl: acnl,
						shouldQrCodeUpdate: false,
					},
					() => this.setQrCodeTimer()
				);
			}
		});
	}

	// store changes
	// need to guarantee a pixel refresh (complete update to ACNL file) sometime
	// support for multi-pixel drawing tools e.g. bucket, bigger pen sizes
	// by adding specific pixels
	updatePixelBuffer(pixelsToAdd) {
		this.clearQrCodeTimer();

		// mousemove might be called "too quickly" and add the last pixel twice
		// do not handle duplicate pixels in the last pos of the buffer
		let pixelBuffer = this.state.pixelBuffer.slice();
		let chosenTool = this.state.chosenTool;
		if (chosenTool.willUpdatePixelBuffer(pixelsToAdd, pixelBuffer)) {
			this.clearPixelRefreshTimer();
			let chosenColor = this.state.chosenColor;

			// update context before performing operations
			for (let i = 0; i < this.state.canvases.length; ++i) {
				this.state.canvases.forEach(ref => {
					// KEEP CONTEXT CACHED for full re-render speed
					// losing context here, update context right before drawing
					// not much time spent updating context anyway
					ref.current.updateContext();
				});
			}

			// add each pixel to the buffer and color it in
			for (let i = 0; i < pixelsToAdd.length; ++i) {
				let pixel = pixelsToAdd[i];
				let x = pixel[0];
				let y = pixel[1];
				pixelBuffer.push([x, y]);
				for (let i = 0; i < this.state.canvases.length; ++i) {
					this.state.canvases[i].current.drawPixel(x, y, chosenColor);
				}
			}

			this.setState(
				{
					pixelBuffer: pixelBuffer,
					shouldQrCodeUpdate: false,
				},
				() => this.setPixelRefreshTimer()
			);
		}
	}

	// batch apply changes in pixel buffer
	refreshPixels(callback) {
		// e.g. selectPaletteColor & setSwatchColor, some don't need to set qr timer
		// callback needs to manually set qr timer (to prevent duplicate setTimers)
		this.clearQrCodeTimer();
		let pixelBuffer = this.state.pixelBuffer.slice();
		// if there's nothing in the buffer, no need to update
		if (pixelBuffer.length === 0) {
			if (callback) callback();
			return;
		}

		let acnl = this.state.acnl.clone();
		let chosenColor = this.state.chosenColor;
		for (let i = 0; i < pixelBuffer.length; ++i) {
			let x = pixelBuffer[i][0];
			let y = pixelBuffer[i][1];
			acnl.colorPixel(x, y, chosenColor);
		}

		// empty pixel buffer and update acnl
		this.setState(
			{
				acnl: acnl,
				pixelBuffer: [],
				shouldQrCodeUpdate: false,
			},
			() => {
				if (callback) callback();
			}
		);
	}

	clearPixelRefreshTimer() {
		// no need to check existence, since this will be called too many times
		window.clearTimeout(this.state.pixelRefreshTimer);
	}

	setPixelRefreshTimer() {
		let pixelRefreshTimer = window.setTimeout(() => {
			this.refreshPixels(() => {
				this.setQrCodeTimer()
			});
		}, 500);
		this.setState({
			pixelRefreshTimer: pixelRefreshTimer
		});
	}

	refreshQrCode() {
		this.setState({
			shouldQrCodeUpdate: true,
			pixelRefreshTimer: null
		});
		// console.log("trigger Qr refresh");
	}

	clearQrCodeTimer() {
		if (this.state.qrRefreshTimer) {
			window.clearTimeout(this.state.qrRefreshTimer);
			this.setState({
				qrRefreshTimer: null,
			});
		}
	}

	setQrCodeTimer() {
		let qrRefreshTimer = window.setTimeout(() => {
			this.refreshQrCode();
		}, 2500);
		this.setState({
			qrRefreshTimer: qrRefreshTimer,
		});
	}


	// deal with metadata

	updatePatternTitle(title) {
		this.clearQrCodeTimer();

		let acnl = this.state.acnl.clone();
		if (acnl.patternTitle !== title) {
			acnl.patternTitle = title;
			this.setState(
				{
					acnl: acnl,
					shouldQrCodeUpdate: false,
				},
				() => this.setQrCodeTimer()
			);
		}
	}

	updateUserName(name) {
		this.clearQrCodeTimer();

		let acnl = this.state.acnl.clone();
		if (acnl.userName !== name) {
			acnl.userName = name;
			this.setState(
				{
					acnl: acnl,
					shouldQrCodeUpdate: false,
				},
				() => this.setQrCodeTimer()
			);
		}
	}

	updateUserID(id) {
		this.clearQrCodeTimer();

		let acnl = this.state.acnl.clone();
		if (acnl.userID !== id) {
			acnl.userID = id;
			this.setState(
				{
					acnl: acnl,
					shouldQrCodeUpdate: false,
				},
				() => this.setQrCodeTimer()
			);
		}
	}

	updateTownName(name) {
		this.clearQrCodeTimer();

		let acnl = this.state.acnl.clone();
		if (acnl.townName !== name) {
			acnl.townName = name;
			this.setState(
				{
					acnl: acnl,
					shouldQrCodeUpdate: false,
				},
				() => this.setQrCodeTimer()
			);
		}
	}

	updateTownID(id) {
		this.clearQrCodeTimer();

		let acnl = this.state.acnl.clone();
		if (acnl.townID !== id) {
			acnl.townID = id;
			this.setState(
				{
					acnl: acnl,
					pixelRefreshTimer: null,
					shouldQrCodeUpdate: false,
				},
				() => this.setQrCodeTimer()
			);
		}
	}

	// replace entire acnl and state
	import(acnlData) {
		this.clearPixelRefreshTimer();
		this.clearQrCodeTimer();
		this.setState(
			{
				acnl: new ACNL(acnlData),
				chosenColor: 0,
				isDrawing: false,
				pixelBuffer: [],
				pixelRefreshTimer: null,
				shouldQrCodeUpdate: false,
				qrRefreshTimer: null,
			},
			() => this.setQrCodeTimer()
		);
	}


	// perform import and convert according to setting
	// we are just replacing the swatch, pattern data
	convert(imgData, convSet) {
		this.clearPixelRefreshTimer();
		this.clearQrCodeTimer();

		let acnl = this.state.acnl.clone();
		// turn into a standard pattern
		acnl.toStandardPattern();

		// select the palette
		if (convSet === "top") this.usePaletteTop(acnl, imgData);
		else if (convSet === "lowest") this.usePaletteLowest(acnl, imgData);
		else if (convSet === "grey") this.usePaletteGrey(acnl);
		else if (convSet === "sepia") this.usePaletteSepia(acnl);

		this.drawImage(acnl, imgData);

		this.setState(
			{
				acnl: acnl,
				chosenColor: 0,
				isDrawing: false,
				pixelBuffer: [],
				pixelRefreshTimer: null,
				shouldQrCodeUpdate: false,
				qrRefreshTimer: null,
			},
			() => this.setQrCodeTimer()
		);
	}

	/* CONVERT HELPER START */
	// pick palette from 15 most used, inaccurate
	usePaletteTop(acnl, imgData) {
		let palette = [];
		for (let i = 0; i < 256; ++i) {
			palette.push({
				binColor: i,
				score: 0,
			});
		}

		let scorePaletteColor = (r, g, b) => {
			let best = 120;
			let bestPaletteColor = 0;
			for (let i = 0; i < 256; i++) {
				let toMatch = ACNL.paletteBinToHex[i];
				if (toMatch === undefined) continue;
				let x = parseInt(toMatch.substr(1, 2), 16);
				let y = parseInt(toMatch.substr(3, 2), 16);
				let z = parseInt(toMatch.substr(5, 2), 16);
				let matchDegree = Math.abs(x - r) + Math.abs(y - g) + Math.abs(z - b);
				if (matchDegree < best) {
					best = matchDegree;
					bestPaletteColor = i;
				}
			}
			// increment score for its occurence
			palette[bestPaletteColor].score++;
		}

		// accumulate scores
		for (let i = 0; i < 4096; i += 4) {
			scorePaletteColor(
				imgData.data[i],
				imgData.data[i + 1],
				imgData.data[i + 2]
			);
		}

		// sort by palette occurences, decreasing order
		palette.sort((a, b) => {
			if (a.score > b.score) return -1;
			if (a.score < b.score) return 1;
			return 0;
		});

		// rebinding, cut the palette, leaving only binColors
		let swatchBinColors = palette.slice(0, 15)
			.map((palObj) => palObj.binColor);

		for (let i = 0; i < swatchBinColors.length; ++i) {
			acnl.setSwatchColor(i, swatchBinColors[i]);
		}
	}

	// choosing palette from top 40 colors, accurate
	usePaletteLowest(acnl, imgData) {
		let palette = [];
		let prepixels = [];
		for (let i = 0; i < 256; ++i) {
			palette.push({
				binColor: i,
				score: 0,
			});
		}

		let scorePalette = (pixel, r, g, b) => {
			let matches = {};
			let best = 120;
			let bestPaletteColor = 0;
			for (let i = 0; i < 256; ++i) {
				let toMatch = ACNL.paletteBinToHex[i];
				if (toMatch === undefined) continue;
				let x = parseInt(toMatch.substr(1, 2), 16);
				let y = parseInt(toMatch.substr(3, 2), 16);
				let z = parseInt(toMatch.substr(5, 2), 16);
				let matchDegree = Math.abs(x - r) + Math.abs(y - g) + Math.abs(z - b);
				if (matchDegree < best) {
					best = matchDegree;
					bestPaletteColor = i;
				}
				if (matchDegree < 120) {
					matches[i.toString()] = matchDegree;
				}
			}
			palette[bestPaletteColor].score++;
			prepixels[pixel] = matches;
		}

		for (let i = 0; i < 4096; i += 4) {
			scorePalette(
				i / 4,
				imgData.data[i],
				imgData.data[i + 1],
				imgData.data[i + 2]
			);
		}

		// sort by to decreasing score
		palette.sort((a, b) => {
			if (a.score > b.score) return -1;
			if (a.score < b.score) return 1;
			return 0;
		});

		palette = palette.slice(0, 40);
		let bestBinColors = [];
		let bestScore = 0x200000; // can always do better than this

		// not using alert here, prevent alert from blocking thread
		console.log("optimizing color palette...");
		for (let i = 0; i < 4000 && palette.length > 16; ++i) {
			let chosenBinColors = [];

			// pick random colors out of top 40
			while (chosenBinColors.length < 15 && chosenBinColors < palette.length) {
				let next = palette[Math.floor(Math.random() * palette.length)].binColor;
				if (chosenBinColors.includes(next)) continue;
				chosenBinColors.push(next);
			}

			// score random selection
			let currentScore = 0;

			// stop at first score that meets the criteria
			for (let pixel in prepixels) {
				let lowPixel = 750;
				for (let m in prepixels[pixel]) {
					if (!chosenBinColors.includes(parseInt(m))) continue;
					if (prepixels[pixel][m] < lowPixel) {
						lowPixel = prepixels[pixel][m];
					}
				}
				currentScore += lowPixel;
				if (currentScore >= bestScore) break;
			}

			if (currentScore < bestScore) {
				bestScore = currentScore;
				bestBinColors = chosenBinColors;
			}
		}

		for (let i = 0; i < 15 && i < bestBinColors.length; ++i) {
			acnl.setSwatchColor(i, bestBinColors[i]);
		}
	}

	usePaletteGrey(acnl) {
		for (let i = 0; i < 15; i++) {
			acnl.setSwatchColor(i, 0x10 * i + 0xF);
		}
	}

	usePaletteSepia(acnl) {
		for (let i = 0; i < 9; i++) {
			acnl.setSwatchColor(i, 0x30 + i);
		}
		for (let i = 9; i < 15; i++) {
			acnl.setSwatchColor(i, 0x60 + i - 6);
		}
	}


	// AKA previously "recolorize"
	// draw image onto pattern based on palette
	drawImage(acnl, imgData) {
		// for a given rgb color, find the closest matching color in the swatch
		let matchedSwatchColor = (r, g, b) => {
			let best = 255 * 3;
			let bestSwatchColor = 0;
			for (let i = 0; i < 15; ++i) {
				let swatchColor = acnl.getSwatchColor(i);
				let toMatch = ACNL.paletteBinToHex[swatchColor];
				let x = parseInt(toMatch.substr(1, 2), 16);
				let y = parseInt(toMatch.substr(3, 2), 16);
				let z = parseInt(toMatch.substr(5, 2), 16);
				let matchDegree = Math.abs(x - r) + Math.abs(y - g) + Math.abs(z - b);
				if (matchDegree < best) {
					best = matchDegree;
					bestSwatchColor = i;
				}
			}
			return bestSwatchColor;
		}

		for (let i = 0; i < 4096; i += 4) {
			let x = Math.floor(i / 4) % 32;
			let y = Math.floor(Math.floor(i / 4) / 32);
			acnl.colorPixel(x, y, matchedSwatchColor(
				imgData.data[i],
				imgData.data[i + 1],
				imgData.data[i + 2]
			));
		}
	}
	/* CONVERT HELPER END */

	shouldComponentUpdate(nextProps, nextState) {
		// only render after refreshing pixels
		if (nextState.pixelBuffer.length === 0) return true;
		else return false;
	}

	render() {
		let acnl = this.state.acnl;
		let chosenColor = this.state.chosenColor;
		let chosenTool = this.state.chosenTool;
		let isDrawing = this.state.isDrawing;
		let canvases = this.state.canvases;
		let canvasSizes = [64, 128, 512];
		// perform actualZoom calculations
		let actualZooms = canvasSizes.map((size) => {
			if (acnl.isProPattern()) return size / 64;
			else return size / 32;
		});
		let shouldQrCodeUpdate = this.state.shouldQrCodeUpdate;


		return (
			<div className="editor">
				<div className="canvas-container">
					<EditorCanvas
						size={128}
						canvasNumber={1}
						actualZoom={actualZooms[1]}
						swatch={acnl.swatch}
						patterns={acnl.patterns}
						isProPattern={acnl.isProPattern()}
						chosenColor={chosenColor}
						chosenTool={chosenTool}
						isDrawing={isDrawing}
						setIsDrawing={this.setIsDrawing.bind(this)}
						updatePixelBuffer={this.updatePixelBuffer.bind(this)}
						ref={canvases[1]}
					/>

					<EditorCanvas
						size={64}
						canvasNumber={0}
						actualZoom={actualZooms[0]}
						swatch={acnl.swatch}
						patterns={acnl.patterns}
						isProPattern={acnl.isProPattern()}
						chosenColor={chosenColor}
						chosenTool={chosenTool}
						isDrawing={isDrawing}
						setIsDrawing={this.setIsDrawing.bind(this)}
						updatePixelBuffer={this.updatePixelBuffer.bind(this)}
						ref={canvases[0]}
					/>

				</div>

				<EditorCanvas
					size={512}
					canvasNumber={2}
					actualZoom={actualZooms[2]}
					swatch={acnl.swatch}
					patterns={acnl.patterns}
					isProPattern={acnl.isProPattern()}
					chosenColor={chosenColor}
					chosenTool={chosenTool}
					isDrawing={isDrawing}
					setIsDrawing={this.setIsDrawing.bind(this)}
					updatePixelBuffer={this.updatePixelBuffer.bind(this)}
					ref={canvases[2]}
				/>

			<div class="color-tools">
					<EditorPalette
						chosenBinColor={acnl.swatch[chosenColor]}
						onClick={this.selectPaletteColor.bind(this)}
					/>

					<EditorSwatch
						swatch={acnl.swatch}
						chosenColor={chosenColor}
						onClick={this.selectSwatchColor.bind(this)}
					/>
			</div>


				<EditorMetadata
					patternTitle={acnl.patternTitle}
					userName={acnl.userName}
					userID={acnl.userID}
					townName={acnl.townName}
					townID={acnl.townID}

					updatePatternTitle={this.updatePatternTitle.bind(this)}
					updateUserName={this.updateUserName.bind(this)}
					updateUserID={this.updateUserID.bind(this)}
					updateTownName={this.updateTownName.bind(this)}
					updateTownID={this.updateTownID.bind(this)}
				/>

				<EditorImporter
					import={this.import.bind(this)}
					convert={this.convert.bind(this)}
				/>

				<EditorQrGenerator
					data={acnl.data}
					isProPattern={acnl.isProPattern()}
					shouldQrCodeUpdate={shouldQrCodeUpdate}
				/>
			</div>
		);
	}
}

export default Editor;
