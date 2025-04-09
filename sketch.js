// Image Generator
// A modern UI for applying effects to images

let img;
let canvasWidth;
let canvasHeight;
let backgroundColor = '#FFFFFF';
let originalWidth;
let originalHeight;
let scale = 1;
let imageLoaded = false;
let processedGraphics; // Reusable graphics buffer
let canvas;

// Batch processing variables
let imageQueue = [];
let isProcessingQueue = false;
let currentQueueIndex = 0;
let totalImages = 0;

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
let randomButton;
let newImageButton;
let batchProgressBar;
let batchProgressText;

// Threshold configuration
let thresholds = [
  { level: 26, color: '#000000' },
  { level: 71, color: '#333333' },
  { level: 91, color: '#666666' },
  { level: 128, color: '#999999' },
  { level: 167, color: '#CCCCCC' },
  { level: 202, color: '#FFFFFF' }
];

let thresholdCount = thresholds.length;

// Settings management
let settingsNameInput;
let saveSettingsButton;
let savedSettingsSelect;
let deleteSettingsButton;

// Color palette
let colorPalette = [];
let paletteColorPicker;
let paletteHex;
let addColorButton;
let colorPaletteContainer;

// Add new variables for pixel sorting
let isPixelSorted = true;
let pixelSortHeight = 0.3; // Percentage of image height to sort (30%)

// Add new variables for pixelation
let isPixelated = false;
let pixelationLevel = 8;
let pixelatedGraphics;

// Add stroke variables
let hasStroke = false;
let strokeColor = '#000000';

// Add new variables for stripe patterns
let hasVerticalStripes = true;
let hasHorizontalStripes = true;

// Add at the top with other global variables
let previewMode = true;
let zip = null;
let processButton;

// Add to the global variables section
let singleImageUpload;

// Random color generator using palette
function getRandomColor() {
  if (colorPalette.length === 0) {
    // Fallback to random hex if no colors in palette
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

function addColorToPalette() {
  const color = paletteHex.value();
  if (isValidHex(color) && !colorPalette.includes(color)) {
    colorPalette.push(color);
    updateColorPaletteUI();
    saveColorPalette();
  }
}

function removeColorFromPalette(color) {
  colorPalette = colorPalette.filter(c => c !== color);
  updateColorPaletteUI();
  saveColorPalette();
}

function updateColorPaletteUI() {
  colorPaletteContainer.html('');
  colorPalette.forEach(color => {
    const swatch = createDiv('');
    swatch.class('color-swatch');
    swatch.style('background-color', color);
    swatch.mousePressed(() => removeColorFromPalette(color));
    colorPaletteContainer.child(swatch);
  });
}

function saveColorPalette() {
  localStorage.setItem('colorPalette', JSON.stringify(colorPalette));
}

function loadColorPalette() {
  const savedPalette = localStorage.getItem('colorPalette');
  if (savedPalette) {
    colorPalette = JSON.parse(savedPalette);
    updateColorPaletteUI();
  }
}

// Random threshold generator
function generateRandomThresholds() {
    // Always generate 6 thresholds
    const numThresholds = 6;
    const newThresholds = [];
    
    // Fixed threshold values following Merope8 pattern exactly
    const thresholdValues = [
        26,   // First threshold like Merope8
        71,   // Second threshold like Merope8
        91,   // Third threshold like Merope8
        128,  // Fourth threshold like Merope8
        167,  // Fifth threshold like Merope8
        202   // Maximum like Merope8
    ];
    
    // Generate random colors for each threshold
    for (let i = 0; i < numThresholds; i++) {
        // Generate random RGB values
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        // Convert to hex
        const color = '#' + 
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0');
        
        newThresholds.push({
            level: thresholdValues[i],
            color: color
        });
    }
    
    return newThresholds;
}

// Randomize all settings
function randomizeSettings() {
  // Randomize background color
  backgroundColor = getRandomColor();
  backgroundColorPicker.value(backgroundColor);
  backgroundHex.value(backgroundColor);
  
  // Generate and apply random thresholds
  thresholds = generateRandomThresholds();
  thresholdCount = thresholds.length;
  
  // Update threshold UI
  updateThresholdUI();
  
  // Save settings
  saveSettings();
}

// Settings management
function saveSettings() {
  const settings = {
    backgroundColor,
    thresholds,
    isPixelated,
    pixelationLevel,
    hasStroke,
    strokeColor,
    hasVerticalStripes,
    hasHorizontalStripes
  };
  
  // Save to localStorage
  localStorage.setItem('imageGeneratorSettings', JSON.stringify(settings));
}

function loadSettings() {
  const savedSettings = localStorage.getItem('imageGeneratorSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    
    // Apply settings to variables
    backgroundColor = settings.backgroundColor;
    thresholds = settings.thresholds;
    isPixelated = settings.isPixelated || false;
    pixelationLevel = settings.pixelationLevel || 8;
    hasStroke = settings.hasStroke || false;
    strokeColor = settings.strokeColor || '#000000';
    hasVerticalStripes = settings.hasVerticalStripes !== undefined ? settings.hasVerticalStripes : true;
    hasHorizontalStripes = settings.hasHorizontalStripes !== undefined ? settings.hasHorizontalStripes : true;
    
    // Update UI elements if they exist
    if (backgroundColorPicker) {
      backgroundColorPicker.value(backgroundColor);
      backgroundHex.value(backgroundColor);
    }
    
    // Update threshold UI if container exists
    if (select('#threshold-container')) {
      updateThresholdUI();
    }
    
    // Update pixelation UI
    const pixelateButton = select('#pixelate-btn');
    const pixelationSlider = select('#pixelation-slider');
    const pixelationValue = select('#pixelation-value');
    
    if (pixelateButton) {
      pixelateButton.class(isPixelated ? 'effect-button active' : 'effect-button');
    }
    if (pixelationSlider) {
      pixelationSlider.value(pixelationLevel);
    }
    if (pixelationValue) {
      pixelationValue.html(pixelationLevel);
    }
    
    // Update stroke UI
    const strokeCheckbox = select('#stroke-checkbox');
    const strokeColorPicker = select('#stroke-color-picker');
    const strokeHex = select('#stroke-hex');
    
    if (strokeCheckbox) {
      strokeCheckbox.checked(hasStroke);
    }
    if (strokeColorPicker) {
      strokeColorPicker.value(strokeColor);
    }
    if (strokeHex) {
      strokeHex.value(strokeColor);
    }
    
    // Update stripe pattern UI
    const verticalStripesCheckbox = select('#vertical-stripes-checkbox');
    const horizontalStripesCheckbox = select('#horizontal-stripes-checkbox');
    
    if (verticalStripesCheckbox) {
      verticalStripesCheckbox.checked(hasVerticalStripes);
    }
    if (horizontalStripesCheckbox) {
      horizontalStripesCheckbox.checked(hasHorizontalStripes);
    }
  }
}

function updateThresholdUI() {
    // Clear existing thresholds
    const container = select('#threshold-container');
    container.html('');
    thresholdCount = thresholds.length;
    
    // Create threshold elements for each saved threshold
    thresholds.forEach((threshold, index) => {
        const thresholdGroup = createDiv('');
        thresholdGroup.class('threshold-group');
        
        // Create remove button
        const removeButton = createButton('×');
        removeButton.class('remove-threshold');
        removeButton.mousePressed(() => removeThreshold(thresholdGroup, index + 1));
        
        // Create label
        const label = createElement('label', `Threshold ${index + 1}: `);
        const valueSpan = createSpan(threshold.level);
        valueSpan.id(`threshold${index + 1}-value`);
        label.child(valueSpan);
        label.attribute('for', `threshold${index + 1}-slider`);
        
        // Create slider
        const slider = createInput(threshold.level.toString(), 'range');
        slider.id(`threshold${index + 1}-slider`);
        slider.class('slider');
        slider.attribute('min', 0);
        slider.attribute('max', 255);
        slider.input(() => updateThresholdValue(index + 1, slider, valueSpan));
        
        // Create color option
        const colorOption = createDiv('');
        colorOption.class('color-option');
        
        const colorLabel = createElement('label', `Color ${index + 1}:`);
        colorLabel.attribute('for', `threshold${index + 1}-color-picker`);
        
        const colorPicker = createInput(threshold.color, 'color');
        colorPicker.id(`threshold${index + 1}-color-picker`);
        colorPicker.input(() => updateThresholdColor(index + 1, colorPicker, hexInput));
        
        const hexInput = createInput(threshold.color, 'text');
        hexInput.id(`threshold${index + 1}-hex`);
        hexInput.class('hex-input');
        hexInput.attribute('maxlength', 7);
        hexInput.input(() => updateThresholdHex(index + 1, hexInput, colorPicker));
        
        // Create swap button if this is not the last threshold
        if (index < thresholds.length - 1) {
            const swapButton = createButton('⇄');
            swapButton.class('swap-colors');
            swapButton.mousePressed(() => swapColors(index + 1, index + 2));
            colorOption.child(swapButton);
        }
        
        // Assemble the elements
        colorOption.child(colorLabel);
        colorOption.child(colorPicker);
        colorOption.child(hexInput);
        
        thresholdGroup.child(removeButton);
        thresholdGroup.child(label);
        thresholdGroup.child(slider);
        thresholdGroup.child(colorOption);
        
        container.child(thresholdGroup);
    });
    
    // Add "Add New Threshold" button at the bottom
    const addButtonContainer = createDiv('');
    addButtonContainer.class('add-threshold-container');
    
    const addButton = createButton('+ Add New Threshold');
    addButton.class('add-threshold-button');
    addButton.mousePressed(addNewThreshold);
    
    addButtonContainer.child(addButton);
    container.child(addButtonContainer);
}

// Add CSS styles for the new elements
const style = document.createElement('style');
style.textContent = `
    .add-threshold-container {
        margin-top: 20px;
        text-align: center;
    }
    
    .add-threshold-button {
        background-color: #333;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
    }
    
    .add-threshold-button:hover {
        background-color: #444;
    }
    
    .swap-colors {
        background-color: #333;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 8px;
        transition: background-color 0.2s;
    }
    
    .swap-colors:hover {
        background-color: #444;
    }
`;
document.head.appendChild(style);

// Threshold management functions
function updateThresholdValue(index, slider, valueSpan) {
  let value = parseInt(slider.value());
  
  // Ensure the highest threshold doesn't exceed 210
  if (index === thresholds.length) {
    value = Math.min(value, 210);
    slider.value(value);
  }
  
  valueSpan.html(value);
  thresholds[index - 1].level = value;
  saveSettings();
}

function updateThresholdColor(index, colorPicker, hexInput) {
  const color = colorPicker.value();
  thresholds[index - 1].color = color;
  hexInput.value(color);
  saveSettings();
}

function updateThresholdHex(index, hexInput, colorPicker) {
  const hex = hexInput.value();
  if (isValidHex(hex)) {
    thresholds[index - 1].color = hex;
    colorPicker.value(hex);
    saveSettings();
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
  saveSettings();
}

function updatePixelationLevel() {
  const pixelationSlider = select('#pixelation-slider');
  if (pixelationSlider) {
    pixelationLevel = parseInt(pixelationSlider.value());
    const pixelationValue = select('#pixelation-value');
    if (pixelationValue) {
      pixelationValue.html(pixelationLevel);
    }
  }
  saveSettings();
}

function togglePixelation() {
  isPixelated = !isPixelated;
  const pixelateButton = select('#pixelate-btn');
  if (pixelateButton) {
    pixelateButton.class(isPixelated ? 'effect-button active' : 'effect-button');
  }
  saveSettings();
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
  const slider = createInput('128', 'range');
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

function generateRandomName() {
    const adjectives = ['Cool', 'Awesome', 'Great', 'Amazing', 'Fantastic', 'Super', 'Epic', 'Incredible'];
    const nouns = ['Image', 'Art', 'Creation', 'Design', 'Work', 'Piece', 'Masterpiece', 'Photo'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}`;
}

function saveCurrentSettings() {
  const settingsName = settingsNameInput.value() || generateRandomName();
  const settings = {
    name: settingsName,
    date: new Date().toISOString(),
    backgroundColor,
    thresholds: JSON.parse(JSON.stringify(thresholds)),
    isPixelated,
    pixelationLevel,
    hasStroke,
    strokeColor,
    hasVerticalStripes,
    hasHorizontalStripes
  };
  
  // Get existing settings
  let savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
  
  // Check if name already exists
  const existingIndex = savedSettings.findIndex(s => s.name === settingsName);
  if (existingIndex !== -1) {
    savedSettings[existingIndex] = settings;
  } else {
    savedSettings.push(settings);
  }
  
  // Sort by date (newest first)
  savedSettings.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Save to localStorage
  localStorage.setItem('savedSettings', JSON.stringify(savedSettings));
  
  // Update select options
  updateSettingsSelect();
  
  // Clear input
  settingsNameInput.value('');
}

function updateSettingsSelect() {
  const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
  const select = document.getElementById('saved-settings');
  
  if (select) {
    // Clear existing options
    select.innerHTML = '<option value="">Load saved settings...</option>';
    
    // Add saved settings as options
    savedSettings.forEach(settings => {
      const option = document.createElement('option');
      option.value = settings.name;
      option.textContent = settings.name;
      select.appendChild(option);
    });
  }
}

function loadSelectedSettings() {
  const selectedName = savedSettingsSelect.value();
  if (!selectedName) return;
  
  const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
  const settings = savedSettings.find(s => s.name === selectedName);
  
  if (settings) {
    // Apply settings
    backgroundColor = settings.backgroundColor;
    thresholds = JSON.parse(JSON.stringify(settings.thresholds));
    isPixelated = settings.isPixelated || false;
    pixelationLevel = settings.pixelationLevel || 8;
    hasStroke = settings.hasStroke || false;
    strokeColor = settings.strokeColor || '#000000';
    hasVerticalStripes = settings.hasVerticalStripes !== undefined ? settings.hasVerticalStripes : true;
    hasHorizontalStripes = settings.hasHorizontalStripes !== undefined ? settings.hasHorizontalStripes : true;
    
    // Update UI
    if (backgroundColorPicker) {
      backgroundColorPicker.value(backgroundColor);
      backgroundHex.value(backgroundColor);
    }
    
    // Update threshold UI
    updateThresholdUI();
    
    // Update pixelation UI
    const pixelateButton = select('#pixelate-btn');
    const pixelationSlider = select('#pixelation-slider');
    const pixelationValue = select('#pixelation-value');
    
    if (pixelateButton) {
      pixelateButton.class(isPixelated ? 'effect-button active' : 'effect-button');
    }
    if (pixelationSlider) {
      pixelationSlider.value(pixelationLevel);
    }
    if (pixelationValue) {
      pixelationValue.html(pixelationLevel);
    }
    
    // Update stroke UI
    const strokeCheckbox = select('#stroke-checkbox');
    const strokeColorPicker = select('#stroke-color-picker');
    const strokeHex = select('#stroke-hex');
    
    if (strokeCheckbox) {
      strokeCheckbox.checked(hasStroke);
    }
    if (strokeColorPicker) {
      strokeColorPicker.value(strokeColor);
    }
    if (strokeHex) {
      strokeHex.value(strokeColor);
    }
    
    // Update stripe pattern UI
    const verticalStripesCheckbox = select('#vertical-stripes-checkbox');
    const horizontalStripesCheckbox = select('#horizontal-stripes-checkbox');
    
    if (verticalStripesCheckbox) {
      verticalStripesCheckbox.checked(hasVerticalStripes);
    }
    if (horizontalStripesCheckbox) {
      horizontalStripesCheckbox.checked(hasHorizontalStripes);
    }
    
    // Save current state
    saveSettings();
  }
}

function deleteSelectedSettings() {
  const selectedName = savedSettingsSelect.value();
  if (!selectedName) return;
  
  if (confirm(`Are you sure you want to delete "${selectedName}"?`)) {
    let savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    savedSettings = savedSettings.filter(s => s.name !== selectedName);
    localStorage.setItem('savedSettings', JSON.stringify(savedSettings));
    updateSettingsSelect();
  }
}

function getLightestAndDarkestColors() {
    let lightestColor = '#FFFFFF';
    let darkestColor = '#000000';
    let lightestBrightness = 0;
    let darkestBrightness = 255;
    
    // Check all thresholds
    for (let i = 0; i < thresholds.length; i++) {
        const color = hexToRgb(thresholds[i].color);
        const brightness = (color.r + color.g + color.b) / 3;
        
        if (brightness > lightestBrightness) {
            lightestBrightness = brightness;
            lightestColor = thresholds[i].color;
        }
        
        if (brightness < darkestBrightness) {
            darkestBrightness = brightness;
            darkestColor = thresholds[i].color;
        }
    }
    
    return { lightestColor, darkestColor };
}

function loadNewRandomImage() {
    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    if (loadingScreen && loadingText) {
        loadingScreen.style.width = canvasWidth + 'px';
        loadingScreen.style.height = canvasHeight + 'px';
        loadingScreen.style.backgroundColor = '#000000';
        loadingText.style.color = '#FFFFFF';
        loadingScreen.style.display = 'flex';
    }
    
    // Load a new random flower image
    const timestamp = new Date().getTime();
    img = loadImage(`https://picsum.photos/800/800?random=${timestamp}&category=flowers`, () => {
        // Store original dimensions
        originalWidth = img.width;
        originalHeight = img.height;
        
        // Calculate initial scale
        calculateScale();
        
        // Resize canvas
        resizeCanvas(canvasWidth, canvasHeight);
        
        // Create new graphics buffers
        if (processedGraphics) {
            processedGraphics.remove();
        }
        processedGraphics = createGraphics(img.width, img.height);
        
        // Hide loading screen
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    });
}

function handleResize() {
    if (imageLoaded) {
        calculateScale();
        resizeCanvas(canvasWidth, canvasHeight);
    }
}

function setup() {
    // Setup main canvas with willReadFrequently attribute
    pixelDensity(1);
    canvas = createCanvas(800, 800);
    canvas.parent('canvas-container');
    const ctx = canvas.elt.getContext('2d');
    ctx.canvas.willReadFrequently = true;
    
    // Create graphics buffers with willReadFrequently
    processedGraphics = createGraphics(800, 800);
    const processedCtx = processedGraphics.elt.getContext('2d');
    processedCtx.canvas.willReadFrequently = true;

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
    singleImageUpload = select('#single-image-upload');
    fileName = select('#file-name');
    randomButton = select('#random-btn');
    newImageButton = select('#new-image-btn');
    
    // Get settings management elements
    settingsNameInput = select('#settings-name');
    saveSettingsButton = select('#save-settings-btn');
    savedSettingsSelect = select('#saved-settings');
    deleteSettingsButton = select('#delete-settings-btn');
    
    // Get pixelation elements
    const pixelateButton = select('#pixelate-btn');
    const pixelationSlider = select('#pixelation-slider');
    const pixelationValue = select('#pixelation-value');
    
    // Get stroke elements
    const strokeCheckbox = select('#stroke-checkbox');
    const strokeColorPicker = select('#stroke-color-picker');
    const strokeHex = select('#stroke-hex');
    
    // Get stripe pattern elements
    const verticalStripesCheckbox = select('#vertical-stripes-checkbox');
    const horizontalStripesCheckbox = select('#horizontal-stripes-checkbox');
    
    // Set up pixelation event listeners
    if (pixelateButton) {
        pixelateButton.mousePressed(togglePixelation);
    }
    if (pixelationSlider) {
        pixelationSlider.input(updatePixelationLevel);
    }
    
    // Set up stroke event listeners
    if (strokeCheckbox) {
        strokeCheckbox.changed(toggleStroke);
    }
    if (strokeColorPicker) {
        strokeColorPicker.input(updateStrokeColor);
    }
    if (strokeHex) {
        strokeHex.input(updateStrokeHex);
    }
    
    // Set up stripe pattern event listeners
    if (verticalStripesCheckbox) {
        verticalStripesCheckbox.changed(toggleVerticalStripes);
    }
    if (horizontalStripesCheckbox) {
        horizontalStripesCheckbox.changed(toggleHorizontalStripes);
    }
    
    // Set up settings event listeners
    if (saveSettingsButton) {
        saveSettingsButton.mousePressed(saveCurrentSettings);
    }
    if (savedSettingsSelect) {
        savedSettingsSelect.changed(loadSelectedSettings);
    }
    if (deleteSettingsButton) {
        deleteSettingsButton.mousePressed(deleteSelectedSettings);
    }
    
    // Set up event listeners
    if (threshold1Slider) threshold1Slider.input(updateThreshold1Value);
    if (threshold1ColorPicker) threshold1ColorPicker.input(updateThreshold1Color);
    if (threshold1Hex) threshold1Hex.input(updateThreshold1Hex);
    if (threshold2Slider) threshold2Slider.input(updateThreshold2Value);
    if (threshold2ColorPicker) threshold2ColorPicker.input(updateThreshold2Color);
    if (threshold2Hex) threshold2Hex.input(updateThreshold2Hex);
    if (backgroundColorPicker) backgroundColorPicker.input(updateBackgroundColor);
    if (backgroundHex) backgroundHex.input(updateBackgroundHex);
    if (saveButton) saveButton.mousePressed(saveDitheredImage);
    if (singleImageUpload) singleImageUpload.input(handleSingleImageUpload);
    if (randomButton) randomButton.mousePressed(randomizeSettings);
    if (newImageButton) newImageButton.mousePressed(loadNewRandomImage);
    
    // Add window resize event listener
    window.addEventListener('resize', handleResize);
    
    // Load saved settings
    loadSettings();
    
    // Update saved settings select
    updateSettingsSelect();
    
    // Load default image
    loadDefaultImage();
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
    
    // Create new graphics buffers
    if (processedGraphics) {
        processedGraphics.remove();
    }
    processedGraphics = createGraphics(img.width, img.height);
    const ctx = processedGraphics.elt.getContext('2d');
    ctx.canvas.willReadFrequently = true;
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

function draw() {
    background(0);
    
    if (!imageLoaded) {
        fill(255);
        textSize(16);
        textAlign(CENTER, CENTER);
        text("Please upload an image or wait for default image to load", width/2, height/2);
        return;
    }
    
    // Create graphics buffer only once when needed
    if (!processedGraphics && img) {
        processedGraphics = createGraphics(img.width, img.height);
        const ctx = processedGraphics.elt.getContext('2d');
        ctx.canvas.willReadFrequently = true;
    }
    
    // Clear previous content
    processedGraphics.clear();
    
    // Apply pixelation if enabled
    if (isPixelated) {
        if (!pixelatedGraphics || pixelatedGraphics.width !== img.width || pixelatedGraphics.height !== img.height) {
            if (pixelatedGraphics) {
                pixelatedGraphics.remove();
            }
            pixelatedGraphics = createGraphics(img.width, img.height);
        }
        
        pixelatedGraphics.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
        pixelatedGraphics.loadPixels();
        
        for (let y = 0; y < img.height; y += pixelationLevel) {
            for (let x = 0; x < img.width; x += pixelationLevel) {
                const i = (x + y * img.width) * 4;
                const r = pixelatedGraphics.pixels[i];
                const g = pixelatedGraphics.pixels[i + 1];
                const b = pixelatedGraphics.pixels[i + 2];
                
                for (let py = 0; py < pixelationLevel && y + py < img.height; py++) {
                    for (let px = 0; px < pixelationLevel && x + px < img.width; px++) {
                        const pi = (x + px + (y + py) * img.width) * 4;
                        pixelatedGraphics.pixels[pi] = r;
                        pixelatedGraphics.pixels[pi + 1] = g;
                        pixelatedGraphics.pixels[pi + 2] = b;
                    }
                }
            }
        }
        
        pixelatedGraphics.updatePixels();
        processedGraphics.image(pixelatedGraphics, 0, 0);
    } else {
        processedGraphics.image(img, 0, 0);
    }
    
    processedGraphics.loadPixels();
    
    // Create a copy of the pixels array to avoid modifying it while reading
    const originalPixels = processedGraphics.pixels.slice();
    
    // Find the lightest threshold color
    let lightestColor = backgroundColor;
    let lightestBrightness = 0;
    
    // Calculate brightness for each threshold color
    for (let i = 0; i < thresholds.length; i++) {
        const color = hexToRgb(thresholds[i].color);
        const brightness = (color.r + color.g + color.b) / 3;
        if (brightness > lightestBrightness) {
            lightestBrightness = brightness;
            lightestColor = thresholds[i].color;
        }
    }
    
    // Apply multi-threshold coloring
    for (let i = 0; i < processedGraphics.pixels.length; i += 4) {
        const gray = (originalPixels[i] + originalPixels[i + 1] + originalPixels[i + 2]) / 3;
        const alpha = originalPixels[i + 3]; // Get original alpha value
        
        // Find the appropriate threshold level
        let colorIndex = thresholds.length;
        for (let j = 0; j < thresholds.length; j++) {
            if (gray <= thresholds[j].level) {
                colorIndex = j;
                break;
            }
        }
        
        if (colorIndex < thresholds.length) {
            const threshold = thresholds[colorIndex];
            const x = (i / 4) % processedGraphics.width;
            const y = Math.floor((i / 4) / processedGraphics.width);
            
            if (colorIndex === 1 && hasVerticalStripes) {
                // Second threshold: vertical stripes pattern
                const blockSize = 2;
                const isEvenBlock = Math.floor(x / blockSize) % 2 === 0;
                const color = isEvenBlock ? hexToRgb(threshold.color) : hexToRgb(thresholds[0].color);
                
                processedGraphics.pixels[i] = color.r;
                processedGraphics.pixels[i + 1] = color.g;
                processedGraphics.pixels[i + 2] = color.b;
                processedGraphics.pixels[i + 3] = alpha;
            } else {
                // Other thresholds: solid color
                const color = hexToRgb(threshold.color);
                processedGraphics.pixels[i] = color.r;
                processedGraphics.pixels[i + 1] = color.g;
                processedGraphics.pixels[i + 2] = color.b;
                processedGraphics.pixels[i + 3] = alpha;
            }
        } else {
            // For background, apply horizontal stripes pattern using background color and lightest threshold color
            const x = (i / 4) % processedGraphics.width;
            const y = Math.floor((i / 4) / processedGraphics.width);
            
            if (hasHorizontalStripes) {
                // Create horizontal stripes pattern
                const blockSize = 2; // Height of each stripe
                const isEvenBlock = Math.floor(y / blockSize) % 2 === 0;
                const color = isEvenBlock ? hexToRgb(backgroundColor) : hexToRgb(lightestColor);
                
                processedGraphics.pixels[i] = color.r;
                processedGraphics.pixels[i + 1] = color.g;
                processedGraphics.pixels[i + 2] = color.b;
                processedGraphics.pixels[i + 3] = alpha;
            } else {
                // Solid background color
                const color = hexToRgb(backgroundColor);
                processedGraphics.pixels[i] = color.r;
                processedGraphics.pixels[i + 1] = color.g;
                processedGraphics.pixels[i + 2] = color.b;
                processedGraphics.pixels[i + 3] = alpha;
            }
        }
    }
    
    processedGraphics.updatePixels();
    
    // Apply stroke if enabled
    if (hasStroke) {
        // Create a temporary graphics buffer for the stroke
        let strokeGraphics = createGraphics(processedGraphics.width, processedGraphics.height);
        strokeGraphics.clear(); // Clear with transparency
        strokeGraphics.copy(processedGraphics, 0, 0, processedGraphics.width, processedGraphics.height, 0, 0, processedGraphics.width, processedGraphics.height);
        strokeGraphics.loadPixels();
        
        // Create a copy of the pixels array to avoid modifying it while reading
        const originalPixels = strokeGraphics.pixels.slice();
        
        // Apply stroke to edges
        for (let y = 1; y < processedGraphics.height - 1; y++) {
            for (let x = 1; x < processedGraphics.width - 1; x++) {
                const i = (x + y * processedGraphics.width) * 4;
                
                // Get the gray value of the current pixel
                const gray = (originalPixels[i] + originalPixels[i + 1] + originalPixels[i + 2]) / 3;
                
                // Find the appropriate threshold level
                let colorIndex = thresholds.length;
                for (let j = 0; j < thresholds.length; j++) {
                    if (gray <= thresholds[j].level) {
                        colorIndex = j;
                        break;
                    }
                }
                
                // Check if current pixel is different from any of its neighbors
                const currentColor = {
                    r: originalPixels[i],
                    g: originalPixels[i + 1],
                    b: originalPixels[i + 2],
                    a: originalPixels[i + 3]
                };
                const leftColor = {
                    r: originalPixels[i - 4],
                    g: originalPixels[i - 3],
                    b: originalPixels[i - 2],
                    a: originalPixels[i - 1]
                };
                const rightColor = {
                    r: originalPixels[i + 4],
                    g: originalPixels[i + 5],
                    b: originalPixels[i + 6],
                    a: originalPixels[i + 7]
                };
                const topColor = {
                    r: originalPixels[i - processedGraphics.width * 4],
                    g: originalPixels[i - processedGraphics.width * 4 + 1],
                    b: originalPixels[i - processedGraphics.width * 4 + 2],
                    a: originalPixels[i - processedGraphics.width * 4 + 3]
                };
                const bottomColor = {
                    r: originalPixels[i + processedGraphics.width * 4],
                    g: originalPixels[i + processedGraphics.width * 4 + 1],
                    b: originalPixels[i + processedGraphics.width * 4 + 2],
                    a: originalPixels[i + processedGraphics.width * 4 + 3]
                };
                
                // Check if this pixel is part of a stripes pattern
                const isVerticalStripes = Math.floor(x / 2) % 2 === 0;
                const isHorizontalStripes = Math.floor(y / 2) % 2 === 0;
                const isInStripesPattern = isVerticalStripes || isHorizontalStripes;
                
                // Check if this pixel is part of the background
                const isBackground = colorIndex === thresholds.length;
                
                // Only apply stroke if it's a corner or edge pixel, not transparent, not part of stripes pattern, and not background
                const isLeftEdge = !colorsEqual(currentColor, leftColor);
                const isRightEdge = !colorsEqual(currentColor, rightColor);
                const isTopEdge = !colorsEqual(currentColor, topColor);
                const isBottomEdge = !colorsEqual(currentColor, bottomColor);
                
                if (currentColor.a > 0 && !isInStripesPattern && !isBackground && 
                    ((isLeftEdge && isTopEdge) || (isLeftEdge && isBottomEdge) || 
                    (isRightEdge && isTopEdge) || (isRightEdge && isBottomEdge) ||
                    (isLeftEdge && !isRightEdge && !isTopEdge && !isBottomEdge) ||
                    (isRightEdge && !isLeftEdge && !isTopEdge && !isBottomEdge) ||
                    (isTopEdge && !isLeftEdge && !isRightEdge && !isBottomEdge) ||
                    (isBottomEdge && !isLeftEdge && !isRightEdge && !isTopEdge))) {
                    const stroke = hexToRgb(strokeColor);
                    processedGraphics.pixels[i] = stroke.r;
                    processedGraphics.pixels[i + 1] = stroke.g;
                    processedGraphics.pixels[i + 2] = stroke.b;
                    processedGraphics.pixels[i + 3] = currentColor.a; // Preserve original alpha
                }
            }
        }
        
        processedGraphics.updatePixels();
        strokeGraphics.remove();
    }
    
    // Draw the processed image at the correct position and scale
    image(processedGraphics, 0, 0, width, height);
}

function handleSingleImageUpload() {
    const file = singleImageUpload.elt.files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }

    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = function(event) {
        // Load and process the image
        loadImage(event.target.result, (loadedImg) => {
            img = loadedImg;
            originalWidth = img.width;
            originalHeight = img.height;
            
            // Calculate scale and resize canvas
            calculateScale();
            resizeCanvas(canvasWidth, canvasHeight);
            
            // Create new graphics buffer
            if (processedGraphics) {
                processedGraphics.remove();
            }
            processedGraphics = createGraphics(img.width, img.height);
            const ctx = processedGraphics.elt.getContext('2d');
            ctx.canvas.willReadFrequently = true;
            
            // Process the image
            imageLoaded = true;
            fileName.html(`Preview: ${file.name}`);
            
            // Force one draw cycle to process the image
            draw();
        });
    };
    
    reader.readAsDataURL(file);
}

function handleFolderUpload() {
    const files = imageUpload.elt.files;
    if (files.length === 0) return;

    // Clear existing queue
    imageQueue = [];
    currentQueueIndex = 0;
    isProcessingQueue = true;
    
    // Filter only image files
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            imageQueue.push(file);
        }
    }
    
    totalImages = imageQueue.length;
    
    if (totalImages === 0) {
        alert('No valid image files found');
        return;
    }
    
    // Update UI to show total images
    fileName.html(`Preview mode: ${totalImages} images loaded`);
    
    // Initialize progress bar if it doesn't exist
    if (!batchProgressBar) {
        const uploadSection = select('#file-upload-section');
        if (!uploadSection) {
            // Create the section if it doesn't exist
            const controlPanel = select('.controls-panel');
            if (controlPanel) {
                const section = createDiv('');
                section.id('file-upload-section');
                section.parent(controlPanel);
            }
        }
        
        // Create progress elements
        batchProgressBar = createDiv('');
        batchProgressBar.class('batch-progress-bar');
        batchProgressBar.parent('#file-upload-section');
        
        batchProgressText = createDiv('');
        batchProgressText.class('batch-progress-text');
        batchProgressText.parent('#file-upload-section');
    }

    // Create process button if it doesn't exist
    if (!processButton) {
        processButton = createButton('Process All Images');
        processButton.class('action-button');
        processButton.parent('#file-upload-section');
        processButton.mousePressed(() => {
            previewMode = false;
            currentQueueIndex = 0;
            isProcessingQueue = true;
            processNextImage();
        });
    }
    
    // Start preview of first image
    previewMode = true;
    processNextImage();
}

function processNextImage() {
    if (!isProcessingQueue || currentQueueIndex >= imageQueue.length) {
        // Queue processing complete
        isProcessingQueue = false;
        fileName.html('All images processed!');
        return;
    }
    
    const file = imageQueue[currentQueueIndex];
    
    if (!previewMode) {
        // Update progress during processing
        const progress = ((currentQueueIndex + 1) / totalImages) * 100;
        batchProgressBar.style('width', `${progress}%`);
        batchProgressText.html(`Processing image ${currentQueueIndex + 1} of ${totalImages}: ${file.name}`);
    }
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = function(event) {
        // Load and process the image
        loadImage(event.target.result, (loadedImg) => {
            img = loadedImg;
            originalWidth = img.width;
            originalHeight = img.height;
            
            // Calculate scale and resize canvas
            calculateScale();
            resizeCanvas(canvasWidth, canvasHeight);
            
            // Create new graphics buffer
            if (processedGraphics) {
                processedGraphics.remove();
            }
            processedGraphics = createGraphics(img.width, img.height);
            const ctx = processedGraphics.elt.getContext('2d');
            ctx.canvas.willReadFrequently = true;
            
            // Process and save the image
            imageLoaded = true;
            
            // Force one draw cycle to process the image
            draw();
            
            if (!previewMode) {
                // Generate filename for this image
                const processedName = generateProcessedFilename(file.name);
                
                // Create a temporary canvas for saving
                let tempCanvas = createGraphics(processedGraphics.width, processedGraphics.height);
                tempCanvas.image(processedGraphics, 0, 0);
                
                // Save the canvas as PNG
                saveCanvas(tempCanvas, processedName, 'png');
                
                // Clean up
                tempCanvas.remove();
                
                // Move to next image after a short delay to ensure save completes
                setTimeout(() => {
                    currentQueueIndex++;
                    processNextImage();
                }, 1000); // Increased delay to 1 second to ensure save completes
            } else {
                // In preview mode, just show the current image
                fileName.html(`Preview: ${file.name} (Image ${currentQueueIndex + 1} of ${totalImages})`);
            }
        });
    };
    
    reader.readAsDataURL(file);
}

function generateProcessedFilename(originalName) {
    const nameParts = originalName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    const timestamp = new Date().getTime();
    return `${baseName}_processed_${timestamp}.${extension}`;
}

function saveDitheredImage(customFilename = null) {
    if (!imageLoaded) {
        alert("No image loaded to save");
        return;
    }
    
    // Visual feedback when saving
    if (saveButton) {
        saveButton.style('background-color', '#1976D2');
        setTimeout(() => {
            saveButton.style('background-color', '#2196F3');
        }, 200);
    }
    
    // Create a temporary canvas for the processed image with the same dimensions as processedGraphics
    let tempCanvas = createGraphics(processedGraphics.width, processedGraphics.height);
    const ctx = tempCanvas.elt.getContext('2d');
    ctx.canvas.willReadFrequently = true;
    
    // Copy the processed image to the temporary canvas
    tempCanvas.image(processedGraphics, 0, 0);
    
    // Use custom filename if provided, otherwise generate one
    const filename = customFilename || `${generateRandomName()}_threshold_${new Date().toISOString().split('T')[0]}_${new Date().getSeconds().toString().padStart(2, '0')}.png`;
    
    // Save the temporary canvas with transparency
    saveCanvas(tempCanvas, filename, 'png');
    
    // Clean up
    tempCanvas.remove();
}

function loadDefaultImage() {
    // Load a default flower image for preview
    img = loadImage('https://picsum.photos/800/800?category=flowers', onImageLoaded);
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

// Add swap colors function
function swapColors(index1, index2) {
  const tempColor = thresholds[index1 - 1].color;
  thresholds[index1 - 1].color = thresholds[index2 - 1].color;
  thresholds[index2 - 1].color = tempColor;
  
  // Update UI
  const colorPicker1 = select(`#threshold${index1}-color-picker`);
  const hexInput1 = select(`#threshold${index1}-hex`);
  const colorPicker2 = select(`#threshold${index2}-color-picker`);
  const hexInput2 = select(`#threshold${index2}-hex`);
  
  colorPicker1.value(thresholds[index1 - 1].color);
  hexInput1.value(thresholds[index1 - 1].color);
  colorPicker2.value(thresholds[index2 - 1].color);
  hexInput2.value(thresholds[index2 - 1].color);
  
  saveSettings();
}

function colorsEqual(color1, color2) {
  return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
}

function toggleStroke() {
    hasStroke = !hasStroke;
    const strokeCheckbox = select('#stroke-checkbox');
    if (strokeCheckbox) {
        strokeCheckbox.checked(hasStroke);
    }
    saveSettings();
}

function updateStrokeColor() {
    const strokeColorPicker = select('#stroke-color-picker');
    if (strokeColorPicker) {
        strokeColor = strokeColorPicker.value();
        const strokeHex = select('#stroke-hex');
        if (strokeHex) {
            strokeHex.value(strokeColor);
        }
        saveSettings();
    }
}

function updateStrokeHex() {
    const strokeHex = select('#stroke-hex');
    if (strokeHex) {
        const hex = strokeHex.value();
        if (isValidHex(hex)) {
            strokeColor = hex;
            const strokeColorPicker = select('#stroke-color-picker');
            if (strokeColorPicker) {
                strokeColorPicker.value(hex);
            }
            saveSettings();
        }
    }
}

function toggleVerticalStripes() {
    hasVerticalStripes = !hasVerticalStripes;
    const checkbox = select('#vertical-stripes-checkbox');
    if (checkbox) {
        checkbox.checked(hasVerticalStripes);
    }
    saveSettings();
}

function toggleHorizontalStripes() {
    hasHorizontalStripes = !hasHorizontalStripes;
    const checkbox = select('#horizontal-stripes-checkbox');
    if (checkbox) {
        checkbox.checked(hasHorizontalStripes);
    }
    saveSettings();
}

// Add missing utility functions
function calculateScale() {
    // Get the available width and height for the canvas
    const containerWidth = windowWidth - 300; // Subtract control panel width
    const containerHeight = windowHeight - 60; // Subtract header height

    // Calculate scale to fit image within container while maintaining aspect ratio
    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    scale = Math.min(scaleX, scaleY);

    // Calculate final canvas dimensions
    canvasWidth = Math.floor(originalWidth * scale);
    canvasHeight = Math.floor(originalHeight * scale);
}

function hexToRgb(hex) {
    // Remove the hash if present
    hex = hex.replace(/^#/, '');

    // Parse the hex values
    const bigint = parseInt(hex, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

// Add FileSaver.js polyfill for older browsers
function saveAs(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}