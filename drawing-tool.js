// Drawing tool variables
let canvas;
let currentPattern = 'circle'; // Default pattern
let patternSize = 50;
let patternColor = '#000000';
let rotationSpeed = 5;
let imageSize = 50;
let hasStroke = false;
let pixelationLevel = 1;
let rotationAngle = 0;
let strokeColor = '#000000';
let isPixelated = false;
let isMirrored = false;
let hasVerticalStripes = true;
let isUsingBrush = false;

// Pattern generation variables
const PATTERNS = {
    circle: 'Circle',
    square: 'Square',
    triangle: 'Triangle',
    star: 'Star',
    dots: 'Dots',
    lines: 'Lines',
    spiral: 'Spiral',
    crosshatch: 'Crosshatch',
    zigzag: 'Zigzag',
    waves: 'Waves'
};

// Threshold configuration
let thresholds = [];
const DEFAULT_THRESHOLDS = [
    { level: 26, color: '#000000' },
    { level: 71, color: '#333333' },
    { level: 91, color: '#666666' },
    { level: 128, color: '#999999' },
    { level: 167, color: '#CCCCCC' },
    { level: 202, color: '#FFFFFF' }
];

let thresholdCount = thresholds.length;
let backgroundColor = '#FFFFFF';

// Default brush image
let brushImage = null;
let customBrushImage = null;
let previewCanvas;
let uploadedImages = []; // Array to store uploaded images

// DOM elements
let patternSelect;
let patternColorPicker;
let rotationSpeedSlider;
let rotationValue;
let sizeSlider;
let sizeValue;
let strokeCheckbox;
let strokeColorPicker;
let strokeHex;
let pixelationSlider;
let pixelationValue;
let pixelateCheckbox;
let mirrorCheckbox;
let saveButton;
let clearButton;
let verticalStripesCheckbox;
let randomButton;

// Threshold UI elements
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

// Add new global variables for image upload
let imageUploadInput;

function preload() {
    // Load the default brush image
    loadImage("data/images/paint.png", img => {
        brushImage = img;
    });
}

function setup() {
    // Create canvas and set it up
    createCanvas(800, 600);
    background(255);
    
    // Get the controls panel container
    const controlsPanel = select('.controls-panel');
    
    // Create brush controls container
    let brushControls = createDiv('');
    brushControls.class('brush-controls');
    
    // Create image upload input
    imageUploadInput = createFileInput(handleImageUpload);
    imageUploadInput.class('file-input');
    imageUploadInput.parent(brushControls);
    imageUploadInput.attribute('accept', 'image/*');
    
    // Create brush preview
    let brushPreview = createDiv('');
    brushPreview.class('brush-preview');
    brushPreview.id('brush-preview');
    brushPreview.parent(brushControls);
    
    // Create brush toggle button
    let brushToggle = createButton('Toggle Brush');
    brushToggle.mousePressed(toggleBrush);
    brushToggle.parent(brushControls);
    
    // Add brush controls to the controls panel
    brushControls.parent(controlsPanel);
    
    // Create canvas with a specific size
    canvas = createCanvas(windowWidth - 300, windowHeight - 60);
    
    // Create preview canvas
    previewCanvas = createGraphics(100, 100);
    const previewContainer = select('#preview-container');
    if (previewContainer) {
        let previewCanvasElement = createCanvas(100, 100);
        previewCanvasElement.parent('preview-container');
        previewCanvasElement.id('preview-canvas');
    }
    
    // Make sure the canvas is added to the correct container
    const canvasContainer = select('#canvas-container');
    if (canvasContainer) {
        canvas.parent('canvas-container');
        canvas.style('display', 'block');
        canvas.style('margin', 'auto');
    }
    
    // Set background
    background(255);
    
    // Get DOM elements
    patternSelect = select('#pattern-select');
    patternColorPicker = select('#pattern-color-picker');
    rotationSpeedSlider = select('#rotation-speed');
    rotationValue = select('#rotation-value');
    sizeSlider = select('#size-slider');
    sizeValue = select('#size-value');
    strokeCheckbox = select('#stroke-checkbox');
    strokeColorPicker = select('#stroke-color-picker');
    strokeHex = select('#stroke-hex');
    pixelationSlider = select('#pixelation-slider');
    pixelationValue = select('#pixelation-value');
    pixelateCheckbox = select('#pixelate-checkbox');
    mirrorCheckbox = select('#mirror-checkbox');
    saveButton = select('#save-btn');
    clearButton = select('#clear-btn');
    verticalStripesCheckbox = select('#vertical-stripes-checkbox');
    randomButton = select('#random-btn');
    
    // Get threshold UI elements
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
    
    // Initialize pattern select
    if (patternSelect) {
        Object.entries(PATTERNS).forEach(([value, label]) => {
            patternSelect.option(label, value);
        });
        patternSelect.changed(updatePattern);
    }
    
    // Initialize pattern color picker
    if (patternColorPicker) {
        patternColorPicker.value(patternColor);
        patternColorPicker.input(updatePatternColor);
    }
    
    // Set up other event listeners
    if (rotationSpeedSlider) rotationSpeedSlider.input(updateRotationSpeed);
    if (sizeSlider) sizeSlider.input(updateSize);
    if (strokeCheckbox) strokeCheckbox.changed(toggleStroke);
    if (strokeColorPicker) strokeColorPicker.input(updateStrokeColor);
    if (strokeHex) strokeHex.input(updateStrokeHex);
    if (pixelationSlider) pixelationSlider.input(updatePixelation);
    if (pixelateCheckbox) pixelateCheckbox.changed(togglePixelation);
    if (mirrorCheckbox) mirrorCheckbox.changed(toggleMirror);
    if (saveButton) saveButton.mousePressed(saveDrawing);
    if (clearButton) clearButton.mousePressed(clearCanvas);
    if (verticalStripesCheckbox) verticalStripesCheckbox.changed(toggleVerticalStripes);
    if (randomButton) randomButton.mousePressed(randomizeThresholds);
    
    // Set up threshold event listeners with null checks
    if (threshold1Slider) threshold1Slider.input(updateThreshold1Value);
    if (threshold1ColorPicker) threshold1ColorPicker.input(updateThreshold1Color);
    if (threshold1Hex) threshold1Hex.input(updateThreshold1Hex);
    if (threshold2Slider) threshold2Slider.input(updateThreshold2Value);
    if (threshold2ColorPicker) threshold2ColorPicker.input(updateThreshold2Color);
    if (threshold2Hex) threshold2Hex.input(updateThreshold2Hex);
    if (backgroundColorPicker) backgroundColorPicker.input(updateBackgroundColor);
    if (backgroundHex) backgroundHex.input(updateBackgroundHex);
    
    // Initialize UI values
    updateUIValues();
    
    // Load saved settings
    loadSettings();
    
    // Initialize thresholds
    initializeThresholds();
    
    // Add event listeners for threshold controls
    const addThresholdBtn = select('#add-threshold-btn');
    if (addThresholdBtn) {
        addThresholdBtn.mousePressed(addThreshold);
    }
    
    // Add saved settings selector
    const savedSettingsSelect = select('#saved-settings-select');
    if (savedSettingsSelect) {
        savedSettingsSelect.changed(loadSelectedSettings);
        updateSavedSettingsSelect();
    }
    
    // Add event listener for image select
    const imageSelect = select('#image-select');
    if (imageSelect) {
        imageSelect.changed(() => {
            const selectedIndex = parseInt(imageSelect.value());
            selectBrushImage(selectedIndex);
        });
    }
}

function draw() {
    // Update rotation angle
    rotationAngle += rotationSpeed * 0.01;
    
    // Show pattern preview at mouse position when not drawing
    if (mouseX > 0 && mouseY > 0 && mouseX < width && mouseY < height) {
        push();
        imageMode(CENTER);
        
        // Draw semi-transparent preview
        tint(255, 128); // Semi-transparent
        translate(mouseX, mouseY);
        rotate(rotationAngle);
        
        if (isUsingBrush && brushImage) {
            image(brushImage, 0, 0, imageSize, imageSize);
        } else {
            drawPattern(currentPattern, 0, 0, imageSize, true);
        }
        
        noTint();
        pop();
        
        if (mouseIsPressed) {
            drawBrush();
            if (isMirrored) {
                push();
                scale(-1, 1);
                translate(-width, 0);
                drawBrush();
                pop();
            }
        }   
    }
}

function drawBrush() {
    push();
    translate(mouseX, mouseY);
    rotate(rotationAngle);
    
    // Create a temporary graphics buffer for processing
    let tempGraphics = createGraphics(imageSize, imageSize);
    tempGraphics.pixelDensity(1);
    
    // Draw the pattern or brush image to the temp buffer
    tempGraphics.push();
    tempGraphics.translate(imageSize/2, imageSize/2);
    
    if (isUsingBrush && brushImage) {
        tempGraphics.imageMode(CENTER);
        tempGraphics.image(brushImage, 0, 0, imageSize, imageSize);
    } else {
        drawPattern(currentPattern, 0, 0, imageSize, false, tempGraphics);
    }
    
    tempGraphics.pop();
    
    // Apply pixelation if enabled
    if (isPixelated && pixelationLevel > 1) {
        applyPixelation(tempGraphics);
    }
    
    // Apply thresholds
    applyThresholds(tempGraphics);
    
    // Apply stroke if enabled
    if (hasStroke) {
        applyStroke(tempGraphics);
    }
    
    // Draw the final result
    image(tempGraphics, -imageSize/2, -imageSize/2);
    tempGraphics.remove();
    pop();
}

function drawPattern(pattern, x, y, size, isPreview, graphics = window) {
    const g = graphics === window ? window : graphics;
    g.push();
    if (!isPreview) {
        g.fill(patternColor);
        g.stroke(hasStroke ? strokeColor : patternColor);
    }
    
    switch (pattern) {
        case 'circle':
            g.ellipse(x, y, size);
            break;
        case 'square':
            g.rectMode(CENTER);
            g.rect(x, y, size, size);
            break;
        case 'triangle':
            drawTriangle(x, y, size, g);
            break;
        case 'star':
            drawStar(x, y, size, g);
            break;
        case 'dots':
            drawDots(x, y, size, g);
            break;
        case 'lines':
            drawLines(x, y, size, g);
            break;
        case 'spiral':
            drawSpiral(x, y, size, g);
            break;
        case 'crosshatch':
            drawCrosshatch(x, y, size, g);
            break;
        case 'zigzag':
            drawZigzag(x, y, size, g);
            break;
        case 'waves':
            drawWaves(x, y, size, g);
                break;
            }
    g.pop();
}

// Pattern drawing functions
function drawTriangle(x, y, size, g) {
    const halfSize = size / 2;
    g.triangle(
        x, y - halfSize,
        x - halfSize, y + halfSize,
        x + halfSize, y + halfSize
    );
}

function drawStar(x, y, size, g) {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const points = 5;
    
    g.beginShape();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * TWO_PI) / (points * 2) - HALF_PI;
        const px = x + cos(angle) * radius;
        const py = y + sin(angle) * radius;
        g.vertex(px, py);
    }
    g.endShape(CLOSE);
}

function drawDots(x, y, size, g) {
    const dotSize = size / 8;
    const spacing = size / 4;
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            g.ellipse(x + i * spacing, y + j * spacing, dotSize);
        }
    }
}

function drawLines(x, y, size, g) {
    const halfSize = size / 2;
    const spacing = size / 6;
    
    for (let i = -halfSize; i <= halfSize; i += spacing) {
        g.line(x - halfSize, y + i, x + halfSize, y + i);
    }
}

function drawSpiral(x, y, size, g) {
    const maxRadius = size / 2;
    const turns = 3;
    g.beginShape();
    for (let angle = 0; angle < turns * TWO_PI; angle += 0.1) {
        const radius = (angle / (turns * TWO_PI)) * maxRadius;
        const px = x + cos(angle) * radius;
        const py = y + sin(angle) * radius;
        g.vertex(px, py);
    }
    g.endShape();
}

function drawCrosshatch(x, y, size, g) {
    const halfSize = size / 2;
    const spacing = size / 6;
    
    // Horizontal lines
    for (let i = -halfSize; i <= halfSize; i += spacing) {
        g.line(x - halfSize, y + i, x + halfSize, y + i);
    }
    
    // Vertical lines
    for (let i = -halfSize; i <= halfSize; i += spacing) {
        g.line(x + i, y - halfSize, x + i, y + halfSize);
    }
}

function drawZigzag(x, y, size, g) {
    const halfSize = size / 2;
    const steps = 6;
    const stepSize = size / steps;
    
    g.beginShape();
    for (let i = 0; i <= steps; i++) {
        const px = x - halfSize + i * stepSize;
        const py = y + (i % 2 === 0 ? -halfSize : halfSize);
        g.vertex(px, py);
    }
    g.endShape();
}

function drawWaves(x, y, size, g) {
    const halfSize = size / 2;
    const amplitude = size / 4;
    const frequency = TWO_PI / size * 2;
    
    g.beginShape();
    for (let i = -halfSize; i <= halfSize; i++) {
        const px = x + i;
        const py = y + sin(i * frequency) * amplitude;
        g.vertex(px, py);
    }
    g.endShape();
}

function updatePattern() {
    currentPattern = patternSelect.value();
    updatePreview();
}

function updatePatternColor() {
    patternColor = patternColorPicker.value();
    updatePreview();
}

function updateRotationSpeed() {
    rotationSpeed = parseInt(rotationSpeedSlider.value());
    rotationValue.html(rotationSpeed);
    updatePreview();
}

function updateSize() {
    imageSize = parseInt(sizeSlider.value());
    sizeValue.html(imageSize);
}

function toggleStroke() {
    hasStroke = strokeCheckbox.checked();
}

function updateStrokeColor() {
    strokeColor = strokeColorPicker.value();
    strokeHex.value(strokeColor);
}

function updateStrokeHex() {
    const hex = strokeHex.value();
    if (isValidHex(hex)) {
        strokeColor = hex;
        strokeColorPicker.value(hex);
    }
}

function updatePixelation() {
    pixelationLevel = parseInt(pixelationSlider.value());
    pixelationValue.html(pixelationLevel);
}

function togglePixelation() {
    isPixelated = pixelateCheckbox.checked();
}

function toggleMirror() {
    isMirrored = mirrorCheckbox.checked();
}

function saveDrawing() {
    // Create a temporary canvas with transparency
    let tempCanvas = createGraphics(width, height);
    tempCanvas.clear(); // This creates a transparent background
    
    // Copy the current canvas content to the temporary canvas
    tempCanvas.image(canvas, 0, 0);
    
    // Generate filename
    const filename = generateFilename();
    
    // Save the canvas as PNG (which preserves transparency)
    saveCanvas(tempCanvas, filename, 'png');
    
    // Clean up
    tempCanvas.remove();
}

function clearCanvas() {
    background(255);
}

function updateUIValues() {
    rotationValue.html(rotationSpeed);
    sizeValue.html(imageSize);
    pixelationValue.html(pixelationLevel);
}

function generateFilename() {
    const adjectives = ['Cool', 'Awesome', 'Great', 'Amazing', 'Fantastic', 'Super', 'Epic', 'Incredible'];
    const nouns = ['Image', 'Art', 'Creation', 'Design', 'Work', 'Piece', 'Masterpiece', 'Photo'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${randomAdjective}${randomNoun}_drawing_${dateStr}_${seconds}.png`;
}

// Add window resize handler
function windowResized() {
    resizeCanvas(windowWidth - 300, windowHeight - 60);
}

// Threshold functions
function updateThreshold1Value() {
    thresholds[0].level = parseInt(threshold1Slider.value());
    threshold1Value.html(thresholds[0].level);
}

function updateThreshold2Value() {
    thresholds[1].level = parseInt(threshold2Slider.value());
    threshold2Value.html(thresholds[1].level);
}

function updateThreshold1Color() {
    const color = threshold1ColorPicker.value();
    thresholds[0].color = color;
    threshold1Hex.value(color);
}

function updateThreshold2Color() {
    const color = threshold2ColorPicker.value();
    thresholds[1].color = color;
    threshold2Hex.value(color);
}

function updateThreshold1Hex() {
    const hex = threshold1Hex.value();
    if (isValidHex(hex)) {
        thresholds[0].color = hex;
        threshold1ColorPicker.value(hex);
    }
}

function updateThreshold2Hex() {
    const hex = threshold2Hex.value();
    if (isValidHex(hex)) {
        thresholds[1].color = hex;
        threshold2ColorPicker.value(hex);
    }
}

function updateBackgroundColor() {
    backgroundColor = backgroundColorPicker.value();
    backgroundHex.value(backgroundColor);
}

function updateBackgroundHex() {
    const hex = backgroundHex.value();
    if (isValidHex(hex)) {
        backgroundColor = hex;
        backgroundColorPicker.value(hex);
    }
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

function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// Add colorsEqual helper function
function colorsEqual(color1, color2) {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
}

function toggleVerticalStripes() {
    const checkbox = select('#vertical-stripes-checkbox');
    if (checkbox) {
        hasVerticalStripes = checkbox.checked();
    }
    saveSettings();
}

function randomizeThresholds() {
    // Keep the current number of thresholds
    const currentCount = thresholds.length;
    const newThresholds = [];
    
    // Generate evenly distributed threshold levels
    const step = 255 / (currentCount + 1);
    for (let i = 0; i < currentCount; i++) {
        // Generate random RGB values
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        // Convert to hex
        const color = '#' + 
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0');
        
        // Calculate threshold level ensuring proper ordering
        const level = Math.round((i + 1) * step);
        
        newThresholds.push({
            level: Math.min(255, level),
            color: color
        });
    }
    
    // Sort thresholds by level to ensure proper ordering
    newThresholds.sort((a, b) => a.level - b.level);
    
    // Update thresholds
    thresholds = newThresholds;
    
    // Update UI and save settings
    updateThresholdUI();
    saveSettings();
    updatePreview();
}

function updateThresholdLevel(index, level) {
    thresholds[index].level = level;
    select(`#threshold${index}-value`).html(level);
    saveSettings();
    updatePreview();
}

function updateThresholdColor(index, color) {
    thresholds[index].color = color;
    saveSettings();
    updatePreview();
}

function swapThresholds(index1, index2) {
    [thresholds[index1], thresholds[index2]] = [thresholds[index2], thresholds[index1]];
    updateThresholdUI();
    saveSettings();
}

function removeThreshold(index) {
    thresholds.splice(index, 1);
    updateThresholdUI();
    saveSettings();
}

function addThreshold() {
    const newLevel = thresholds.length > 0 ? 
        Math.min(255, thresholds[thresholds.length - 1].level + 25) : 128;
    thresholds.push({
        level: newLevel,
        color: '#000000'
    });
    updateThresholdUI();
    saveSettings();
}

// Helper function to get pixel color
function getPixelColor(pixels, x, y, width) {
    const i = 4 * (y * width + x);
    return {
        r: pixels[i],
        g: pixels[i + 1],
        b: pixels[i + 2],
        a: pixels[i + 3]
    };
}

// Update saved settings functions
function updateSavedSettingsSelect() {
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    const select = document.getElementById('saved-settings-select');
    
    if (select) {
        select.innerHTML = '<option value="">Load saved settings...</option>';
        savedSettings.forEach(settings => {
            const option = document.createElement('option');
            option.value = settings.name;
            option.textContent = settings.name;
            select.appendChild(option);
        });
    }
}

function loadSelectedSettings() {
    const select = document.getElementById('saved-settings-select');
    const selectedName = select.value;
    
    if (!selectedName) return;
    
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    const settings = savedSettings.find(s => s.name === selectedName);
    
    if (settings && settings.thresholds) {
        thresholds = [...settings.thresholds];
        updateThresholdUI();
        saveSettings();
    }
}

function loadSettings() {
    const savedSettings = localStorage.getItem('drawingToolSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Apply settings
        thresholds = settings.thresholds || thresholds;
        backgroundColor = settings.backgroundColor || backgroundColor;
        hasVerticalStripes = settings.hasVerticalStripes !== undefined ? settings.hasVerticalStripes : hasVerticalStripes;
        
        // Update UI with null checks
        updateThresholdUI();
        
        const verticalStripesCheckbox = select('#vertical-stripes-checkbox');
        if (verticalStripesCheckbox) {
            verticalStripesCheckbox.checked(hasVerticalStripes);
        }
        
        const backgroundColorPicker = select('#background-color-picker');
        const backgroundHex = select('#background-hex');
        
        if (backgroundColorPicker) {
            backgroundColorPicker.value(backgroundColor);
        }
        if (backgroundHex) {
            backgroundHex.value(backgroundColor);
        }
    }
}

function saveSettings() {
    const settings = {
        thresholds,
        backgroundColor,
        hasVerticalStripes
    };
    
    localStorage.setItem('drawingToolSettings', JSON.stringify(settings));
}

function updateThresholdUI() {
    const container = select('#threshold-container');
    container.html(''); // Clear existing thresholds
    
    thresholds.forEach((threshold, index) => {
        const thresholdGroup = createDiv();
        thresholdGroup.class('threshold-group');
        
        // Add remove button
        if (thresholds.length > 1) {
            const removeBtn = createButton('×');
            removeBtn.class('remove-threshold');
            removeBtn.mousePressed(() => removeThreshold(index));
            thresholdGroup.child(removeBtn);
        }
        
        // Add threshold slider
        const sliderContainer = createDiv();
        sliderContainer.class('slider-container');
        
        const label = createElement('label', `Threshold ${index + 1}: `);
        const valueSpan = createSpan(threshold.level);
        valueSpan.id(`threshold${index}-value`);
        label.child(valueSpan);
        
        const slider = createInput(threshold.level.toString(), 'range');
        slider.attribute('min', '0');
        slider.attribute('max', '255');
        slider.input(() => updateThresholdLevel(index, parseInt(slider.value())));
        
        // Add color picker
        const colorContainer = createDiv();
        colorContainer.class('color-option');
        
        const colorLabel = createElement('label', `Color ${index + 1}:`);
        const colorPicker = createInput(threshold.color, 'color');
        colorPicker.input(() => updateThresholdColor(index, colorPicker.value()));
        
        const hexInput = createInput(threshold.color, 'text');
        hexInput.class('hex-input');
        hexInput.attribute('maxlength', '7');
        hexInput.input(() => {
            if (isValidHex(hexInput.value())) {
                updateThresholdColor(index, hexInput.value());
                colorPicker.value(hexInput.value());
            }
        });
        
        // Add swap buttons
        if (index > 0) {
            const upBtn = createButton('↑');
            upBtn.class('swap-button');
            upBtn.mousePressed(() => swapThresholds(index, index - 1));
            colorContainer.child(upBtn);
        }
        if (index < thresholds.length - 1) {
            const downBtn = createButton('↓');
            downBtn.class('swap-button');
            downBtn.mousePressed(() => swapThresholds(index, index + 1));
            colorContainer.child(downBtn);
        }
        
        // Assemble the elements
        colorContainer.child(colorLabel);
        colorContainer.child(colorPicker);
        colorContainer.child(hexInput);
        
        sliderContainer.child(label);
        sliderContainer.child(slider);
        sliderContainer.child(colorContainer);
        
        thresholdGroup.child(sliderContainer);
        container.child(thresholdGroup);
    });
}

function initializeThresholds() {
    // Initialize thresholds with default values
    thresholds = DEFAULT_THRESHOLDS.slice();
    updateThresholdUI();
    saveSettings();
}

function updatePreview() {
    if (!previewCanvas) return;
    
    previewCanvas.clear();
    previewCanvas.background(255);
    
    // Draw pattern with current settings
    previewCanvas.push();
    previewCanvas.imageMode(CENTER);
    previewCanvas.translate(previewCanvas.width/2, previewCanvas.height/2);
    previewCanvas.rotate(rotationAngle);
    
    // Create temporary graphics for pattern
    let tempGraphics = createGraphics(imageSize, imageSize);
    tempGraphics.pixelDensity(1);
    
    // Draw the pattern
    tempGraphics.push();
    tempGraphics.translate(imageSize/2, imageSize/2);
    drawPattern(currentPattern, 0, 0, imageSize, false, tempGraphics);
    tempGraphics.pop();
    
    // Apply current threshold settings
    applyThresholds(tempGraphics);
    
    // Draw the processed image to preview
    previewCanvas.image(tempGraphics, 0, 0, 80, 80);
    previewCanvas.pop();
    
    // Update the preview canvas display
    const previewCanvasElement = select('#preview-canvas');
    if (previewCanvasElement) {
        previewCanvasElement.getContext('2d').drawImage(previewCanvas.elt, 0, 0);
    }
    
    tempGraphics.remove();
    
    // Draw threshold preview
    drawThresholdPreview();
}

function drawThresholdPreview() {
    if (!previewCanvas) return;
    
    const previewWidth = 100;
    const previewHeight = 20;
    const barWidth = previewWidth / thresholds.length;
    
    // Draw threshold bars below the brush preview
    previewCanvas.push();
    previewCanvas.translate(0, 85);
    previewCanvas.noStroke();
    previewCanvas.fill(255);
    previewCanvas.rect(0, 0, previewWidth, previewHeight);
    
    for (let i = 0; i < thresholds.length; i++) {
        const threshold = thresholds[i];
        previewCanvas.fill(threshold.color);
        const x = i * barWidth;
        const h = map(threshold.level, 0, 255, 0, previewHeight);
        previewCanvas.rect(x, previewHeight - h, barWidth, h);
    }
    previewCanvas.pop();
}

function applyPixelation(graphics) {
    let pixelated = createGraphics(imageSize, imageSize);
    pixelated.pixelDensity(1);
    pixelated.image(graphics, 0, 0);
    pixelated.loadPixels();
    
    for (let y = 0; y < pixelated.height; y += pixelationLevel) {
        for (let x = 0; x < pixelated.width; x += pixelationLevel) {
            // Calculate average color for this block
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            
            for (let py = 0; py < pixelationLevel && y + py < pixelated.height; py++) {
                for (let px = 0; px < pixelationLevel && x + px < pixelated.width; px++) {
                    const i = 4 * ((y + py) * pixelated.width + (x + px));
                    r += pixelated.pixels[i];
                    g += pixelated.pixels[i + 1];
                    b += pixelated.pixels[i + 2];
                    a += pixelated.pixels[i + 3];
                    count++;
                }
            }
            
            // Apply average color to this block
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            a = Math.round(a / count);
            
            for (let py = 0; py < pixelationLevel && y + py < pixelated.height; py++) {
                for (let px = 0; px < pixelationLevel && x + px < pixelated.width; px++) {
                    const i = 4 * ((y + py) * pixelated.width + (x + px));
                    pixelated.pixels[i] = r;
                    pixelated.pixels[i + 1] = g;
                    pixelated.pixels[i + 2] = b;
                    pixelated.pixels[i + 3] = a;
                }
            }
        }
    }
    
    pixelated.updatePixels();
    graphics.image(pixelated, 0, 0);
    pixelated.remove();
}

function applyThresholds(graphics) {
    graphics.loadPixels();
    
    for (let i = 0; i < graphics.pixels.length; i += 4) {
        const gray = (graphics.pixels[i] + graphics.pixels[i + 1] + graphics.pixels[i + 2]) / 3;
        const alpha = graphics.pixels[i + 3];
        
        let thresholdColor = backgroundColor;
        for (let t = 0; t < thresholds.length; t++) {
            if (gray <= thresholds[t].level) {
                thresholdColor = thresholds[t].color;
                break;
            }
        }
        
        const color = hexToRgb(thresholdColor);
        graphics.pixels[i] = color.r;
        graphics.pixels[i + 1] = color.g;
        graphics.pixels[i + 2] = color.b;
        graphics.pixels[i + 3] = alpha;
    }
    
    graphics.updatePixels();
}

function applyStroke(graphics) {
    let strokeGraphics = createGraphics(imageSize, imageSize);
    strokeGraphics.pixelDensity(1);
    strokeGraphics.image(graphics, 0, 0);
    strokeGraphics.loadPixels();
    
    const originalPixels = strokeGraphics.pixels.slice();
    
    for (let y = 1; y < strokeGraphics.height - 1; y++) {
        for (let x = 1; x < strokeGraphics.width - 1; x++) {
            const i = 4 * (y * strokeGraphics.width + x);
            
            if (originalPixels[i + 3] > 0) {
                const current = getPixelColor(originalPixels, x, y, strokeGraphics.width);
                const left = getPixelColor(originalPixels, x - 1, y, strokeGraphics.width);
                const right = getPixelColor(originalPixels, x + 1, y, strokeGraphics.width);
                const top = getPixelColor(originalPixels, x, y - 1, strokeGraphics.width);
                const bottom = getPixelColor(originalPixels, x, y + 1, strokeGraphics.width);
                
                if (!colorsEqual(current, left) || !colorsEqual(current, right) ||
                    !colorsEqual(current, top) || !colorsEqual(current, bottom)) {
                    const stroke = hexToRgb(strokeColor);
                    graphics.pixels[i] = stroke.r;
                    graphics.pixels[i + 1] = stroke.g;
                    graphics.pixels[i + 2] = stroke.b;
                    graphics.pixels[i + 3] = originalPixels[i + 3];
                }
            }
        }
    }
    
    graphics.updatePixels();
    strokeGraphics.remove();
}

// Add new functions for image handling
function handleImageUpload(file) {
    if (file.type.startsWith('image')) {
        loadImage(file.data, img => {
            // Add the new image to uploadedImages array
            uploadedImages.push({
                name: file.name,
                image: img,
                data: file.data
            });
            
            // Update the image select dropdown
            updateImageSelect();
            
            // Automatically select the newly uploaded image
            const imageSelect = select('#image-select');
            if (imageSelect) {
                imageSelect.value(uploadedImages.length - 1);
                selectBrushImage(uploadedImages.length - 1);
            }
        });
    }
}

function updateImageSelect() {
    const imageSelect = select('#image-select');
    if (imageSelect) {
        // Clear existing options
        imageSelect.html('');
        
        // Add default option
        imageSelect.option('Default Brush', -1);
        
        // Add uploaded images
        uploadedImages.forEach((img, index) => {
            imageSelect.option(img.name, index);
        });
    }
}

function selectBrushImage(index) {
    isUsingBrush = true;
    
    if (index === -1) {
        // Use default brush
        loadImage("data/images/paint.png", img => {
            brushImage = img;
            customBrushImage = null;
            updateBrushPreview("data/images/paint.png");
        });
    } else if (index >= 0 && index < uploadedImages.length) {
        // Use selected uploaded image
        brushImage = uploadedImages[index].image;
        customBrushImage = brushImage;
        updateBrushPreview(uploadedImages[index].data);
    }
}

function updateBrushPreview(imageUrl) {
    let preview = select('#brush-preview');
    if (preview) {
        preview.style('background-image', `url(${imageUrl})`);
        preview.style('background-size', 'cover');
        preview.style('background-position', 'center');
    }
}

function toggleBrush() {
    isUsingBrush = !isUsingBrush;
    
    const imageSelect = select('#image-select');
    if (imageSelect && isUsingBrush) {
        // When toggling to brush mode, use the currently selected image
        const selectedIndex = parseInt(imageSelect.value());
        selectBrushImage(selectedIndex);
    } else {
        // When toggling off brush mode, switch to pattern mode
        brushImage = null;
        customBrushImage = null;
        updateBrushPreview("data/images/paint.png");
    }
} 