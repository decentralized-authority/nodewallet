self.addEventListener('message', function(event) {
  console.log('message', event);
  chrome.runtime.sendMessage({type: 'message', message: 'hello from service worker'})
    .catch(console.error);
});
