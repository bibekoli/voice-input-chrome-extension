(function () {
  if (window.voiceInputExtensionLoaded) return;
  window.voiceInputExtensionLoaded = true;

  // State variables
  let recognition = null;
  let isListening = false;
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  // Supported browsers standard
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error("Speech Recognition API is not supported in this browser.");
    return;
  }

  // Create UI
  const uiContainer = document.createElement('div');
  uiContainer.id = 'vic-floating-ui';
  uiContainer.className = 'vic-hidden';

  const defaultContent = `
    <div id="vic-header">
      <div id="vic-title">
        <svg class="vic-mic-icon" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm0 14.5c3.53 0 6.4-2.8 6.4-6.25h1.6c0 4.12-3.1 7.54-7.2 8.04V22h-1.6v-3.71C7.1 17.79 4 14.37 4 10.25h1.6c0 3.45 2.87 6.25 6.4 6.25z"/></svg>
        Voice Input
      </div>
      <button id="vic-close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
    <div id="vic-body">
      <div class="vic-control-group">
        <label class="vic-label" for="vic-lang-select">Language</label>
        <select id="vic-lang-select">
          <option value="en-US">English (US)</option>
          <option value="ne-NP">Nepali</option>
        </select>
      </div>
      <button id="vic-toggle-btn">
        <svg class="vic-mic-icon" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm0 14.5c3.53 0 6.4-2.8 6.4-6.25h1.6c0 4.12-3.1 7.54-7.2 8.04V22h-1.6v-3.71C7.1 17.79 4 14.37 4 10.25h1.6c0 3.45 2.87 6.25 6.4 6.25z"/></svg>
        Start Listening
      </button>
      <div id="vic-status">Ready</div>
    </div>
  `;
  uiContainer.innerHTML = defaultContent;
  document.body.appendChild(uiContainer);

  const header = document.getElementById('vic-header');
  const closeBtn = document.getElementById('vic-close');
  const langSelect = document.getElementById('vic-lang-select');
  const toggleBtn = document.getElementById('vic-toggle-btn');
  const statusDiv = document.getElementById('vic-status');
  const micIconSvg = toggleBtn.querySelector('svg');

  // Dragging logic
  header.addEventListener("mousedown", dragStart);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("mousemove", drag);

  function dragStart(e) {
    if (e.target === closeBtn || closeBtn.contains(e.target)) return;
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      setTranslate(currentX, currentY, uiContainer);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }

  // Toggle Visibility
  function toggleVisibility() {
    uiContainer.classList.toggle('vic-hidden');
    if (uiContainer.classList.contains('vic-hidden') && isListening) {
      stopListening();
    }
  }

  closeBtn.addEventListener('click', toggleVisibility);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TOGGLE_VOICE_UI") {
      toggleVisibility();
      sendResponse({ status: "ok" });
    }
  });

  // Speech Recognition Logic
  function initRecognition() {
    if (recognition) {
      recognition.stop();
    }
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langSelect.value;

    recognition.onstart = () => {
      isListening = true;
      toggleBtn.classList.add('vic-listening');
      toggleBtn.innerHTML = `<svg class="vic-mic-icon vic-pulse-animation" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm0 14.5c3.53 0 6.4-2.8 6.4-6.25h1.6c0 4.12-3.1 7.54-7.2 8.04V22h-1.6v-3.71C7.1 17.79 4 14.37 4 10.25h1.6c0 3.45 2.87 6.25 6.4 6.25z"/></svg> Stop Listening`;
      statusDiv.textContent = 'Listening...';
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      statusDiv.textContent = 'Error: ' + event.error;
      stopListening();
    };

    recognition.onend = () => {
      if (isListening) {
        // Auto-restart if it was stopped unexpectedly
        try {
          recognition.start();
        } catch (e) {
          isListening = false;
          updateUIStateStopped();
        }
      } else {
        updateUIStateStopped();
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      statusDiv.textContent = interimTranscript || finalTranscript || 'Listening...';

      if (finalTranscript) {
        insertTextAtCursor(finalTranscript);
      }
    };
  }

  function updateUIStateStopped() {
    isListening = false;
    toggleBtn.classList.remove('vic-listening');
    toggleBtn.innerHTML = `<svg class="vic-mic-icon" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm0 14.5c3.53 0 6.4-2.8 6.4-6.25h1.6c0 4.12-3.1 7.54-7.2 8.04V22h-1.6v-3.71C7.1 17.79 4 14.37 4 10.25h1.6c0 3.45 2.87 6.25 6.4 6.25z"/></svg> Start Listening`;
    statusDiv.textContent = 'Ready';
  }

  function startListening() {
    if (!recognition || recognition.lang !== langSelect.value) {
      initRecognition();
    }
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  }

  function stopListening() {
    isListening = false;
    if (recognition) {
      recognition.stop();
    }
  }

  toggleBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  });

  langSelect.addEventListener('change', () => {
    if (isListening) {
      stopListening();
      setTimeout(startListening, 300);
    }
  });

  function insertTextAtCursor(text) {
    const el = document.activeElement;
    if (!el) return;

    // Format text
    text = text.trim() + ' ';

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const start = el.selectionStart;
      const end = el.selectionEnd;

      el.value = el.value.substring(0, start) + text + el.value.substring(end);

      el.selectionStart = el.selectionEnd = start + text.length;

      // Dispatch input event for frameworks (React, Vue, etc.)
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));

    } else if (el.isContentEditable) {
      // For contenteditable elements like rich text editors
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);

      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
})();
