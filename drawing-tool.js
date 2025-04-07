let canvas;
let drawingImages = [];
let currentImageIndex = 0;
let lastDrawTime = 0;
let autoCycleInterval = 5000; // 5 seconds default
let rotationSpeed = 5;
let pulseSpeed = 5;
let baseSize = 100;
let hasStroke = false;
let pixelationLevel = 1;
let drawings = [];

// DOM elements
let imageUpload;
let rotationSpeedSlider;
let rotationValue;
let pulseSpeedSlider;
let pulseValue;
let sizeSlider;
let sizeValue;
let strokeCheckbox;
let pixelationSlider;
let pixelationValue;
let saveButton;
let clearButton;

function setup() {
    // Set frame rate
    frameRate(50);
    
    // Create canvas
    canvas = createCanvas(1169, 1653);
    canvas.parent('canvas-container');
    
    // Set background
    background(255);
    
    // Get DOM elements
    imageUpload = select('#image-upload');
    rotationSpeedSlider = select('#rotation-speed');
    rotationValue = select('#rotation-value');
    pulseSpeedSlider = select('#pulse-speed');
    pulseValue = select('#pulse-value');
    sizeSlider = select('#size-slider');
    sizeValue = select('#size-value');
    strokeCheckbox = select('#stroke-checkbox');
    pixelationSlider = select('#pixelation-slider');
    pixelationValue = select('#pixelation-value');
    saveButton = select('#save-btn');
    clearButton = select('#clear-btn');
    
    // Set up event listeners
    imageUpload.input(handleImageUpload);
    rotationSpeedSlider.input(updateRotationSpeed);
    pulseSpeedSlider.input(updatePulseSpeed);
    sizeSlider.input(updateSize);
    strokeCheckbox.changed(toggleStroke);
    pixelationSlider.input(updatePixelation);
    saveButton.mousePressed(saveDrawing);
    clearButton.mousePressed(clearCanvas);
}

function draw() {
    // Clear the canvas
    background(255);
    
    // Draw all existing drawings
    for (let drawing of drawings) {
        push();
        translate(drawing.x, drawing.y);
        rotate(drawing.rotation);
        
        // Apply pulse effect
        const pulse = sin(frameCount * 0.01 * drawing.pulseSpeed) * 0.2 + 1;
        const size = drawing.baseSize * pulse;
        
        // Apply pixelation if enabled
        if (drawing.pixelationLevel > 1) {
            drawing.image.loadPixels();
            const temp = createImage(drawing.image.width, drawing.image.height);
            temp.copy(drawing.image, 0, 0, drawing.image.width, drawing.image.height, 0, 0, drawing.image.width, drawing.image.height);
            
            for (let y = 0; y < temp.height; y += drawing.pixelationLevel) {
                for (let x = 0; x < temp.width; x += drawing.pixelationLevel) {
                    const i = (x + y * temp.width) * 4;
                    const r = temp.pixels[i];
                    const g = temp.pixels[i + 1];
                    const b = temp.pixels[i + 2];
                    
                    for (let py = 0; py < drawing.pixelationLevel && y + py < temp.height; py++) {
                        for (let px = 0; px < drawing.pixelationLevel && x + px < temp.width; px++) {
                            const pi = (x + px + (y + py) * temp.width) * 4;
                            temp.pixels[pi] = r;
                            temp.pixels[pi + 1] = g;
                            temp.pixels[pi + 2] = b;
                        }
                    }
                }
            }
            
            temp.updatePixels();
            image(temp, -size/2, -size/2, size, size);
            temp.remove();
        } else {
            image(drawing.image, -size/2, -size/2, size, size);
        }
        
        // Apply stroke if enabled
        if (drawing.hasStroke) {
            stroke(0);
            strokeWeight(2);
            noFill();
            rect(-size/2, -size/2, size, size);
        }
        
        pop();
    }
    
    // Auto-cycle through images when drawing
    if (mouseIsPressed && drawingImages.length > 0) {
        const currentTime = millis();
        if (currentTime - lastDrawTime >= autoCycleInterval) {
            currentImageIndex = (currentImageIndex + 1) % drawingImages.length;
            lastDrawTime = currentTime;
        }
    }
}

function mouseDragged() {
    if (drawingImages.length > 0) {
        // Create new drawing
        const drawing = {
            image: drawingImages[currentImageIndex],
            x: mouseX,
            y: mouseY,
            rotation: frameCount * 0.01 * rotationSpeed,
            pulseSpeed: pulseSpeed,
            baseSize: baseSize,
            hasStroke: hasStroke,
            pixelationLevel: pixelationLevel
        };
        
        drawings.push(drawing);
    }
}

function handleImageUpload() {
    const files = imageUpload.elt.files;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = loadImage(event.target.result, () => {
                drawingImages.push(img);
            });
        };
        reader.readAsDataURL(file);
    }
}

function updateRotationSpeed() {
    rotationSpeed = rotationSpeedSlider.value();
    rotationValue.html(rotationSpeed);
}

function updatePulseSpeed() {
    pulseSpeed = pulseSpeedSlider.value();
    pulseValue.html(pulseSpeed);
}

function updateSize() {
    baseSize = sizeSlider.value();
    sizeValue.html(baseSize);
}

function toggleStroke() {
    hasStroke = strokeCheckbox.checked();
}

function updatePixelation() {
    pixelationLevel = pixelationSlider.value();
    pixelationValue.html(pixelationLevel);
}

function generateRandomName() {
    const adjectives = ['Cool', 'Awesome', 'Great', 'Amazing', 'Fantastic', 'Super', 'Epic', 'Incredible'];
    const nouns = ['Drawing', 'Art', 'Creation', 'Design', 'Work', 'Piece', 'Masterpiece', 'Sketch'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}`;
}

function saveDrawing() {
    const randomName = generateRandomName();
    const category = 'drawing';
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const filename = `${randomName}_${category}_${dateStr}_${seconds}.png`;
    saveCanvas(canvas, filename, 'png');
}

function clearCanvas() {
    drawings = [];
    background(255);
} 