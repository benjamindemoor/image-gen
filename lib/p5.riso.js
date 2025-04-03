const RISOCOLORS = [
  { name: "BLACK", color: [0, 0, 0] },
  { name: "BURGUNDY", color: [145, 78, 114] },
  { name: "BLUE", color: [0, 120, 191] },
  { name: "GREEN", color: [0, 169, 92] },
  { name: "MEDIUMBLUE", color: [50, 85, 164] },
  { name: "BRIGHTRED", color: [241, 80, 96] },
  { name: "RISOFEDERALBLUE", color: [61, 85, 136] },
  { name: "PURPLE", color: [118, 91, 167] },
  { name: "TEAL", color: [0, 131, 138] },
  { name: "FLATGOLD", color: [187, 139, 65] },
  { name: "HUNTERGREEN", color: [64, 112, 96] },
  { name: "RED", color: [255, 102, 94] },
  { name: "BROWN", color: [146, 95, 82] },
  { name: "YELLOW", color: [255, 232, 0] },
  { name: "MARINERED", color: [210, 81, 94] },
  { name: "ORANGE", color: [255, 108, 47] },
  { name: "FLUORESCENTPINK", color: [255, 72, 176] },
  { name: "LIGHTGRAY", color: [136, 137, 138] },
  { name: "METALLICGOLD", color: [172, 147, 110] },
  { name: "CRIMSON", color: [228, 93, 80] },
  { name: "FLUORESCENTORANGE", color: [255, 116, 119] },
  { name: "CORNFLOWER", color: [98, 168, 229] },
  { name: "SKYBLUE", color: [73, 130, 207] },
  { name: "SEABLUE", color: [0, 116, 162] },
  { name: "LAKE", color: [35, 91, 168] },
  { name: "INDIGO", color: [72, 77, 122] },
  { name: "MIDNIGHT", color: [67, 80, 96] },
  { name: "MIST", color: [213, 228, 192] },
  { name: "GRANITE", color: [165, 170, 168] },
  { name: "CHARCOAL", color: [112, 116, 124] },
  { name: "SMOKYTEAL", color: [95, 130, 137] },
  { name: "STEEL", color: [55, 94, 119] },
  { name: "SLATE", color: [94, 105, 94] },
  { name: "TURQUOISE", color: [0, 170, 147] },
  { name: "EMERALD", color: [25, 151, 93] },
  { name: "GRASS", color: [57, 126, 88] },
  { name: "FOREST", color: [81, 110, 90] },
  { name: "SPRUCE", color: [74, 99, 93] },
  { name: "MOSS", color: [104, 114, 77] },
  { name: "SEAFOAM", color: [98, 194, 177] },
  { name: "KELLYGREEN", color: [103, 179, 70] },
  { name: "LIGHTTEAL", color: [0, 157, 165] },
  { name: "IVY", color: [22, 155, 98] },
  { name: "PINE", color: [35, 126, 116] },
  { name: "LAGOON", color: [47, 97, 101] },
  { name: "VIOLET", color: [157, 122, 210] },
  { name: "ORCHID", color: [170, 96, 191] },
  { name: "PLUM", color: [132, 89, 145] },
  { name: "RAISIN", color: [119, 93, 122] },
  { name: "GRAPE", color: [108, 93, 128] },
  { name: "SCARLET", color: [246, 80, 88] },
  { name: "TOMATO", color: [210, 81, 94] },
  { name: "CRANBERRY", color: [209, 81, 122] },
  { name: "MAROON", color: [158, 76, 110] },
  { name: "RASPBERRYRED", color: [209, 81, 122] },
  { name: "BRICK", color: [167, 81, 84] },
  { name: "LIGHTLIME", color: [227, 237, 85] },
  { name: "SUNFLOWER", color: [255, 181, 17] },
  { name: "MELON", color: [255, 174, 59] },
  { name: "APRICOT", color: [246, 160, 77] },
  { name: "PAPRIKA", color: [238, 127, 75] },
  { name: "PUMPKIN", color: [255, 111, 76] },
  { name: "BRIGHTOLIVEGREEN", color: [180, 159, 41] },
  { name: "BRIGHTGOLD", color: [186, 128, 50] },
  { name: "COPPER", color: [189, 100, 57] },
  { name: "MAHOGANY", color: [142, 89, 90] },
  { name: "BISQUE", color: [242, 205, 207] },
  { name: "BUBBLEGUM", color: [249, 132, 202] },
  { name: "LIGHTMAUVE", color: [230, 181, 201] },
  { name: "DARKMAUVE", color: [189, 140, 166] },
  { name: "WINE", color: [145, 78, 114] },
  { name: "GRAY", color: [146, 141, 136] },
  { name: "CORAL", color: [255, 142, 145] },
  { name: "WHITE", color: [255, 255, 255] },
  { name: "AQUA", color: [94, 200, 229] },
  { name: "MINT", color: [130, 216, 213] },
  { name: "CLEARMEDIUM", color: [242, 242, 242] },
  { name: "FLUORESCENTYELLOW", color: [255, 233, 22] },
  { name: "FLUORESCENTRED", color: [255, 76, 101] },
  { name: "FLUORESCENTGREEN", color: [68, 214, 44] }
];

class RisoColorNode {
  constructor(point, axis) {
    this.point = point;
    this.left = null;
    this.right = null;
    this.axis = axis;
  }
}

class RisoKDTree {
  constructor(points, depth = 0) {
    if (points.length === 0) {
      this.node = null;
      return;
    }

    // Select axis based on depth so that axis cycles through all available dimensions
    const k = points[0][0].length;
    const axis = depth % k;

    // Sort point array and choose median as pivot element
    points.sort((a, b) => a[0][axis] - b[0][axis]);
    const median = Math.floor(points.length / 2);

    // Create node and construct subtrees
    this.node = new RisoColorNode(points[median], axis);
    this.node.left = new RisoKDTree(points.slice(0, median), depth + 1).node;
    this.node.right = new RisoKDTree(points.slice(median + 1), depth + 1).node;
  }

  // Euclidean distance between two points in k dimensions
  static distanceSquared(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      let diff = a[i] - b[i];
      sum += diff * diff;
    }
    return sum;
  }

  static colorDistance(color1, color2) {
    return Math.sqrt(
      Math.pow(color1[0] - color2[0], 2) +
      Math.pow(color1[1] - color2[1], 2) +
      Math.pow(color1[2] - color2[2], 2)
    );
  }

  findNearest(point, best = null) {
    if (this.node === null) return best;

    const distSq = RisoKDTree.distanceSquared(point, this.node.point[0]);
    if (best === null || distSq < best.distSq) {
      best = { point: this.node.point, distSq };
    }

    const axisDist = point[this.node.axis] - this.node.point[0][this.node.axis];

    if (axisDist < 0) {
      return this.node.left.findNearest(point, best);
    } else {
      return this.node.right.findNearest(point, best);
    }
  }
}

class Riso {
  constructor() {
    this.colors = [];
    this.channels = [];
    this.kdtree = null;
  }

  addColor(colorName) {
    const color = RISOCOLORS.find(c => c.name === colorName);
    if (color) {
      this.colors.push(color);
      this.channels.push(null);
      this.kdtree = new RisoKDTree(this.colors.map(c => [c.color]));
    }
  }

  getChannel(colorName) {
    const index = this.colors.findIndex(c => c.name === colorName);
    if (index === -1) return null;
    return this.channels[index];
  }

  drawImage(img, colorName) {
    const channel = this.getChannel(colorName);
    if (!channel) return;

    channel.loadPixels();
    img.loadPixels();

    for (let i = 0; i < img.pixels.length; i += 4) {
      const r = img.pixels[i];
      const g = img.pixels[i + 1];
      const b = img.pixels[i + 2];
      const a = img.pixels[i + 3];

      const color = [r, g, b];
      const nearest = this.kdtree.findNearest(color);
      const threshold = 128;

      if (nearest.point[0].join(',') === this.colors.find(c => c.name === colorName).color.join(',')) {
        channel.pixels[i] = r < threshold ? 0 : 255;
        channel.pixels[i + 1] = g < threshold ? 0 : 255;
        channel.pixels[i + 2] = b < threshold ? 0 : 255;
      } else {
        channel.pixels[i] = 255;
        channel.pixels[i + 1] = 255;
        channel.pixels[i + 2] = 255;
      }

      channel.pixels[i + 3] = a;
    }

    channel.updatePixels();
    return channel;
  }
}

function halftoneImage(img, shape, frequency, angle, intensity) {
  if (shape === undefined) shape = "circle";
  if (frequency === undefined) frequency = 10;
  if (angle === undefined) angle = 45;
  if (intensity === undefined) intensity = 127;

  const halftonePatterns = {
    line(c, x, y, g, d) {
      c.rect(x, y, g, g * d);
    },
    square(c, x, y, g, d) {
      c.rect(x, y, g * d, g * d);
    },
    circle(c, x, y, g, d) {
      c.ellipse(x, y, d * g, d * g);
    },
    ellipse(c, x, y, g, d) {
      c.ellipse(x, y, g * d * 0.7, g * d);
    },
    cross(c, x, y, g, d) {
      c.rect(x, y, g, g * d);
      c.rect(x, y, g * d, g);
    }
  };

  patternFunction = typeof shape === "function" ? shape : halftonePatterns[shape];

  const w = img.width;
  const h = img.height;
  const p = _getP5Instance();
  const rotatedCanvas = p.createGraphics(img.width * 2, img.height * 2);
  rotatedCanvas.background(255);
  rotatedCanvas.imageMode(p.CENTER);
  rotatedCanvas.push();
  rotatedCanvas.translate(img.width, img.height);
  rotatedCanvas.rotate(-angle);
  rotatedCanvas.image(img, 0, 0);
  rotatedCanvas.pop();
  rotatedCanvas.loadPixels();

  const out = p.createGraphics(w * 2, h * 2);
  out.background(255);
  out.ellipseMode(p.CORNER);
  out.rectMode(p.CENTER);
  out.fill(0);
  out.noStroke();

  let gridsize = frequency;
  for (let x = 0; x < w * 2; x += gridsize) {
    for (let y = 0; y < h * 2; y += gridsize) {
      const avg = rotatedCanvas.pixels[(x + y * w * 2) * 4];
      if (avg < 255) {
        const darkness = (255 - avg) / 255;
        patternFunction(out, x, y, gridsize, darkness);
      }
    }
  }

  rotatedCanvas.background(255);
  rotatedCanvas.push();
  rotatedCanvas.translate(w, h);
  rotatedCanvas.rotate(angle);
  rotatedCanvas.image(out, 0, 0);
  rotatedCanvas.pop();

  const result = rotatedCanvas.get(w / 2, h / 2, w, h);
  if (intensity === false) {
    return result;
  } else {
    return ditherImage(result, "none", intensity);
  }
}

function ditherImage(img, type, threshold) {
  if (threshold === undefined) threshold = 128;
  let out = img.get();
  let w = out.width;
  let newPixel, err;
  let bayerThresholdMap = [
    [15, 135, 45, 165],
    [195, 75, 225, 105],
    [60, 180, 30, 150],
    [240, 120, 210, 90]
  ];
  let lumR = [];
  let lumG = [];
  let lumB = [];

  out.loadPixels();
  for (let i = 0; i < 256; i++) {
    lumR[i] = i * 0.299;
    lumG[i] = i * 0.587;
    lumB[i] = i * 0.114;
  }

  for (let i = 0; i <= out.pixels.length; i += 4) {
    out.pixels[i] = Math.floor(
      lumR[out.pixels[i]] + lumG[out.pixels[i + 1]] + lumB[out.pixels[i + 2]]
    );
  }

  for (let i = 0; i <= out.pixels.length; i += 4) {
    if (type === "none") {
      // No dithering
      out.pixels[i] = out.pixels[i] < threshold ? 0 : 255;
    } else if (type === "bayer") {
      // 4x4 Bayer ordered dithering algorithm
      let x = (i / 4) % w;
      let y = Math.floor(i / 4 / w);
      let map = Math.floor(
        (out.pixels[i] + bayerThresholdMap[x % 4][y % 4]) / 2
      );
      out.pixels[i] = map < threshold ? 0 : 255;
    } else if (type === "floydsteinberg") {
      // Floyd–Steinberg dithering algorithm
      newPixel = out.pixels[i] < 129 ? 0 : 255;
      err = Math.floor((out.pixels[i] - newPixel) / 16);
      out.pixels[i] = newPixel;
      out.pixels[i + 4] += err * 7;
      out.pixels[i + 4 * w - 4] += err * 3;
      out.pixels[i + 4 * w] += err * 5;
      out.pixels[i + 4 * w + 4] += err * 1;
    } else {
      // Bill Atkinson's dithering algorithm
      newPixel = out.pixels[i] < 129 ? 0 : 255;
      err = Math.floor((out.pixels[i] - newPixel) / 8);
      out.pixels[i] = newPixel;
      out.pixels[i + 4] += err;
      out.pixels[i + 8] += err;
      out.pixels[i + 4 * w - 4] += err;
      out.pixels[i + 4 * w] += err;
      out.pixels[i + 4 * w + 4] += err;
      out.pixels[i + 8 * w] += err;
    }

    // Set g and b pixels equal to r
    out.pixels[i + 1] = out.pixels[i + 2] = out.pixels[i];
  }

  out.updatePixels();
  return out;
}

p5.Image.prototype.cutout = function(p5Image) {
  if (p5Image === undefined) {
    p5Image = this;
  }
  let currBlend = this.drawingContext.globalCompositeOperation;
  let scaleFactor = 1;
  if (p5Image instanceof p5.Renderer) {
    scaleFactor = p5Image._pInst._pixelDensity;
  }
  let copyArgs = [
    p5Image,
    0,
    0,
    scaleFactor * p5Image.width,
    scaleFactor * p5Image.height,
    0,
    0,
    this.width,
    this.height
  ];
  this.drawingContext.globalCompositeOperation = "destination-out";
  p5.Image.prototype.copy.apply(this, copyArgs);
  this.drawingContext.globalCompositeOperation = currBlend;
  this.setModified(true);
};

Riso.channels = []; 