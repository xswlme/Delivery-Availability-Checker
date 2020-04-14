// Messages
var CHECKER_START = "checker_start";
var NOTIFICATION = 'notification';

// Refresh the page rate
var refreshRateStart = 15 * 1000;
var refreshRateEnd = 20 * 1000;
var refreshRate = Math.trunc(Math.random() * (refreshRateEnd - refreshRateStart) + refreshRateStart);

// Wait until Instacart async complete
var asyncWaitTime = 5 * 1000;

// Instacart Path change detect time
var pathDetectTime = 2 * 1000;

// If Delivery window found
var foundWindow = false;

// Order URL
var costcoURL = 'costco.com';
var instacartURL = 'instacart.com';
var instaOrderPathURL = '/store/checkout_v3';
var amazonURLRegex = new RegExp("[a-zA-z]+://[a-zA-z]+[.]amazon[.][^\s]*");

// Filter rules
const wholeFoodsFilter = '.ufss-available';
const amazonFreshFilter = '.availableSlotLeftHighlight';
const instacartFilter = "input[name='delivery_option']";
const primeNowFilter = "div[data-a-input-name='delivery-window-radio'] span.a-color-base";

// Start and page refresh listener
chrome.runtime.onMessage.addListener(function (message) {
  switch (message.type) {
    case CHECKER_START:
      location.reload();
      break;
  }
});

// Using html element to check availability
function checkAvailability(filter_rule) {
  const containerExist = document.querySelector(filter_rule);
  if (containerExist) {
    sendNotification();
    incCounter();
    return true;
  }
  return false;
}

// Send Chrome Notification
function sendNotification() {
  chrome.runtime.sendMessage('', {
    type: NOTIFICATION,
    options: {
      title: 'Delivery Availability Checker',
      message: 'Found an available delivery window!',
      iconUrl: 'img/icon_128.png',
      type: 'basic'
    }
  });
}

// Counter inc
function incCounter() {
  chrome.storage.sync.get(['succ_count'], function (result) {
    chrome.storage.sync.set({
      'succ_count': result.succ_count + 1
    });
  });
}

// Run the checker when STATE_RUN
function startChecker() {
  window.addEventListener('load', () => {
    // Wait until instacart async complete
    if (location.hostname.match(costcoURL) || location.hostname.match(instacartURL)) {
      // Instacart detect path change to order page
      pathchangeMonitor = setInterval(() => {
        if (location.pathname == instaOrderPathURL) {
          // clear the path detect if now is order page
          clearInterval(pathchangeMonitor);
          // Wait until async finish
          setTimeout(function () {
            foundWindow = checkAvailability(instacartFilter);
          }, asyncWaitTime);
          instaMonitor = setInterval(() => {
            if (!foundWindow) location.reload();
          }, refreshRate);
        }
      }, pathDetectTime);
    } else if (amazonURLRegex.exec(window.location.href)) {
      // Amazon monitor
      foundWindow = (checkAvailability(wholeFoodsFilter) || checkAvailability(primeNowFilter) || checkAvailability(amazonFreshFilter));
      amazonMonitor = setInterval(() => {
        if (!foundWindow) location.reload();
      }, refreshRate);
    };
  });
}

// Get state result from storage
chrome.storage.sync.get({
  'state': true
}, function (result) {
  console.log("now status in content is: " + result.state);
  if (result.state) {
    startChecker();
  }
});