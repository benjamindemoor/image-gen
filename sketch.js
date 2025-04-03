// Image Dithering Generator
// A modern UI for applying dithering effects to images

let black;
let img;
let ditherType = 'bayer';
let canvasWidth;
let canvasHeight;
let ditherColor = '#000000';
let backgroundColor = '#FFFFFF';
let originalWidth;
let originalHeight;
let scale = 1;
let imageLoaded = false;

// DOM elements
let thresholdSlider;
let thresholdValue;
let ditherColorPicker;
let backgroundColorPicker;
let saveButton;
let ditherButtons = [];
let imageUpload;
let fileName;

function setup() {
  pixelDensity(1);
  
  // Create canvas with initial size
  let canvas = createCanvas(800, 400);
  canvas.parent('canvas-container');
  
  // Get DOM elements
  thresholdSlider = select('#threshold-slider');
  thresholdValue = select('#threshold-value');
  ditherColorPicker = select('#dither-color-picker');
  backgroundColorPicker = select('#background-color-picker');
  saveButton = select('#save-btn');
  imageUpload = select('#image-upload');
  fileName = select('#file-name');
  
  // Get dither buttons
  ditherButtons = [
    select('#atkinson-btn'),
    select('#floydsteinberg-btn'),
    select('#bayer-btn'),
    select('#none-btn')
  ];
  
  // Set up event listeners
  thresholdSlider.input(updateThresholdValue);
  ditherColorPicker.input(updateDitherColor);
  backgroundColorPicker.input(updateBackgroundColor);
  saveButton.mousePressed(saveDitheredImage);
  imageUpload.input(handleFileUpload);
  
  // Set up dither button event listeners
  ditherButtons[0].mousePressed(() => setDitherType('atkinson', 0));
  ditherButtons[1].mousePressed(() => setDitherType('floydsteinberg', 1));
  ditherButtons[2].mousePressed(() => setDitherType('bayer', 2));
  ditherButtons[3].mousePressed(() => setDitherType('none', 3));
  
  // Initialize Riso (only used for dithering, not for display)
  black = new Riso('black');
  
  // Set initial active button
  updateDitherButtons();
  
  // Add window resize event listener
  window.addEventListener('resize', handleResize);
  
  // Load default image
  loadDefaultImage();
  
  // Display initial message
  background(255);
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Please upload an image or wait for default image to load", width/2, height/2);
}

function loadDefaultImage() {
  // Load the default image
  img = loadImage('data/images/images (7).jpeg', onImageLoaded);
}

function handleFileUpload() {
  if (imageUpload.elt.files.length > 0) {
    const file = imageUpload.elt.files[0];
    fileName.html(file.name);
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = function(event) {
      // Create a new image from the file data
      img = loadImage(event.target.result, onImageLoaded);
    };
    
    reader.readAsDataURL(file);
  }
}

function onImageLoaded() {
  imageLoaded = true;
  
  // Store original dimensions
  originalWidth = img.width;
  originalHeight = img.height;
  
  // Calculate initial scale
  calculateScale();
  
  // Resize canvas
  resizeCanvas(canvasWidth, canvasHeight);
}

function handleResize() {
  if (imageLoaded) {
    calculateScale();
    resizeCanvas(canvasWidth, canvasHeight);
  }
}

function calculateScale() {
  // Get container width
  const container = document.getElementById('canvas-container');
  const containerWidth = container.clientWidth;
  
  // Calculate scale to fit the container width
  // We need to fit two images side by side, so divide by 2
  scale = containerWidth / (originalWidth * 2);
  
  // Calculate new dimensions
  canvasWidth = originalWidth * 2 * scale;
  canvasHeight = originalHeight * scale;
}

function draw() {
  background(255);

  if (!imageLoaded) {
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Please upload an image or wait for default image to load", width/2, height/2);
    return;
  }

  // Draw original image on the left side
  image(img, 0, 0, originalWidth * scale, originalHeight * scale);
  
  // Draw dithered image on the right side
  let threshold = thresholdSlider.value();

  // Apply dithering effect
  let dithered = ditherImage(img, ditherType, threshold);
  
  // Apply custom colors
  let coloredDithered = createGraphics(img.width, img.height);
  coloredDithered.loadPixels();
  dithered.loadPixels();
  
  // Convert hex colors to RGB
  let ditherRGB = hexToRgb(ditherColor);
  let backgroundRGB = hexToRgb(backgroundColor);
  
  for (let i = 0; i < dithered.pixels.length; i += 4) {
    // If the pixel is black in the dithered image, use the dither color
    if (dithered.pixels[i] === 0) {
      coloredDithered.pixels[i] = ditherRGB.r;
      coloredDithered.pixels[i + 1] = ditherRGB.g;
      coloredDithered.pixels[i + 2] = ditherRGB.b;
      coloredDithered.pixels[i + 3] = 255;
    } else {
      // Otherwise use the background color
      coloredDithered.pixels[i] = backgroundRGB.r;
      coloredDithered.pixels[i + 1] = backgroundRGB.g;
      coloredDithered.pixels[i + 2] = backgroundRGB.b;
      coloredDithered.pixels[i + 3] = 255;
    }
  }
  
  coloredDithered.updatePixels();
  
  // Draw the colored dithered image directly (not using Riso)
  image(coloredDithered, originalWidth * scale, 0, originalWidth * scale, originalHeight * scale);
  
  // Draw labels
  fill(0);
  textSize(16 * scale);
  textAlign(CENTER);
  text("Original Image", originalWidth * scale / 2, 20 * scale);
  text("Dithered Image", originalWidth * scale + originalWidth * scale / 2, 20 * scale);
}

function keyReleased() {
  if (key == '1') {
    setDitherType('atkinson', 0);
  }
  else if (key == '2') {
    setDitherType('floydsteinberg', 1);
  }
  else if (key == '3') {
    setDitherType('bayer', 2);
  }
  else if (key == '4') {
    setDitherType('none', 3);
  }
}

function setDitherType(type, buttonIndex) {
  ditherType = type;
  updateDitherButtons(buttonIndex);
}

function updateDitherButtons(activeIndex) {
  ditherButtons.forEach((button, index) => {
    if (index === activeIndex) {
      button.addClass('active');
    } else {
      button.removeClass('active');
    }
  });
}

function updateThresholdValue() {
  thresholdValue.html(thresholdSlider.value());
}

function updateDitherColor() {
  ditherColor = ditherColorPicker.value();
}

function updateBackgroundColor() {
  backgroundColor = backgroundColorPicker.value();
}

function hexToRgb(hex) {
  // Remove the hash if it exists
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

function saveDitheredImage() {
  if (!imageLoaded) {
    alert("Please upload an image first");
    return;
  }
  
  // Visual feedback when saving
  saveButton.style('background-color', '#1976D2');
  setTimeout(() => {
    saveButton.style('background-color', '#2196F3');
  }, 200);
  
  // Create a temporary canvas for the dithered image only
  let tempCanvas = createGraphics(img.width, img.height);
  tempCanvas.background(255);
  
  // Apply the dithering effect
  let threshold = thresholdSlider.value();
  let dithered = ditherImage(img, ditherType, threshold);
  
  // Apply custom colors
  let coloredDithered = createGraphics(img.width, img.height);
  coloredDithered.loadPixels();
  dithered.loadPixels();
  
  // Convert hex colors to RGB
  let ditherRGB = hexToRgb(ditherColor);
  let backgroundRGB = hexToRgb(backgroundColor);
  
  for (let i = 0; i < dithered.pixels.length; i += 4) {
    // If the pixel is black in the dithered image, use the dither color
    if (dithered.pixels[i] === 0) {
      coloredDithered.pixels[i] = ditherRGB.r;
      coloredDithered.pixels[i + 1] = ditherRGB.g;
      coloredDithered.pixels[i + 2] = ditherRGB.b;
      coloredDithered.pixels[i + 3] = 255;
    } else {
      // Otherwise use the background color
      coloredDithered.pixels[i] = backgroundRGB.r;
      coloredDithered.pixels[i + 1] = backgroundRGB.g;
      coloredDithered.pixels[i + 2] = backgroundRGB.b;
      coloredDithered.pixels[i + 3] = 255;
    }
  }
  
  coloredDithered.updatePixels();
  tempCanvas.image(coloredDithered, 0, 0);
  
  // Save the temporary canvas
  saveCanvas(tempCanvas, 'dithered-image', 'png');
} 