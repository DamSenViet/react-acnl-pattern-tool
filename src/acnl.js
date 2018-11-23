//ACNL data layout (identical to binary QR code contents):
//.ACNL file type for importing
//
//0x 00 - 0x 29 ( 42) = Pattern Title
// 0x28 0x29 are null terminators

//0x 2A - 0x 2B (  2) = User ID // huhhh???
//0x 2C - 0x 3F ( 20) = User Name
//0x 40 - 0x 41 (  2) = Town ID // what is this even for lmao
//0x 42 - 0x 55 ( 20) = Town Name
//0x 56 - 0x 57 (  2) = Unknown (values are usually random - changing seems to have no effect)
//0x 58 - 0x 66 ( 15) = Color code indexes (COLOR SWATCH)
//0x 67         (  1) = Unknown (value is usually random - changing seems to have no effect)
//0x 68         (  1) = Ten? (seems to always be 0x0A)
//0x 69         (  1) = Pattern type (normal patterns: 0x09, dresses: 0x00, photo boards: 0x08)
//0x 6A - 0x 6B (  2) = Zero? (seems to always be 0x0000)
//0x 6C - 0x26B (512) = Pattern Data 1 (mandatory)
//0x26C - 0x46B (512) = Pattern Data 2 (optional)
//0x46C - 0x66B (512) = Pattern Data 3 (optional)
//0x66C - 0x86B (512) = Pattern Data 4 (optional)
//0x86C - 0x86F (  4) = Zero padding (optional)


class ACNL {
	constructor(data) {
		if (arguments.length > 0) {
			this.data = data;
		} else {
			// set default data
			// initial data is only 620 in length
			// only contains 1 pattern
			this.data = window.atob("RQBtAHAAdAB5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVAG4AawBuAG8AdwBuAAAAAAAAAAAAVQBuAGsAbgBvAHcAbgAAAAAAAABeCw8fLz9PX29/j5+vv8/f73YKCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");

			// alternate default for testing
			// this.data = window.atob("QgBvAGwAZAAgAGEAbgBkACAAQgByAGEAcwBoAAAAAAAAAAAAAAAAAAAAYPVKAGEAawBlAAAAAAAAAAAAAAAAAC2xTABlAHcAZQBzAAAAAAAAAAAAAQAxCvBxdCEPI9KDJKA/EqOh78wKCQAAVVVVUiISVRFVVRERERUREVVVUkVVFRUR7u7uHlVVFRFVVVVUJVIi7t3dye5VJVURVVJVVVIh4t7Q3d3sXlUiEVVVVVJUId4AoN3dzV4iVUFVVRRVFeEOoN3d3d3sIhFBVVRRRVHuAODunt3d7CUVQVVVREThDgruG56d3ewlEURVURQU7tDdvhve2c3uJRFEVUQR7trd3b7h3p3MXiIRRFVB4dDd7t7t7t3d7lUlEURVEQ7Q7VXl3d3d3V5VJRFEheHarR5VVd7d3d3tVSIVRFXh3e0REVXu3d3N7FUiEUQR4d3tERHl7t7d7cxeUhFEVeHdHhFU5d3e3ezNXhIRRFVB7hVBVOXd3t3s3l4VEURVEUQREVXl3d7N3c5eFRFBVRURVVVV5d3e3czOXlVRQVVVFVVV5e7d3t3Nzu5eVUFVVVEVVe5n3d7d3M7c7oVBVVWBUoVu1u3e3d3OzOyIQVWCWFiC5e7u3d3d7czsWEFViCWFUlXV7t3d3e3ujhURVVVRhVJV5d7t7t3tVYUVESVSVVVV5e7t7lXu7R4RERFVFVVVEe7d5hUR5c3uEVIRVBVVVeHefV4VUeXe7F5YUYRVVVXh3XYeERVV3szuVVW1iFiF4W3nFRFVVe7N7FVVu4uIVeVt7hJVWFXo3exVVbu7u0tV7i4iVVVVVe6OVVU=");
		}
	}

	checkDataAccess(offset) {
		if (
			offset < 0 ||
			offset >= this.data.length
		) throw new Error("attempted to access invalid address of data");
	}

	getByte(offset) {
		this.checkDataAccess(offset);
		return this.data.charCodeAt(0);
	}

	setByte(offset, val) {
		this.checkDataAccess(offset);
		this.data =
			this.data.substr(0, offset) +
			String.fromCharCode(val) +
			this.data.substr(offset + 1);
	}

	// allows only for reading of utf-16 portions of data
	from_utf16(offset) {
		this.checkDataAccess(offset);

		let len;
		switch(offset) {
			// pattern title
			case 0x00: len = 40; break;
			// creator name
			case 0x2c: len = 20; break;
			// town name
			case 0x42: len = 20; break;
			default: throw new Error("not valid utf-16 data");
		}

		let tmp = "";
		for (let i = offset; i < offset + len; i += 2){
			// reconstruct the utf16 byte
			// note utf-16 format is big endian (most significant byte stored first)
			// but, in storage we use little endian (most significant byte last)
			// therefore we need to grab the right byte first
			let char = (this.data.charCodeAt(i+1) << 8) + this.data.charCodeAt(i);
			if (char === 0){return tmp;}
			tmp += String.fromCharCode(char);
		}
		return tmp;
	}

	// allows only for writing to utf-16 portions of data
	to_utf16(offset, str) {
		let len;
		switch(offset) {
			// pattern title
			case 0x00: len = 20; break;
			// creator name
			case 0x2C: len = 10; break;
			// town name
			case 0x42: len = 10; break;
			default: throw new Error("not valid utf-16 data location");
		}

		for (let i = 0; i < len; ++i){
      if (i >= str.length){
        this.setByte(offset + i*2, 0);
        this.setByte(offset + i*2+1, 0);
      } else{
        this.setByte(offset + i*2, str.charCodeAt(i) & 0xFF);
        this.setByte(offset + i*2+1, (str.charCodeAt(i) >> 8) & 0xFF);
      }
    }
	}

	getID(offset) {
		switch(offset) {
			// user id
			case 0x2A: break;
			// town id
			case 0x40: break;
			default: throw new Error("data address specified is not an id");
		}

		let left = this.getByte(offset);
		let right = this.getByte(offset);
		let val = (left << 8) + right;
		val = val.toString(16);
		return val;
	}

	setID(offset, str) {
		// verify offset
		switch(offset) {
			// user id
			case 0x2A: break;
			// town id
			case 0x40: break;
			default: throw new Error("data address specified is not an id");
		}

		let num = parseInt(str, 16);
		// check if num is larger than 16 bits and valid
		if (isNaN(num) || num >= 65536) {
			throw new Error("not valid id data");
		}

		// store first byte's, then second
		// & with 2 bytes of 1's in binary
		// bit shifting to remove extra bits and pad with 0's in binary
		// AND operator 0xFF leaves only the last 8 bits
		this.setByte(offset, (num >> 8) & 0xFF);
		this.setByte(offset + 1, num & 0xFF);
	}

	isProPattern() {
		return this.data.length === 0x870;
	}

	colorPixel(x, y, chosenColor) {
		if (chosenColor < 0 || chosenColor > 15) {
			throw new Error("invalid chosen color");
		}

		// check if x, y is available coordinate
		// check for 64 vs 32 bit patterns
		if (
			isNaN(x) ||
			isNaN(y) ||
			x < 0 ||
			y < 0 ||
			x > 63 ||
			y > 63
		) return false;

		if (
			this.data.length !== 0x870 &&
			(x > 31 || y > 31)
		) return false;


		// each "pixel" in the pattern is only half a byte (colors are 0-14)
		// since each pattern is 32 x 32, we need only 16 bytes in width
		// to represent a row of the pattern, y * 16 allows us to skip rows
		// x assumes that you can get pixels from 0 -> 64 in this situation
		// to get column, we need to x/2

		// reminder that this is a port, will have to refactor this to only color
		// pixels in specific patterns in the future
		let offset = 0x6C + Math.floor(x/2) + y * 16;

		// need to make sure we don't override other pixels
		let val = this.data.charCodeAt(offset) & 0xFF;
		let oldval = val;
		if ((x % 2) === 1) {
			// keep last half, replace first half with chosen color
			val = (val & 0x0F) + (chosenColor << 4);
		} else {
			// keep first half, replace second half with chosen color
			val = (val & 0xF0) + chosenColor;
		}

		if (val === oldval) {
			return false;
		}

		this.setByte(offset, val);
		return true;
	}

	get patterns() {
		return this.data.substr(0x6C, 2048);
	}

	get swatch() {
		let binColorsStr = this.data.substr(0x58, 15).split("");
		return binColorsStr.map((char) => {
			return char.charCodeAt(0);
		});
	}

	setSwatchColor(chosenColor, newBinColor) {
		if (chosenColor < 0 || chosenColor > 15) throw new Error("invalid chosen color");
		if (ACNL.paletteBinToHex[newBinColor] === undefined) {
			throw new Error("new color is invalid");
		}
		this.setByte(0x58 + chosenColor, newBinColor);
	}

	get patternTitle() {
		return this.from_utf16(0x00);
	}

	set patternTitle(str) {
		this.to_utf16(0x00, str);
	}

	get userName() {
		return this.from_utf16(0x2C);
	}

	set userName(str) {
		this.to_utf16(0x2C ,str);
	}

	get userID() {
		return this.getID(0x2A);
	}

	set userID(str) {
		this.setID(0x2A, str);
	}

	get townName() {
		return this.from_utf16(0x42);
	}

	set townName(str) {
		this.to_utf16(0x42, str);
	}

	get townID() {
		return this.getID(0x40);
	}

	set townID(str) {
		return this.setID(0x40, str);
	}


	static get paletteBinToHex() {
		return {
			//pinks
			0x00: "#FFEFFF",
			0x01: "#FF9AAD",
			0x02: "#EF559C",
			0x03: "#FF65AD",
			0x04: "#FF0063",
			0x05: "#BD4573",
			0x06: "#CE0052",
			0x07: "#9C0031",
			0x08: "#522031",

			//reds
			0x10: "#FFBACE",
			0x11: "#FF7573",
			0x12: "#DE3010",
			0x13: "#FF5542",
			0x14: "#FF0000",
			0x15: "#CE6563",
			0x16: "#BD4542",
			0x17: "#BD0000",
			0x18: "#8C2021",

			//oranges
			0x20: "#DECFBD",
			0x21: "#FFCF63",
			0x22: "#DE6521",
			0x23: "#FFAA21",
			0x24: "#FF6500",
			0x25: "#BD8A52",
			0x26: "#DE4500",
			0x27: "#BD4500",
			0x28: "#633010",

			//pastels or something, I guess?
			0x30: "#FFEFDE",
			0x31: "#FFDFCE",
			0x32: "#FFCFAD",
			0x33: "#FFBA8C",
			0x34: "#FFAA8C",
			0x35: "#DE8A63",
			0x36: "#BD6542",
			0x37: "#9C5531",
			0x38: "#8C4521",

			//purple
			0x40: "#FFCFFF",
			0x41: "#EF8AFF",
			0x42: "#CE65DE",
			0x43: "#BD8ACE",
			0x44: "#CE00FF",
			0x45: "#9C659C",
			0x46: "#8C00AD",
			0x47: "#520073",
			0x48: "#310042",

			// more pink
			0x50: "#FFBAFF",
			0x51: "#FF9AFF",
			0x52: "#DE20BD",
			0x53: "#FF55EF",
			0x54: "#FF00CE",
			0x55: "#8C5573",
			0x56: "#BD009C",
			0x57: "#8C0063",
			0x58: "#520042",

			// brown
			0x60: "#DEBA9C",
			0x61: "#CEAA73",
			0x62: "#734531",
			0x63: "#AD7542",
			0x64: "#9C3000",
			0x65: "#733021",
			0x66: "#522000",
			0x67: "#311000",
			0x68: "#211000",

			// yellow
			0x70: "#FFFFCE",
			0x71: "#FFFF73",
			0x72: "#DEDF21",
			0x73: "#FFFF00",
			0x74: "#FFDF00",
			0x75: "#CEAA00",
			0x76: "#9C9A00",
			0x77: "#8C7500",
			0x78: "#525500",


			// blue
			0x80: "#DEBAFF",
			0x81: "#BD9AEF",
			0x82: "#6330CE",
			0x83: "#9C55FF",
			0x84: "#6300FF",
			0x85: "#52458C",
			0x86: "#42009C",
			0x87: "#210063",
			0x88: "#211031",

			// ehm... also blue?
			0x90: "#BDBAFF",
			0x91: "#8C9AFF",
			0x92: "#3130AD",
			0x93: "#3155EF",
			0x94: "#0000FF",
			0x95: "#31308C",
			0x96: "#0000AD",
			0x97: "#101063",
			0x98: "#000021",


			// green
			0xA0: "#9CEFBD",
			0xA1: "#63CF73",
			0xA2: "#216510",
			0xA3: "#42AA31",
			0xA4: "#008A31",
			0xA5: "#527552",
			0xA6: "#215500",
			0xA7: "#103021",
			0xA8: "#002010",

			// icky greenish yellow
			0xB0: "#DEFFBD",
			0xB1: "#CEFF8C",
			0xB2: "#8CAA52",
			0xB3: "#ADDF8C",
			0xB4: "#8CFF00",
			0xB5: "#ADBA9C",
			0xB6: "#63BA00",
			0xB7: "#529A00",
			0xB8: "#316500",

			// Wtf? More blue?
			0xC0: "#BDDFFF",
			0xC1: "#73CFFF",
			0xC2: "#31559C",
			0xC3: "#639AFF",
			0xC4: "#1075FF",
			0xC5: "#4275AD",
			0xC6: "#214573",
			0xC7: "#002073",
			0xC8: "#001042",

			// gonna call this cyan
			0xD0: "#ADFFFF",
			0xD1: "#52FFFF",
			0xD2: "#008ABD",
			0xD3: "#52BACE",
			0xD4: "#00CFFF",
			0xD5: "#429AAD",
			0xD6: "#00658C",
			0xD7: "#004552",
			0xD8: "#002031",

			// more cyan, because we didn't have enough blue-like colors yet
			0xE0: "#CEFFEF",
			0xE1: "#ADEFDE",
			0xE2: "#31CFAD",
			0xE3: "#52EFBD",
			0xE4: "#00FFCE",
			0xE5: "#73AAAD",
			0xE6: "#00AA9C",
			0xE7: "#008A73",
			0xE8: "#004531",

			// also green. Fuck it, whatever.
			0xF0: "#ADFFAD",
			0xF1: "#73FF73",
			0xF2: "#63DF42",
			0xF3: "#00FF00",
			0xF4: "#21DF21",
			0xF5: "#52BA52",
			0xF6: "#00BA00",
			0xF7: "#008A00",
			0xF8: "#214521",

			//greys
			0x0F: "#FFFFFF",
			0x1F: "#ECECEC",
			0x2F: "#DADADA",
			0x3F: "#C8C8C8",
			0x4F: "#B6B6B6",
			0x5F: "#A3A3A3",
			0x6F: "#919191",
			0x7F: "#7F7F7F",
			0x8F: "#6D6D6D",
			0x9F: "#5B5B5B",
			0xAF: "#484848",
			0xBF: "#363636",
			0xCF: "#242424",
			0xDF: "#121212",
			0xEF: "#000000",
		};
	}

	static get paletteHexToBin() {
		return {
			"#FFEFFF" : 0x00,
			"#FF9AAD" : 0x01,
			"#EF559C" : 0x02,
			"#FF65AD" : 0x03,
			"#FF0063" : 0x04,
			"#BD4573" : 0x05,
			"#CE0052" : 0x06,
			"#9C0031" : 0x07,
			"#522031" : 0x08,
			"#FFBACE" : 0x10,
			"#FF7573" : 0x11,
			"#DE3010" : 0x12,
			"#FF5542" : 0x13,
			"#FF0000" : 0x14,
			"#CE6563" : 0x15,
			"#BD4542" : 0x16,
			"#BD0000" : 0x17,
			"#8C2021" : 0x18,
			"#DECFBD" : 0x20,
			"#FFCF63" : 0x21,
			"#DE6521" : 0x22,
			"#FFAA21" : 0x23,
			"#FF6500" : 0x24,
			"#BD8A52" : 0x25,
			"#DE4500" : 0x26,
			"#BD4500" : 0x27,
			"#633010" : 0x28,
			"#FFEFDE" : 0x30,
			"#FFDFCE" : 0x31,
			"#FFCFAD" : 0x32,
			"#FFBA8C" : 0x33,
			"#FFAA8C" : 0x34,
			"#DE8A63" : 0x35,
			"#BD6542" : 0x36,
			"#9C5531" : 0x37,
			"#8C4521" : 0x38,
			"#FFCFFF" : 0x40,
			"#EF8AFF" : 0x41,
			"#CE65DE" : 0x42,
			"#BD8ACE" : 0x43,
			"#CE00FF" : 0x44,
			"#9C659C" : 0x45,
			"#8C00AD" : 0x46,
			"#520073" : 0x47,
			"#310042" : 0x48,
			"#FFBAFF" : 0x50,
			"#FF9AFF" : 0x51,
			"#DE20BD" : 0x52,
			"#FF55EF" : 0x53,
			"#FF00CE" : 0x54,
			"#8C5573" : 0x55,
			"#BD009C" : 0x56,
			"#8C0063" : 0x57,
			"#520042" : 0x58,
			"#DEBA9C" : 0x60,
			"#CEAA73" : 0x61,
			"#734531" : 0x62,
			"#AD7542" : 0x63,
			"#9C3000" : 0x64,
			"#733021" : 0x65,
			"#522000" : 0x66,
			"#311000" : 0x67,
			"#211000" : 0x68,
			"#FFFFCE" : 0x70,
			"#FFFF73" : 0x71,
			"#DEDF21" : 0x72,
			"#FFFF00" : 0x73,
			"#FFDF00" : 0x74,
			"#CEAA00" : 0x75,
			"#9C9A00" : 0x76,
			"#8C7500" : 0x77,
			"#525500" : 0x78,
			"#DEBAFF" : 0x80,
			"#BD9AEF" : 0x81,
			"#6330CE" : 0x82,
			"#9C55FF" : 0x83,
			"#6300FF" : 0x84,
			"#52458C" : 0x85,
			"#42009C" : 0x86,
			"#210063" : 0x87,
			"#211031" : 0x88,
			"#BDBAFF" : 0x90,
			"#8C9AFF" : 0x91,
			"#3130AD" : 0x92,
			"#3155EF" : 0x93,
			"#0000FF" : 0x94,
			"#31308C" : 0x95,
			"#0000AD" : 0x96,
			"#101063" : 0x97,
			"#000021" : 0x98,
			"#9CEFBD" : 0xA0,
			"#63CF73" : 0xA1,
			"#216510" : 0xA2,
			"#42AA31" : 0xA3,
			"#008A31" : 0xA4,
			"#527552" : 0xA5,
			"#215500" : 0xA6,
			"#103021" : 0xA7,
			"#002010" : 0xA8,
			"#DEFFBD" : 0xB0,
			"#CEFF8C" : 0xB1,
			"#8CAA52" : 0xB2,
			"#ADDF8C" : 0xB3,
			"#8CFF00" : 0xB4,
			"#ADBA9C" : 0xB5,
			"#63BA00" : 0xB6,
			"#529A00" : 0xB7,
			"#316500" : 0xB8,
			"#BDDFFF" : 0xC0,
			"#73CFFF" : 0xC1,
			"#31559C" : 0xC2,
			"#639AFF" : 0xC3,
			"#1075FF" : 0xC4,
			"#4275AD" : 0xC5,
			"#214573" : 0xC6,
			"#002073" : 0xC7,
			"#001042" : 0xC8,
			"#ADFFFF" : 0xD0,
			"#52FFFF" : 0xD1,
			"#008ABD" : 0xD2,
			"#52BACE" : 0xD3,
			"#00CFFF" : 0xD4,
			"#429AAD" : 0xD5,
			"#00658C" : 0xD6,
			"#004552" : 0xD7,
			"#002031" : 0xD8,
			"#CEFFEF" : 0xE0,
			"#ADEFDE" : 0xE1,
			"#31CFAD" : 0xE2,
			"#52EFBD" : 0xE3,
			"#00FFCE" : 0xE4,
			"#73AAAD" : 0xE5,
			"#00AA9C" : 0xE6,
			"#008A73" : 0xE7,
			"#004531" : 0xE8,
			"#ADFFAD" : 0xF0,
			"#73FF73" : 0xF1,
			"#63DF42" : 0xF2,
			"#00FF00" : 0xF3,
			"#21DF21" : 0xF4,
			"#52BA52" : 0xF5,
			"#00BA00" : 0xF6,
			"#008A00" : 0xF7,
			"#214521" : 0xF8,
			"#FFFFFF" : 0x0F,
			"#ECECEC" : 0x1F,
			"#DADADA" : 0x2F,
			"#C8C8C8" : 0x3F,
			"#B6B6B6" : 0x4F,
			"#A3A3A3" : 0x5F,
			"#919191" : 0x6F,
			"#7F7F7F" : 0x7F,
			"#6D6D6D" : 0x8F,
			"#5B5B5B" : 0x9F,
			"#484848" : 0xAF,
			"#363636" : 0xBF,
			"#242424" : 0xCF,
			"#121212" : 0xDF,
			"#000000" : 0xEF,
		};
	}
}

export default ACNL;
