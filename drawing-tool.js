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
let pixelationSlider;
let pixelationValue;
let saveButton;
let clearButton;
let imageSelect;

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
    pixelationSlider = select('#pixelation-slider');
    pixelationValue = select('#pixelation-value');
    saveButton = select('#save-btn');
    clearButton = select('#clear-btn');
    imageSelect = select('#image-select');
    
    // Set up event listeners
    imageUpload.input(handleImageUpload);
    rotationSpeedSlider.input(updateRotationSpeed);
    sizeSlider.input(updateSize);
    strokeCheckbox.changed(toggleStroke);
    pixelationSlider.input(updatePixelation);
    saveButton.mousePressed(saveDrawing);
    clearButton.mousePressed(clearCanvas);
    imageSelect.changed(selectImage);
    
    // Initialize UI values
    updateUIValues();
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
        }   
    }
}

function drawBrush() {
    push();
    imageMode(CENTER);
    
    // Create a temporary graphics buffer for pixelation
    let tempGraphics = createGraphics(imageSize, imageSize);
    
    // Draw the brush image to the temporary buffer
    tempGraphics.imageMode(CENTER);
    tempGraphics.translate(imageSize/2, imageSize/2);
    tempGraphics.rotate(rotationAngle);
    tempGraphics.image(brushImage, 0, 0, imageSize, imageSize);
    
    // Apply pixelation if enabled
    if (pixelationLevel > 1) {
        tempGraphics.loadPixels();
        for (let y = 0; y < imageSize; y += pixelationLevel) {
            for (let x = 0; x < imageSize; x += pixelationLevel) {
                let i = (x + y * imageSize) * 4;
                let r = tempGraphics.pixels[i];
                let g = tempGraphics.pixels[i + 1];
                let b = tempGraphics.pixels[i + 2];
                let a = tempGraphics.pixels[i + 3];
                
                for (let py = 0; py < pixelationLevel && y + py < imageSize; py++) {
                    for (let px = 0; px < pixelationLevel && x + px < imageSize; px++) {
                        let pi = (x + px + (y + py) * imageSize) * 4;
                        tempGraphics.pixels[pi] = r;
                        tempGraphics.pixels[pi + 1] = g;
                        tempGraphics.pixels[pi + 2] = b;
                        tempGraphics.pixels[pi + 3] = a;
                    }
                }
            }
        }
        tempGraphics.updatePixels();
    }
    
    // Draw the processed image to the canvas
    image(tempGraphics, mouseX, mouseY);
    
    // Clean up
    tempGraphics.remove();
    pop();
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

function updatePixelation() {
    pixelationLevel = parseInt(pixelationSlider.value());
    pixelationValue.html(pixelationLevel);
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