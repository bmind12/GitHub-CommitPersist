let store = {
  commit: null,
};

chrome.runtime.sendMessage({ message: "getCurrentUrl" }, function (response) {
  if (!response || !response.url) return;

  const commit = response?.url?.split("/").pop();
  store = {
    ...store,
    commit,
  };

  restoreFileStates();
  addListeners(getButtons(document));
  initObserver();
});

function restoreFileStates(node = document) {
  chrome.storage.session.get(store.commit, (storage) => {
    const state = storage[store.commit];

    if (!state) return;

    const elements = node.querySelectorAll(
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

function initObserver() {
  const targetNode = document.getElementById("files");
  const config = { childList: true, subtree: true };
  const callback = (mutations) => {
    for (const mutation of mutations) {
      const newNode = mutation.target;
      addListeners(getButtons(newNode));
      restoreFileStates(newNode);
    }
  };

  const observer = new MutationObserver(callback);

  observer.observe(targetNode, config);
}

function addListeners(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => eventHandler(event));
  });
}

function eventHandler(event) {
  const button = event.currentTarget;
  chrome.storage.session.get(store.commit, (storage = {}) => {
    const container = button.closest(".js-details-container");
    const { commit } = store;

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

function getButtons(node) {
  const buttons = node.querySelectorAll(".file-header .js-details-target");

  if (!buttons || buttons.length === 0) return null;

  return buttons;
}
