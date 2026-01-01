/**
 * @jest-environment jsdom
 */

describe('Speech Synthesis App', () => {
  let main;

  beforeEach(() => {
    // 1. Reset DOM
    document.body.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="mb-3">
                        <label for="voice" class="form-label">Voice selection</label>
                        <select class="form-select" id="voice" name="voice">
                            <option value="">Select voice</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="pitch" class="form-label">Pitch: <span id="pitch-value">1</span></label>
                        <input class="form-range" id="pitch" max="2" min="0" name="pitch" step="0.1" type="range" value="1">
                    </div>

                    <div class="mb-3">
                        <label for="rate" class="form-label">Rate: <span id="rate-value">1</span></label>
                        <input class="form-range" id="rate" max="10" min="0" name="rate" step="0.1" type="range" value="1">
                    </div>

                    <div class="mb-3">
                        <label for="volume" class="form-label">Volume: <span id="volume-value">1</span></label>
                        <input class="form-range" id="volume" max="1" min="0" name="volume" step="0.1" type="range" value="1">
                    </div>

                    <div class="mb-3">
                        <label for="text" class="form-label">Text value</label>
                        <textarea class="form-control" id="text" name="text" rows="5">Speech synthesis experiment</textarea>
                    </div>

                    <div class="d-grid gap-2 d-md-block text-center mt-4">
                        <button class="btn btn-success me-md-2" id="start" type="button">Start speaking</button>
                        <button class="btn btn-danger" id="stop" type="button">Stop speaking</button>
                    </div>
                </div>
            </div>
    `;

    // 2. Mock SpeechSynthesis
    window.speechSynthesis = {
      getVoices: jest.fn().mockReturnValue([
        { name: 'Voice 1', lang: 'en-US' },
        { name: 'Voice 2', lang: 'en-GB' }
      ]),
      speak: jest.fn(),
      cancel: jest.fn(),
      addEventListener: jest.fn(),
      onvoiceschanged: null
    };

    // Mock SpeechSynthesisUtterance
    window.SpeechSynthesisUtterance = class {
      constructor() {
        this.text = '';
        this.voice = null;
        this.pitch = 1;
        this.rate = 1;
        this.volume = 1;
      }
    };

    // 3. Reset modules and load main.js
    jest.resetModules();
    main = require('./main.js');
  });

  test('populateVoicesDropDown populates the select element', () => {
    const dropdown = document.querySelector('[name="voice"]');

    expect(dropdown.children.length).toBe(2);
    expect(dropdown.children[0].value).toBe('Voice 1');
    expect(dropdown.children[0].textContent).toBe('Voice 1 (en-US)');
    expect(dropdown.children[1].value).toBe('Voice 2');
    expect(dropdown.children[1].textContent).toBe('Voice 2 (en-GB)');
  });

  test('populateVoicesDropDown preserves selection if voice still exists', () => {
    const dropdown = document.querySelector('[name="voice"]');

    // Select a voice
    dropdown.value = 'Voice 2';
    expect(dropdown.value).toBe('Voice 2');

    // Re-populate (simulating voiceschanged event)
    main.populateVoicesDropDown();

    expect(dropdown.value).toBe('Voice 2');
  });

  test('populateVoicesDropDown resets selection if voice no longer exists', () => {
    const dropdown = document.querySelector('[name="voice"]');
    dropdown.value = 'Voice 2';

    // Update mock to remove Voice 2
    window.speechSynthesis.getVoices.mockReturnValue([
        { name: 'Voice 1', lang: 'en-US' },
        { name: 'Voice 3', lang: 'en-CA' }
    ]);

    main.populateVoicesDropDown();

    // Should default to first available or whatever browser/JSDOM decides, but definitely not Voice 2
    expect(dropdown.value).not.toBe('Voice 2');
    expect(dropdown.value).toBe('Voice 1');
  });

  test('setVoice updates the utterance voice and toggles speak', () => {
    const dropdown = document.querySelector('[name="voice"]');

    // Verify initial state
    expect(main.speechSynthesisUtterance.voice).toBeNull();

    // Select the second voice
    dropdown.value = 'Voice 2';

    // Call setVoice manually with 'this' context as the dropdown
    main.setVoice.call(dropdown);

    expect(main.speechSynthesisUtterance.voice.name).toBe('Voice 2');
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(main.speechSynthesisUtterance);
  });

  test('setVoiceOptions updates utterance property and display', () => {
      const pitchInput = document.querySelector('[name="pitch"]');
      pitchInput.value = '1.5';

      main.setVoiceOptions.call(pitchInput);

      expect(main.speechSynthesisUtterance.pitch).toBe('1.5');
      expect(document.getElementById('pitch-value').textContent).toBe('1.5');
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(window.speechSynthesis.speak).toHaveBeenCalledWith(main.speechSynthesisUtterance);
  });

  test('setVoiceOptions updates rate property and display', () => {
      const rateInput = document.querySelector('[name="rate"]');
      rateInput.value = '2.0';

      main.setVoiceOptions.call(rateInput);

      expect(main.speechSynthesisUtterance.rate).toBe('2.0');
      expect(document.getElementById('rate-value').textContent).toBe('2.0');
  });

  test('setVoiceOptions updates volume property and display', () => {
      const volumeInput = document.querySelector('[name="volume"]');
      volumeInput.value = '0.5';

      main.setVoiceOptions.call(volumeInput);

      expect(main.speechSynthesisUtterance.volume).toBe('0.5');
      expect(document.getElementById('volume-value').textContent).toBe('0.5');
  });

  test('toggleSpeakFunctionality(true) cancels and speaks', () => {
      const textInput = document.querySelector('[name="text"]');
      textInput.value = "Hello World";

      main.toggleSpeakFunctionality(true);

      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(main.speechSynthesisUtterance.text).toBe("Hello World");
      expect(window.speechSynthesis.speak).toHaveBeenCalledWith(main.speechSynthesisUtterance);
  });

  test('toggleSpeakFunctionality(false) just cancels', () => {
      // Clear previous calls from initialization
      window.speechSynthesis.speak.mockClear();
      window.speechSynthesis.cancel.mockClear();

      main.toggleSpeakFunctionality(false);

      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  test('Event listeners are attached and working', () => {
      const startButton = document.querySelector('#start');
      const stopButton = document.querySelector('#stop');
      const dropdown = document.querySelector('[name="voice"]');

      // Test start button
      window.speechSynthesis.speak.mockClear();
      startButton.click();
      expect(window.speechSynthesis.speak).toHaveBeenCalled();

      // Test stop button
      window.speechSynthesis.cancel.mockClear();
      stopButton.click();
      expect(window.speechSynthesis.cancel).toHaveBeenCalled();

      // Test dropdown change
      dropdown.value = 'Voice 1';
      const event = new Event('change');
      dropdown.dispatchEvent(event);
      expect(main.speechSynthesisUtterance.voice.name).toBe('Voice 1');
  });
});
