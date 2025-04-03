// Image Dithering Generator
// A modern UI for applying dithering effects to images

let img;
let canvasWidth;
let canvasHeight;
let backgroundColor = '#FFFFFF';
let originalWidth;
let originalHeight;
let scale = 1;
let imageLoaded = false;
let processedImg;
let canvas;
let isPixelated = false;
let pixelationLevel = 10;

// DOM elements
let threshold1Slider;
let threshold1Value;
let threshold1ColorPicker;
let threshold1Hex;
let threshold2Slider;
let threshold2Value;
let threshold2ColorPicker;
let threshold2Hex;
let backgroundColorPicker;
let backgroundHex;
let saveButton;
let imageUpload;
let fileName;
let pixelateButton;

// Threshold configuration
let thresholds = [
  { level: 128, color: '#000000' },
  { level: 200, color: '#666666' }
];

let thresholdCount = 2;

// Threshold management functions
function updateThresholdValue(index, slider, valueSpan) {
  const value = parseInt(slider.value());
  valueSpan.html(value);
  thresholds[index - 1].level = value;
}

function updateThresholdColor(index, colorPicker, hexInput) {
  const color = colorPicker.value();
  thresholds[index - 1].color = color;
  hexInput.value(color);
}

function updateThresholdHex(index, hexInput, colorPicker) {
  const hex = hexInput.value();
  if (isValidHex(hex)) {
    thresholds[index - 1].color = hex;
    colorPicker.value(hex);
  }
}

function updateThreshold1Value() {
  updateThresholdValue(1, threshold1Slider, threshold1Value);
}

function updateThreshold2Value() {
  updateThresholdValue(2, threshold2Slider, threshold2Value);
}

function updateThreshold1Color() {
  updateThresholdColor(1, threshold1ColorPicker, threshold1Hex);
}

function updateThreshold2Color() {
  updateThresholdColor(2, threshold2ColorPicker, threshold2Hex);
}

function updateThreshold1Hex() {
  updateThresholdHex(1, threshold1Hex, threshold1ColorPicker);
}

function updateThreshold2Hex() {
  updateThresholdHex(2, threshold2Hex, threshold2ColorPicker);
}

function updateBackgroundColor() {
  const color = backgroundColorPicker.value();
  backgroundColor = color;
  backgroundHex.value(color);
}

function togglePixelation() {
  isPixelated = !isPixelated;
  pixelateButton.class(isPixelated ? 'effect-button active' : 'effect-button');
}

function addNewThreshold() {
  thresholdCount++;
  const thresholdContainer = select('#threshold-container');
  
  // Create new threshold group
  const thresholdGroup = createDiv('');
  thresholdGroup.class('threshold-group');
  
  // Create remove button
  const removeButton = createButton('×');
  removeButton.class('remove-threshold');
  removeButton.mousePressed(() => removeThreshold(thresholdGroup, thresholdCount));
  
  // Create label
  const label = createElement('label', `Threshold ${thresholdCount}: `);
  const valueSpan = createSpan('128');
  valueSpan.id(`threshold${thresholdCount}-value`);
  label.child(valueSpan);
  label.attribute('for', `threshold${thresholdCount}-slider`);
  
  // Create slider
  const slider = createInput(128, 'range');
  slider.id(`threshold${thresholdCount}-slider`);
  slider.class('slider');
  slider.attribute('min', 0);
  slider.attribute('max', 255);
  slider.input(() => updateThresholdValue(thresholdCount, slider, valueSpan));
  
  // Create color option
  const colorOption = createDiv('');
  colorOption.class('color-option');
  
  const colorLabel = createElement('label', `Color ${thresholdCount}:`);
  colorLabel.attribute('for', `threshold${thresholdCount}-color-picker`);
  
  const colorPicker = createInput('#000000', 'color');
  colorPicker.id(`threshold${thresholdCount}-color-picker`);
  colorPicker.input(() => updateThresholdColor(thresholdCount, colorPicker, hexInput));
  
  const hexInput = createInput('#000000', 'text');
  hexInput.id(`threshold${thresholdCount}-hex`);
  hexInput.class('hex-input');
  hexInput.attribute('maxlength', 7);
  hexInput.input(() => updateThresholdHex(thresholdCount, hexInput, colorPicker));
  
  // Assemble the elements
  colorOption.child(colorLabel);
  colorOption.child(colorPicker);
  colorOption.child(hexInput);
  
  thresholdGroup.child(removeButton);
  thresholdGroup.child(label);
  thresholdGroup.child(slider);
  thresholdGroup.child(colorOption);
  
  thresholdContainer.child(thresholdGroup);
  
  // Add to thresholds array
  thresholds.push({ level: 128, color: '#000000' });
}

function removeThreshold(thresholdGroup, index) {
  thresholdGroup.remove();
  thresholds.splice(index - 1, 1);
  thresholdCount--;
  
  // Update remaining threshold numbers
  const thresholdGroups = selectAll('.threshold-group');
  thresholdGroups.forEach((group, i) => {
    const label = group.select('label');
    const colorLabel = group.select('.color-option label');
    label.html(`Threshold ${i + 1}: <span id="threshold${i + 1}-value">${thresholds[i].level}</span>`);
    colorLabel.html(`Color ${i + 1}:`);
  });
}

function setup() {
  pixelDensity(1);
  
  // Create canvas with initial size
  let canvas = createCanvas(800, 400);
  canvas.parent('canvas-container');
  
  // Get DOM elements
  threshold1Slider = select('#threshold1-slider');
  threshold1Value = select('#threshold1-value');
  threshold1ColorPicker = select('#threshold1-color-picker');
  threshold1Hex = select('#threshold1-hex');
  threshold2Slider = select('#threshold2-slider');
  threshold2Value = select('#threshold2-value');
  threshold2ColorPicker = select('#threshold2-color-picker');
  threshold2Hex = select('#threshold2-hex');
  backgroundColorPicker = select('#background-color-picker');
  backgroundHex = select('#background-hex');
  saveButton = select('#save-btn');
  imageUpload = select('#image-upload');
  fileName = select('#file-name');
  pixelateButton = select('#pixelate-btn');
  
  // Set up event listeners
  threshold1Slider.input(updateThreshold1Value);
  threshold1ColorPicker.input(updateThreshold1Color);
  threshold1Hex.input(updateThreshold1Hex);
  threshold2Slider.input(updateThreshold2Value);
  threshold2ColorPicker.input(updateThreshold2Color);
  threshold2Hex.input(updateThreshold2Hex);
  backgroundColorPicker.input(updateBackgroundColor);
  backgroundHex.input(updateBackgroundHex);
  saveButton.mousePressed(saveDitheredImage);
  imageUpload.input(handleFileUpload);
  pixelateButton.mousePressed(togglePixelation);
  
  // Add threshold button listener
  select('#add-threshold').mousePressed(addNewThreshold);
  
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
  
  // Create a copy of the image for processing
  let processed = createGraphics(img.width, img.height);
  processed.image(img, 0, 0);
  
  if (isPixelated) {
    // Apply pixelation
    processed.loadPixels();
    let pixelated = createGraphics(img.width, img.height);
    pixelated.background(255);
    
    for (let x = 0; x < processed.width; x += pixelationLevel) {
      for (let y = 0; y < processed.height; y += pixelationLevel) {
        // Get the color at this pixel
        let i = (x + y * processed.width) * 4;
        let r = processed.pixels[i];
        let g = processed.pixels[i + 1];
        let b = processed.pixels[i + 2];
        let a = processed.pixels[i + 3];
        
        // Fill the pixel block with the sampled color
        pixelated.fill(r, g, b, a);
        pixelated.noStroke();
        pixelated.rect(x, y, pixelationLevel, pixelationLevel);
      }
    }
    
    processed = pixelated;
  }
  
  processed.loadPixels();
  
  // Apply multi-threshold coloring
  for (let i = 0; i < processed.pixels.length; i += 4) {
    const gray = (processed.pixels[i] + processed.pixels[i + 1] + processed.pixels[i + 2]) / 3;
    
    // Find the appropriate threshold level
    let colorIndex = thresholds.length;
    for (let j = 0; j < thresholds.length; j++) {
      if (gray <= thresholds[j].level) {
        colorIndex = j;
        break;
      }
    }
    
    // Convert hex color to RGB
    const color = hexToRgb(colorIndex < thresholds.length ? thresholds[colorIndex].color : backgroundColor);
    
    // Apply the color
    processed.pixels[i] = color.r;
    processed.pixels[i + 1] = color.g;
    processed.pixels[i + 2] = color.b;
  }
  
  processed.updatePixels();
  
  // Draw the processed image
  image(processed, originalWidth * scale, 0, originalWidth * scale, originalHeight * scale);
  
  // Draw labels
  fill(0);
  textSize(16 * scale);
  textAlign(CENTER);
  text("Original Image", originalWidth * scale / 2, 20 * scale);
  text("Processed Image", originalWidth * scale + originalWidth * scale / 2, 20 * scale);
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
  
  // Create a temporary canvas for the processed image
  let tempCanvas = createGraphics(img.width, img.height);
  tempCanvas.background(255);
  
  // Process the image
  let processed = createGraphics(img.width, img.height);
  processed.image(img, 0, 0);
  
  if (isPixelated) {
    // Apply pixelation
    processed.loadPixels();
    let pixelated = createGraphics(img.width, img.height);
    pixelated.background(255);
    
    for (let x = 0; x < processed.width; x += pixelationLevel) {
      for (let y = 0; y < processed.height; y += pixelationLevel) {
        // Get the color at this pixel
        let i = (x + y * processed.width) * 4;
        let r = processed.pixels[i];
        let g = processed.pixels[i + 1];
        let b = processed.pixels[i + 2];
        let a = processed.pixels[i + 3];
        
        // Fill the pixel block with the sampled color
        pixelated.fill(r, g, b, a);
        pixelated.noStroke();
        pixelated.rect(x, y, pixelationLevel, pixelationLevel);
      }
    }
    
    processed = pixelated;
  }
  
  processed.loadPixels();
  
  // Apply multi-threshold coloring
  for (let i = 0; i < processed.pixels.length; i += 4) {
    const gray = (processed.pixels[i] + processed.pixels[i + 1] + processed.pixels[i + 2]) / 3;
    
    // Find the appropriate threshold level
    let colorIndex = thresholds.length;
    for (let j = 0; j < thresholds.length; j++) {
      if (gray <= thresholds[j].level) {
        colorIndex = j;
        break;
      }
    }
    
    // Convert hex color to RGB
    const color = hexToRgb(colorIndex < thresholds.length ? thresholds[colorIndex].color : backgroundColor);
    
    // Apply the color
    processed.pixels[i] = color.r;
    processed.pixels[i + 1] = color.g;
    processed.pixels[i + 2] = color.b;
  }
  
  processed.updatePixels();
  tempCanvas.image(processed, 0, 0);
  
  // Save the temporary canvas
  saveCanvas(tempCanvas, 'processed-image', 'png');
}

function loadDefaultImage() {
  // Load a default image for preview
  img = loadImage('https://picsum.photos/800/400', onImageLoaded);
}

function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function updateBackgroundHex() {
  const hex = backgroundHex.value();
  if (isValidHex(hex)) {
    backgroundColor = hex;
    backgroundColorPicker.value(hex);
  }
} 