console.log('PagePulse Content Script Injected');

// In the future, this can listen for messages from the popup to enable a "Visual Selector" tool
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'PING') {
    sendResponse({ status: 'OK' });
  }
});
