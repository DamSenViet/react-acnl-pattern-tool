A React.js port of [Animal Crossing New Leaf Pattern Tool](https://thulinma.com/acnl/) by [Thulinma]([Thulinma's](https://github.com/Thulinma)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.


## Old Architecture

The architecture for original application (not this one) was unorganized. Both the controller and model directly rendered parts of the view on their own. It wasn't very clear how it should be handled.

## New Architecture

The new architecture uses an MVC model. The controller interacts with the model and is responsible for rendering the visual representation of the model. The controller now consists of several parts.

* Editor
* Canvas
* Swatch
* Palette
* QRCode

Note: the term model will refer to the `ACNL` class from `acnl.js` which represents the ACNL file format used to save/render QR codes in Animal Crossing New Leaf (ACNL).

Note: the term pixel in this write-up refers to a pattern pixel drawn onto the canvas (as the pattern size is 32x32 pixels or 64x64 pixels), not a physical or css pixel.

The editor is the parent of the canvas, palette, and swatch, qrcode and acts as the main center of control. Component's cannot update each other directly, but must now communicate with the editor component in order to update other components and the model respectively. Figuratively, the 'editor' is a user that can manipulate both the model and the view. The 'editor' holds onto user information (e.g. current drawing color).

The components themselves are now modular, easily allowing for additional modifications to be added. For example, pixel tools can be added in the form of a module. All they have to do is return a list of pixels that need to be colored in for the editor to handle via `updatePixelBuffer(x, y, isTriggeringRefreshing)`. It is now possible to introduce pen sizes and bucket tools. While this version does not use these modifications, the design of the application was made with this in mind and can be easily added as such.


## Optimizations

When drawing, the ACNL file is modified while drawing. However, the file modifications are cached in a buffer (`pixelBuffer`) and then applied when the metaphorical editor is "free". This prevents full re-renders of the pattern, increasing the number of `mousemove` events the browser can fire without canceling. When applying the file modifications stored in the buffer, the editor syncs both the visual representation of the file (the pattern) and the file itself.

The `pixelBuffer` also prevents the additions of pixels that match the last added pixel in the buffer. This is useful when the user is slowly drawing and the `mousemove` will generate draws on the same pixel more than once.

Re-renders have also been further reduced by manually controlling component updates conditions via `shouldComponentUpdate()` in the canvas and qrcode generators.

The qr code generators no longer probe for the `typeNumber` and use hardcoded typeNumbers to reduce runtime.

Expensive operations such as `DOMNode.getBoundingClientRect()` and `getContext("2d")` have all been cached into the canvas components and can now conditionally update when necessary (via resize/scrolling or re-rendering respectively).

## Additional Notes

* the [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) library doesn't support multipart QR codes (at all), we will be using the patched version of it by Thulinma instead (included in this repository and available on the original tool)
