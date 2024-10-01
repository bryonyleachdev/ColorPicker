function handleColorSelection(abortController) {
  return new Promise((resolve, reject) => {
    try {
      const eyeDropper = new EyeDropper();
      eyeDropper.open().then((color) => {
        resolve(color);
      }).catch((error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function getColorResultElement() {
  return document.getElementById('colorResult');
}

// Color code extraction
function extractColorCode(text) {
  const colorCodeRegex = /^#([0-9a-fA-F]{6})$/;
  const match = text.match(colorCodeRegex);
  return match ? match[1] : null;
}

// Main code
async function main() {
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
}

// Function to get luminance of a color
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

// Function to update color result
function updateColorResult(color, luminance) {
  const colorResult = getColorResultElement();
  colorResult.style.backgroundColor = color;
  colorResult.style.color = luminance > 0.5 ? 'black' : 'white';
  colorResult.style.display = 'block';
}

// Function to copy color code to clipboard
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

// Event listeners
function addEventListeners() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || (event.ctrlKey && event.key === 'c')) {
      const colorResult = getColorResultElement();
      colorResult.style.display = 'none';
    }
  });

  document.addEventListener('click', () => {
    const colorResult = getColorResultElement();
    colorResult.style.display = 'none';
  });
}

// colorResult location
document.addEventListener('mousemove', (event) => {
  const colorResult = getColorResultElement();
  if (colorResult.style.display !== 'none') {
    colorResult.style.left = `${event.clientX + 10}px`;
    colorResult.style.top = `${event.clientY + 10}px`;
  }
});

main();