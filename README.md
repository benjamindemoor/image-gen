# Image Dithering Generator

A modern web application for applying dithering effects to images with a side-by-side preview and intuitive controls.

## Features

- Side-by-side preview of original and dithered images
- Multiple dithering algorithms (Atkinson, Floyd-Steinberg, Bayer, None)
- Interactive threshold adjustment with real-time feedback
- Custom color selection for dither effects
- Modern, responsive UI with clear visual cues
- Keyboard shortcuts for quick algorithm switching
- One-click image saving

## Setup

1. Make sure you have an image file at `data/images/images (7).jpeg`
2. Run a local server to serve the files

## Running a Local Server

### Option 1: Using Python (simplest)

If you have Python installed:

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Then open your browser and go to: http://localhost:8000

### Option 2: Using Node.js

If you have Node.js installed:

```bash
# Install a simple HTTP server
npm install -g http-server

# Run the server
http-server
```

Then open your browser and go to: http://localhost:8080

## Usage

1. The application will automatically load the image from `data/images/images (7).jpeg`
2. You'll see the original image on the left and the dithered version on the right
3. Use the algorithm buttons or keys 1-4 to switch between dither algorithms:
   - 1: Atkinson
   - 2: Floyd-Steinberg
   - 3: Bayer
   - 4: None
4. Adjust the threshold using the slider (the value updates in real-time)
5. Choose a custom color for the dither effect by checking "Use custom color" and selecting a color
6. Click the "Save Processed Image" button to download the dithered image
7. The interface provides visual feedback for all interactions

## Troubleshooting

If you're having trouble loading the image:
- Make sure you're running a local server (not just opening the HTML file directly)
- Check that the image file exists at `data/images/images (7).jpeg`
- Ensure your image is in a supported format (JPG, PNG, etc.)
- Check the browser console for error messages 