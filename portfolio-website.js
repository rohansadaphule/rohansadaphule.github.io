const textArray = [
  "Data Scientist",
  "Python Programmer",
  "AI/ML Enthusiast",
]; // Add your texts here
let index = 0;

const changingTextElement = document.getElementById("changing-text");

function updateText() {
  const currentText = changingTextElement.textContent;
  const nextText = textArray[index];

  if (currentText !== nextText) {
    // Fade-out effect
    changingTextElement.style.opacity = 0;

    setTimeout(() => {
      // Change the text after fading out
      changingTextElement.textContent = nextText;
      // Fade-in effect
      changingTextElement.style.opacity = 1;
      // Update the index
      index = (index + 1) % textArray.length;
    }, 500); // Matches the transition time in CSS
  } else {
    // Update the index if the text hasn't changed
    index = (index + 1) % textArray.length;
  }
}

// Initialize the text and start the interval
changingTextElement.textContent = textArray[index];
setInterval(updateText, 2000); // Change every 2 seconds
