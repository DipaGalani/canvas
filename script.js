const BRUSH_TIME = 1500;

const activeToolEl = document.querySelector("#active-tool");
const brushIcon = document.querySelector("#brush");
const brushColorSelector = document.querySelector("#brush-color");
const brushSize = document.querySelector("#brush-size");
const brushSlider = document.querySelector("#brush-slider");
const backgroundColorSelector = document.querySelector(
  "#canvas-background-color"
);
const eraser = document.querySelector("#eraser");
const clearCanvasBtn = document.querySelector("#clear-canvas");
const saveStorageBtn = document.querySelector("#save-storage");
const loadStorageBtn = document.querySelector("#load-storage");
const clearStorageBtn = document.querySelector("#clear-storage");
const downloadBtn = document.querySelector("#download");
const { body } = document;

// Global Variables
const canvas = document.createElement("canvas");
canvas.id = "canvas";
const context = canvas.getContext("2d");

let currentSize = 10; // Brush/Eraser Size
let canvasBackgroundColor = "#FFFFFF"; // Background Color
let currentColor = "#A51DAB"; // Brush/Eraser Color, Eraser is still a brush that paints with the background color.

let isEraser = false;
let isMouseDown = false;
let drawnArray = [];

// Formatting Brush Size
function displayBrushSize() {
  if (brushSlider.value < 10) {
    brushSize.textContent = `0${brushSlider.value}`;
  } else {
    brushSize.textContent = brushSlider.value;
  }
}

// Setting Brush Size
brushSlider.addEventListener("change", () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

// Setting Brush Color
brushColorSelector.addEventListener("change", () => {
  isEraser = false;
  currentColor = `#${brushColorSelector.value}`;
});

// Setting Background Color
backgroundColorSelector.addEventListener("change", () => {
  canvasBackgroundColor = `#${backgroundColorSelector.value}`;
  createCanvas();
  restoreCanvas();
});

// // Eraser
eraser.addEventListener("click", () => {
  isEraser = true;
  brushIcon.style.color = "white";
  eraser.style.color = "black";
  activeToolEl.textContent = "Eraser";
  currentColor = canvasBackgroundColor;
  currentSize = 50;
});

// // Switch back to Brush
function switchToBrush() {
  isEraser = false;
  activeToolEl.textContent = "Brush";
  brushIcon.style.color = "black";
  eraser.style.color = "white";
  currentColor = `#${brushColorSelector.value}`;
  currentSize = 10;
  brushSlider.value = 10;
  displayBrushSize();
}

function brushSetTimeout(ms) {
  setTimeout(switchToBrush, ms);
}

// Create Canvas
function createCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;
  context.fillStyle = canvasBackgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  body.appendChild(canvas);
  switchToBrush();
}

// Clear Canvas
clearCanvasBtn.addEventListener("click", () => {
  createCanvas();
  drawnArray = [];
  // Active Tool
  activeToolEl.textContent = "Canvas Cleared";
  brushSetTimeout(BRUSH_TIME);
});

// // Draw what is stored in DrawnArray
function restoreCanvas() {
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = "round";
    if (drawnArray[i].eraser) {
      context.strokeStyle = canvasBackgroundColor;
    } else {
      context.strokeStyle = drawnArray[i].color;
    }
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

// Store Drawn Lines in DrawnArray
function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };
  console.log(line);
  drawnArray.push(line);
}

// Get Mouse Position
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

// Mouse Down
canvas.addEventListener("mousedown", (event) => {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);
  console.log("mouse is clicked", currentPosition);
  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
  context.lineWidth = currentSize;
  context.lineCap = "round";
  context.strokeStyle = currentColor;
});

// Mouse Move
canvas.addEventListener("mousemove", (event) => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser
    );
  } else {
    storeDrawn(undefined);
  }
});

// Mouse Up
canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

// Save to Local Storage
saveStorageBtn.addEventListener("click", () => {
  localStorage.setItem("savedCanvas", JSON.stringify(drawnArray));
  // Active Tool
  activeToolEl.textContent = "Canvas Saved";
  brushSetTimeout(BRUSH_TIME);
});

// Load from Local Storage
loadStorageBtn.addEventListener("click", () => {
  if (localStorage.getItem("savedCanvas")) {
    drawnArray = JSON.parse(localStorage.savedCanvas);
    restoreCanvas();
    // Active Tool
    activeToolEl.textContent = "Canvas Loaded";
    brushSetTimeout(BRUSH_TIME);
  } else {
    activeToolEl.textContent = "No Canvas Found ";
    brushSetTimeout(BRUSH_TIME);
  }
});

// Clear Local Storage
clearStorageBtn.addEventListener("click", () => {
  localStorage.removeItem("savedCanvas");
  // Active Tool
  activeToolEl.textContent = "Local Storage Cleared";
  brushSetTimeout(BRUSH_TIME);
});

// Download Image
downloadBtn.addEventListener("click", () => {
  downloadBtn.href = canvas.toDataURL("image/jpeg", 1);
  downloadBtn.download = "paint-example.jpeg";
  // Active Tool
  activeToolEl.textContent = "Image File Saved";
  brushSetTimeout(BRUSH_TIME);
});

// Event Listener
brushIcon.addEventListener("click", switchToBrush);

// On Load
createCanvas();
