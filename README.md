A React.js port of [Animal Crossing New Leaf Pattern Tool](https://github.com/Thulinma/ACNLPatternTool) by [Thulinma](https://github.com/Thulinma)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Stack

* [file-saver](https://github.com/eligrey/FileSaver.js/) (writing out a binary file)
* [jsqrcode](https://github.com/LazarSoft/jsqrcode) (reading in qr codes)
* [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (generating qr codes)


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
* QR Code Generator

Note: the term model will refer to the `ACNL` class from `acnl.js` which represents the ACNL file format used to save/render QR codes in Animal Crossing New Leaf (ACNL).

Note: the term pixel in this write-up refers to a pattern pixel drawn onto the canvas (as the pattern size is 32x32 pixels and up to 4 patterns can exist on a canvas), not a physical or css pixel.

The editor is the parent of the canvas, palette, swatch, and qr code generator. It acts as the main center of control. Components cannot update each other directly, but must now communicate with the editor component in order to update other components and the model respectively. Figuratively, the 'editor' is a user that can manipulate both the model and the view. The 'editor' holds onto user information (e.g. current drawing color).

The components themselves are now modular, easily allowing for additional modifications to be added. For example, pixel tools can be added in the form of a module. All they have to do is return a list of pixels that need to be colored in for the editor to handle via `updatePixelBuffer(x, y)` (read into optimizations on the pixel buffer). It is now possible to introduce pen sizes and bucket tools. While this version does not use these modifications, the design of the application was made with this in mind and can be easily added as such.

## Optimizations

### 1. The Pixel Buffer
When the user is drawing on the canvas, there are two operations that need to be executed:

1. the canvas needs to update itself to color in the pixel
2. the ACNL file needs to have update itself to have the color of the pixel in the data changed

Since React will force a re-render (redrawing the entire pattern from scratch) when we modify the file and the render is expensive, this application now uses a `pixelBuffer` to store the necessary file modifications. The drawing is performed live while the changed pixels are cached to be applied to the file at a later time. `updatePixelBuffer(x, y)` will handle both the drawing and caching of the pixel that needs to be modified. It will also schedule the application of the file modifications in the `pixelBuffer` to a time when the user is free.

The `pixelBuffer` is specific to the chosen drawing color and will force the file to update when the chosen drawing color has changed.

The `pixelBuffer` also prevents the additions of pixels that match the last added pixel in the buffer. This is useful when the user is slowly drawing and the `mousemove` will generate draws on the same pixel more than once. Although this helps reduce duplicates, it will not prevent duplicate pixels from existing in the buffer.

### 2. More Caching

Expensive operations such as `getBoundingClientRect()` and `getContext("2d")` have all been cached into the canvas components and can now conditionally update when necessary (via resize/scrolling or re-rendering respectively).

### 3. Controlling Renders

Re-renders have also been further reduced by manually controlling component update conditions via `shouldComponentUpdate()` on all components.

The qr code generator no longer probes for the `typeNumber` and uses hardcoded `typeNumbers` to reduce runtime. The qr code generator now only updates the qr codes that have been affected by data changes.

## Additional Notes

* the [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) library doesn't support multipart QR codes (at all), we will be using the patched version of it by Thulinma instead available [here](https://github.com/Thulinma/ACNLPatternTool).

* the [jsqrcode](https://github.com/LazarSoft/jsqrcode) library still has trouble recognizing the QR codes and there are still some errors to be fixed in the original library. We will be using Thulinma's patched version at [this fork's branch](https://github.com/Thulinma/jsqrcode/tree/finder_fix_mini)
