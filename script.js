// Luminance threshold
const LUMINANCE_THRESHOLD = 0.7;

// Function to calculate the luminance
function getLuminance(color) {
  const rgb = parseInt(color.slice(1), 16); // Convert hex to integer
  const red = (rgb >> 16) & 0xff; // Extract red
  const green = (rgb >> 8) & 0xff; // Extract green
  const blue = (rgb >> 0) & 0xff; // Extract blue

  // Calculate luminance in the sRGB color space
  const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;

  // Normalize luminance to the range [0, 255]
  return luminance / 255;
}

// Function to sample color from the screen
async function sampleColorFromScreen(abortController) {
  const eyeDropper = new EyeDropper();
  const result = await eyeDropper.open({ signal: abortController.signal });
  return result?.sRGBHex;
}

// Function to style color result element
function updateColorResult(color, luminance) {
  const colorResult = getColorResultElement();
  colorResult.textContent = `Selected color: ${color}`;
  colorResult.style.cssText = `background-color: ${color}; color: ${luminance > LUMINANCE_THRESHOLD ? 'grey' : 'black'};`;
  colorResult.style.display = 'block';
}

// Function to handle Event Listeners
function addEventListeners() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const colorResult = getColorResultElement();
      colorResult.style.display = 'none';
    }
  });

  document.addEventListener('click', () => {
    const colorResult = getColorResultElement();
    colorResult.style.display = 'none';
  });

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'c') {
      const colorResult = getColorResultElement();
      const text = colorResult.textContent;
      const colorCode = extractColorCode(text);
      if (colorCode) {
        navigator.clipboard.writeText(colorCode[0].substring(1));
      }
    }
  });
}

// Check if the EyeDropper API is supported
if ('EyeDropper' in window) {
  document.getElementById('colorPickerButton').addEventListener('click', async () => {
    const abortController = new AbortController();
    const color = await handleColorSelection(abortController);
    if (color) {
      const luminance = getLuminance(color);
      updateColorResult(color, luminance);
      addEventListeners();
    } else {
      const colorResult = getColorResultElement();
      colorResult.style.backgroundColor = 'transparent';
      colorResult.style.color = 'black';
    }
  });
} else {
  // Display "Browser not supported" message if the API is not supported
  const colorResult = getColorResultElement();
  colorResult.textContent = "Browser not supported";
  colorResult.style.backgroundColor = 'transparent';
  colorResult.style.color = 'red';
  colorResult.style.display = 'block';
  console.log('EyeDropper API not supported by browser');
}

// Function to hide color result element
function hideColorResult(event) {
  if (event.key === 'Escape' || event.type === 'click') {
    getColorResultElement().style.display = 'none';
    document.removeEventListener(event.type, hideColorResult);
  }
}


// Function to copy color code to the clipboard
function copyOnCtrlC(event) {
  if (event.ctrlKey && event.key === 'c') {
    const colorResult = getColorResultElement();
    const text = colorResult.textContent;
    const colorCode = extractColorCode(text);
    if (colorCode) {
      const plainColorCode = colorCode[0].substring(1); // Remove the '#' character
      navigator.clipboard.writeText(plainColorCode).then(() => {
        console.log('Color copied to clipboard:', plainColorCode);
      }).catch(err => {
        console.error('Failed to copy text to clipboard:', err);
      });
    }
  }
}

// Color code extraction logic
function extractColorCode(text) {
  if (text.startsWith('#')) {
    return text;
  }
  return null;
}

// Function to get color result element
function getColorResultElement() {
  return document.getElementById('colorResult');
}

document.addEventListener('mousemove', (event) => {
  const colorResult = getColorResultElement();
  colorResult.style.left = `${event.pageX + 10}px`; // Offset by 10px to avoid overlapping with the cursor
  colorResult.style.top = `${event.pageY + 10}px`;
});

document.addEventListener('keydown', hideColorResult);
document.addEventListener('click', hideColorResult);
document.addEventListener('keydown', copyOnCtrlC);