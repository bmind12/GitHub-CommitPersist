chrome.runtime.sendMessage({ message: "getCurrentUrl" }, function (response) {
  if (!response || !response.url) return;

  const commit = response?.url?.split("/").pop();
  restoreFileStates(commit);

  const buttons = document.querySelectorAll(".file-header .js-details-target");

  if (!buttons || buttons.length === 0) return;

  addListeners(buttons, commit);
});

function restoreFileStates(commit) {
  chrome.storage.session.get(commit, (storage) => {
    const state = storage[commit];

    if (!state) return;

    const elements = document.querySelectorAll(
      '[data-details-container-group="file"]'
    );

    if (!elements) return;

    elements.forEach((element) => {
      const fileName = element.getAttribute("data-tagsearch-path");

      if (!fileName) return;

      const isOpen = state[fileName];

      if (isOpen === false) {
        element.classList.remove("open", "Details--on");
      }
    });
  });
}

function addListeners(buttons, commit) {
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => eventHandler(event, commit));
  });
}

function eventHandler(event, commit) {
  const button = event.currentTarget;
  chrome.storage.session.get(commit, (storage = {}) => {
    const container = button.closest(".js-details-container");

    if (!commit || !container) return;

    const fileName = container.getAttribute("data-tagsearch-path");

    if (!fileName) return;

    if (!storage[commit]) {
      storage[commit] = {};
    }

    const isClosed = !container.classList.contains("open");

    if (isClosed) {
      storage[commit][fileName] = false;
    } else {
      delete storage[commit][fileName];
    }

    chrome.storage.session.set(storage);
  });
}
