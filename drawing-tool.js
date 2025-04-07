// Drawing tool variables
let canvas;
let images = []; // Array to store uploaded images
let currentImageIndex = 0;
let lastImageChange = 0;
let autoCycleInterval = 5000; // 5 seconds
let rotationSpeed = 5;
let imageSize = 50;
let hasStroke = false;
let pixelationLevel = 1;
let rotationAngle = 0;
let strokeColor = '#000000'; // Add stroke color variable
let isPixelated = false; // Add pixelate toggle
let isMirrored = false; // Add mirror toggle
let hasVerticalStripes = true; // Add vertical stripes toggle

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
let brushImage;
let isUsingBrush = true;

// DOM elements
let imageUpload;
let rotationSpeedSlider;
let rotationValue;
let sizeSlider;
let sizeValue;
let strokeCheckbox;
let strokeColorPicker; // Add stroke color picker
let strokeHex; // Add stroke hex input
let pixelationSlider;
let pixelationValue;
let saveButton;
let clearButton;
let imageSelect;
let pixelateCheckbox; // Add pixelate checkbox
let mirrorCheckbox; // Add mirror checkbox
let verticalStripesCheckbox; // Add vertical stripes checkbox
let randomButton; // Add random button

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

function preload() {
    // Load the default brush image
    brushImage = loadImage("data/images/paint.png");
}

function setup() {
    // Set frame rate
    frameRate(50);
    
    // Create canvas with a specific size
    canvas = createCanvas(windowWidth - 300, windowHeight - 60); // Account for controls panel and header
    
    // Make sure the canvas is added to the correct container
    const canvasContainer = select('#canvas-container');
    if (canvasContainer) {
        canvas.parent('canvas-container');
        // Set canvas style
        canvas.style('display', 'block');
        canvas.style('margin', 'auto');
    } else {
        console.error('Canvas container not found!');
    }
    
    // Set background
    background(255);
    
    // Get DOM elements
    imageUpload = select('#image-upload');
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
    imageSelect = select('#image-select');
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
    
    // Set up event listeners with null checks
    if (imageUpload) imageUpload.input(handleImageUpload);
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
    if (imageSelect) imageSelect.changed(selectImage);
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
}

function draw() {
    // Update rotation angle
    rotationAngle += rotationSpeed * 0.01;
    
    // Auto-cycle images every 5 seconds if we have images loaded
    if (images.length > 0) {
        let currentTime = millis();
        if (currentTime - lastImageChange > autoCycleInterval) {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            lastImageChange = currentTime;
        }
    }
    
    // Show brush preview at mouse position when not drawing
    if (isUsingBrush && mouseX > 0 && mouseY > 0 && mouseX < width && mouseY < height) {
        push();
        imageMode(CENTER);
        
        // Draw semi-transparent brush preview
        tint(255, 128); // Semi-transparent
        translate(mouseX, mouseY);
        rotate(rotationAngle);
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
    if (!brushImage) return;
    
    // Create a temporary graphics buffer for processing
    let tempGraphics = createGraphics(brushImage.width, brushImage.height);
    tempGraphics.pixelDensity(1);
    
    // Draw the brush image to the temp buffer
    tempGraphics.image(brushImage, 0, 0);
    
    // Apply pixelation if enabled
    if (isPixelated && pixelationLevel > 1) {
        let pixelated = createGraphics(tempGraphics.width, tempGraphics.height);
        pixelated.pixelDensity(1);
        pixelated.image(tempGraphics, 0, 0);
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
        tempGraphics = pixelated;
    }
    
    // Apply thresholds and other effects
    tempGraphics.loadPixels();
    
    for (let i = 0; i < tempGraphics.pixels.length; i += 4) {
        const gray = (tempGraphics.pixels[i] + tempGraphics.pixels[i + 1] + tempGraphics.pixels[i + 2]) / 3;
        const alpha = tempGraphics.pixels[i + 3];
        
        // Find appropriate threshold
        let thresholdColor = backgroundColor;
        for (let t = 0; t < thresholds.length; t++) {
            if (gray <= thresholds[t].level) {
                thresholdColor = thresholds[t].color;
                break;
            }
        }
        
        const color = hexToRgb(thresholdColor);
        tempGraphics.pixels[i] = color.r;
        tempGraphics.pixels[i + 1] = color.g;
        tempGraphics.pixels[i + 2] = color.b;
        tempGraphics.pixels[i + 3] = alpha;
    }
    
    tempGraphics.updatePixels();
    
    // Apply stroke if enabled
    if (hasStroke) {
        let strokeGraphics = createGraphics(tempGraphics.width, tempGraphics.height);
        strokeGraphics.pixelDensity(1);
        strokeGraphics.image(tempGraphics, 0, 0);
        strokeGraphics.loadPixels();
        
        const originalPixels = strokeGraphics.pixels.slice();
        
        for (let y = 1; y < strokeGraphics.height - 1; y++) {
            for (let x = 1; x < strokeGraphics.width - 1; x++) {
                const i = 4 * (y * strokeGraphics.width + x);
                
                if (originalPixels[i + 3] > 0) { // Only process non-transparent pixels
                    const current = getPixelColor(originalPixels, x, y, strokeGraphics.width);
                    const left = getPixelColor(originalPixels, x - 1, y, strokeGraphics.width);
                    const right = getPixelColor(originalPixels, x + 1, y, strokeGraphics.width);
                    const top = getPixelColor(originalPixels, x, y - 1, strokeGraphics.width);
                    const bottom = getPixelColor(originalPixels, x, y + 1, strokeGraphics.width);
                    
                    if (!colorsEqual(current, left) || !colorsEqual(current, right) ||
                        !colorsEqual(current, top) || !colorsEqual(current, bottom)) {
                        const stroke = hexToRgb(strokeColor);
                        tempGraphics.pixels[i] = stroke.r;
                        tempGraphics.pixels[i + 1] = stroke.g;
                        tempGraphics.pixels[i + 2] = stroke.b;
                        tempGraphics.pixels[i + 3] = originalPixels[i + 3];
                    }
                }
            }
        }
        
        tempGraphics.updatePixels();
        strokeGraphics.remove();
    }
    
    // Draw the final result
    image(tempGraphics, mouseX, mouseY);
    tempGraphics.remove();
}

function handleImageUpload() {
    if (imageUpload.elt.files.length > 0) {
        const files = imageUpload.elt.files;
        images = []; // Clear existing images
        
        // Clear and update image select dropdown
        imageSelect.html('<option value="default">Default Brush</option>');
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const img = loadImage(event.target.result, function() {
                    images.push(img);
                    // Add option to select dropdown
                    imageSelect.option(`Image ${images.length}`, images.length - 1);
                });
            };
            
            reader.readAsDataURL(file);
        }
    }
}

function selectImage() {
    const selectedIndex = parseInt(imageSelect.value());
    if (selectedIndex >= 0 && selectedIndex < images.length) {
        brushImage = images[selectedIndex];
    } else {
        // Reset to default brush
        brushImage = loadImage("data/images/paint.png");
    }
}

function updateRotationSpeed() {
    rotationSpeed = parseInt(rotationSpeedSlider.value());
    rotationValue.html(rotationSpeed);
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
    // Generate filename with random name, category, date, and seconds
    const filename = generateFilename();
    saveCanvas(canvas, filename, 'png');
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
    // Generate random threshold values
    const thresholdValues = [26, 71, 91, 128, 167, 202];
    const newThresholds = [];
    
    for (let i = 0; i < thresholdCount; i++) {
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
    
    thresholds = newThresholds;
    
    // Update UI
    updateThresholdUI();
    saveSettings();
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

function updateThresholdLevel(index, level) {
    thresholds[index].level = level;
    select(`#threshold${index}-value`).html(level);
    saveSettings();
}

function updateThresholdColor(index, color) {
    thresholds[index].color = color;
    saveSettings();
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

function initializeThresholds() {
    // Try to load last used thresholds from threshold tool
    const lastThresholds = localStorage.getItem('lastThresholds');
    if (lastThresholds) {
        thresholds = JSON.parse(lastThresholds);
    } else {
        thresholds = [...DEFAULT_THRESHOLDS];
    }
    updateThresholdUI();
} 