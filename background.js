chrome.runtime.onInstalled.addListener(function () {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: "works.ildong.com" },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});


// function isLogedIn(sendResponse) {
//   chrome.storage.local.get(["userStatus"], (response) => {
//     const error = chrome.runtime.lastError;
//     if (error) console.log(error);

//     if (!response.userStatus) {
//       sendResponse({ message: "login" });
//     } else {
//       sendResponse({ message: "success" });
//     }
//   });
// }
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.message === "userStatus") {
//     isLogedIn(sendResponse);
//     return true;
//   }
// });
