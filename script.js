// Function to calculate the luminance of a hex color
function getLuminance(hexColor) {
  const rgb = parseInt(hexColor.slice(1), 16); // Convert hex to integer
  const r = (rgb >> 16) & 0xff; // Extract red
  const g = (rgb >>  8) & 0xff; // Extract green
  const b = (rgb >>  0) & 0xff; // Extract blue

  // Calculate luminance in the sRGB color space
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance / 255;
}

// Function to sample color from the screen using the EyeDropper API
async function sampleColorFromScreen(abortController) {
  const eyeDropper = new EyeDropper();
  try {
    const result = await eyeDropper.open({ signal: abortController.signal });
    return result.sRGBHex;
  } catch (e) {
    return null;
  }
}

// Event listener for the color picker button
document.getElementById('colorPickerButton').addEventListener('click', async () => {
  const abortController = new AbortController();
  const color = await sampleColorFromScreen(abortController);

  const colorResult = document.getElementById('colorResult');
  if (color) {
    colorResult.textContent = `Selected color: ${color}`;
    colorResult.style.backgroundColor = color;

    const luminance = getLuminance(color);
    colorResult.style.color = luminance > 0.7 ? 'grey' : 'black';
  } else {
    colorResult.style.backgroundColor = 'transparent';
    colorResult.style.color = 'black';
  }
  colorResult.style.display = 'block';

  // Add event listener to hide result on Escape key press
  document.addEventListener('keydown', hideOnEscape);

  // Hide the result when clicking anywhere on the screen
  document.addEventListener('click', hideResult);

  // Add event listener for Ctrl+C to copy color result
  document.addEventListener('keydown', copyOnCtrlC);
});

document.addEventListener('mousemove', (event) => {
  const colorResult = document.getElementById('colorResult');
  colorResult.style.left = `${event.pageX + 10}px`; // Offset by 10px to avoid overlapping with the cursor
  colorResult.style.top = `${event.pageY + 10}px`;
});

function hideOnEscape(event) {
  if (event.key === 'Escape') {
    const colorResult = document.getElementById('colorResult');
    colorResult.style.display = 'none';
    document.removeEventListener('keydown', hideOnEscape); // Remove event listener to prevent repeated hiding
  }
}

function hideResult(event) {
  const colorResult = document.getElementById('colorResult');
  colorResult.style.display = 'none';
  document.removeEventListener('click', hideResult);
}

function copyOnCtrlC(event) {
  if (event.ctrlKey && event.key === 'c') {
    const colorResult = document.getElementById('colorResult');
    const text = colorResult.textContent;
    const colorCode = text.match(/#[0-9a-fA-F]{6}/); // Extract the color code
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