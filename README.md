# React Animal Crossing New Leaf Tool

A React.js port of [Animal Crossing New Leaf Pattern Tool](https://github.com/Thulinma/ACNLPatternTool) by [Thulinma](https://github.com/Thulinma)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Table of Contents
* [Stack](#stack)
* [Notes](#notes)
* [Available Scripts](#available-scripts)
* [Old Architecture](#old-architecture)
* [New Architecture](#new-architecture)
* [Optimizations](#optimizations)
* [Performance Evaluation](#performance-evaluation)

## Stack

* [file-saver](https://github.com/eligrey/FileSaver.js/) (writing out a binary file)
* [jsqrcode](https://github.com/LazarSoft/jsqrcode) (reading in qr codes)
* [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (generating qr codes)
* (other original dependencies have been removed for optimization)

## Notes

* the [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) library doesn't support multipart QR codes (at all), we will be using the patched version of it by Thulinma instead available [here](https://github.com/Thulinma/ACNLPatternTool/blob/master/qrcode.js).

* the [jsqrcode](https://github.com/LazarSoft/jsqrcode) library still has trouble recognizing the QR codes and there are still some errors to be fixed in the original library. We will be using Thulinma's patched version at [his fork's branch](https://github.com/Thulinma/jsqrcode/tree/finder_fix_mini).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.


## Old Architecture

The architecture for original application (not this one) was unorganized. Both the controller and model directly rendered parts of the view on their own. It wasn't very clear how it should be handled.

`acnl.js`
```javascript

function setColor() {
  ...
  for (var i in canvasses){
    drawPixel(canvasses[i], x, y, c, getZoom(canvasses[i].canvas));
  }
}

```

`page.js`
```javascript
  .mousemove(function(event) {
    ...
    ACNL.setColor(x, y, chosen_color)
  })
```

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

The components themselves are now modular, easily allowing for additional modifications to be added. For example, pixel tools can be added in the form of a module. All they have to do is return a list of pixels that need to be colored in for the editor to handle via `updatePixelBuffer([pixels...[x, y]])` (read into optimizations on the pixel buffer). It is now possible to introduce pen sizes and bucket tools by simplying extending the EditorTools module.

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

The qr code generator no longer probes for the `typeNumber` and uses hardcoded `typeNumbers` to reduce runtime. The qr code generator now only updates the qr codes that have been affected by data changes and not all qr codes.

## Performance Evaluation

### Overall

Even though the application has been restructured to fit into the React.js framework with optimizations added and dependencies (e.g. jquery) removed, the overall performance (for drawing) of the application turned out worst than the original (in some respects). Let's get down to the specifics. We'll discuss just drawing and event handling since these are two most important. The specific use case we'll be discussing is drawing on pattern continuously without lifting the mouse. The statistical test was done via Chrome's performance profiles at varying performance throttling levels (1x, 4x, 6x).

### Pattern Rendering

[Reference on Painting and Compositing.](https://medium.com/outsystems-experts/how-to-achieve-60-fps-animations-with-css3-db7b98610108)

Both tools take the same approach to drawing. They only overwrite the color of pixel that's being drawn on instead of fully redrawing the pattern with the changed pixel. However, the React.js port was able to both match and beat out the original tool in terms of painting and compositing at the time it was forked (the first commit on github). The original tool redraws the entire pattern unecessarily several times:

1. when the user starts to click
2. when the user releases click

Both cases have been entirely removed in this port. Full refreshes are deferred to a scheduler that will sync the pattern with its data equivalent when the user is not trying to draw with the chosen swatch color.

This port also caches expensive operations such as `DOMelement.getBoundingClientRect()` and `canvas.getContext()`. While jquery uses `offset()`, in the background it is making calls to `getBoudingClientRect()` which causes [layout thrashing](http://wilsonpage.co.uk/preventing-layout-thrashing/). This problem is removed entirely in this port since each canvas's `boundingClientRect` is cached alongside `canvas.getContext()` into the component and updated only when necessary. Both functions are used quite frequently in the drawing process, so caching them slightly improved performance.

### Event Handling

Our port loses out in this race, even with the optimizations. If we were to compare raw event handler functions (`draw` in `Editor.jsx` vs `setColor` in `acnl.js` from the original) performance used for drawing against each other, this version does much, much better than the original (by almost `300%` in fact). How is it possible that we still lose in overall event handling? 

React uses a [synthetic event handler](https://reactjs.org/docs/events.html) instead of native event handlers to account for browser compatibility. The synthetic event handler comes with a lot of overhead, both from being passed around and from deep encapsulation. 

When drawing for `10s` straight, the port's total raw handling time went from `31.0ms` to a total synthetic event handling time of `567.1ms`. The original tool, using jquery to handle events, went from a raw `96.0ms` to `215.1ms`. While we beat the original tool by a wide margin in raw event handling (due to the `pixelBuffer` caching the file operations), we were not able to beat the original tool in overall event handling due to React's synthetic wrapper.

### Conclusion

So what did we learn with all this effort? Don't use React.js when you have to constantly handle events like in a drawing application. It's a bad idea due to the overhead costs associated with the event wrapper created by React. This port will only be updated to the original tool's status and then abandoned afterwards.