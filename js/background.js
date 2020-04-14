// Messages
var NOTIFICATION = 'notification';
var CHECKER_START = "checker_start";
var COMMAND_START = "command_start";

// Notification Sound
var notificationSound = new Audio('../audio/notification.ogg');

// Listener for the notification 
chrome.runtime.onMessage.addListener(function (message) {
  switch (message.type) {
    case NOTIFICATION:
      chrome.notifications.create('', message.options);
      notificationSound.play();
      break;
    case COMMAND_START:
      chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i += 1) {
          chrome.tabs.sendMessage(tabs[i].id, {
            type: CHECKER_START
          });
        }
      });
      break;
  }
});