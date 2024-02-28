chrome.storage.session.setAccessLevel({
  accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "getCurrentUrl") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      sendResponse({ url: tabs[0]?.url });
    });
    return true;
  }
});
