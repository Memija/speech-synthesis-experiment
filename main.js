// Access to Speech Synthesis Utterance instance.
const speechSynthesisUtterance = new SpeechSynthesisUtterance();


// DOM (Document Object Model) variables.

// Voice options.
const options = document.querySelectorAll('[type="range"]');

// Voices drop-down.
const voicesDropDown = document.querySelector('[name="voice"]');

// Text to be spoken.
const text = document.querySelector('[name="text"]');

// Start speaking action button handler.
const startButton = document.querySelector('#start');

// Stop speaking action button handler.
const stopButton = document.querySelector('#stop');


// DOM (Document Object Model) related functions.

/**
 * Populate voices drop-down.
 */
function populateVoicesDropDown() {
    const selectedVoice = voicesDropDown.value;

    voicesDropDown.innerHTML = speechSynthesis
        .getVoices()
        .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
        .join('');

    // Restore selection if possible
    if (selectedVoice) {
         // Check if the previously selected voice is still in the list
         const voiceExists = [...voicesDropDown.options].some(option => option.value === selectedVoice);
         if (voiceExists) {
             voicesDropDown.value = selectedVoice;
         }
    }
}

/**
 * Set voice.
 */
function setVoice() {
    speechSynthesisUtterance.voice = speechSynthesis
        .getVoices()
        .find(voice => voice.name === this.value);
    toggleSpeakFunctionality();
}

/**
 * Update the visual display of the option value.
 */
function updateValueDisplay() {
    const valueDisplay = document.getElementById(`${this.name}-value`);
    if (valueDisplay) {
        valueDisplay.textContent = this.value;
    }
}

/**
 * Set voice options.
 */
function setVoiceOptions() {
    speechSynthesisUtterance[this.name] = this.value;
    updateValueDisplay.call(this);
    toggleSpeakFunctionality();
}

/**
 * Toggle speak functionality.
 * Cancel the current speaking process and start one a new unless explicitly requested not to start it again.
 * 
 * @param {boolean} startOver - Start speaking from the beginning of the requested text.
 */
function toggleSpeakFunctionality(startOver = true) {
    speechSynthesis.cancel();

    speechSynthesisUtterance.text = text.value;

    if (startOver) {
        speechSynthesis.speak(speechSynthesisUtterance);
    }
}


// Event listeners.

if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.addEventListener('voiceschanged', populateVoicesDropDown);
}

voicesDropDown.addEventListener('change', setVoice);

options.forEach(option => {
    option.addEventListener('input', updateValueDisplay);
    option.addEventListener('change', setVoiceOptions);
});

startButton.addEventListener('click', () => toggleSpeakFunctionality(true));
stopButton.addEventListener('click', () => toggleSpeakFunctionality(false));

// Initialize voice list
if (typeof speechSynthesis !== 'undefined') {
    populateVoicesDropDown();
}

if (typeof module !== 'undefined') {
    module.exports = {
        populateVoicesDropDown,
        setVoice,
        updateValueDisplay,
        setVoiceOptions,
        toggleSpeakFunctionality,
        speechSynthesisUtterance
    };
}
