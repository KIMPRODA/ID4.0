// chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.action === "START") { 
//         console.log(request);
//         // document.getElementById("username").value = "sjbaek@ildong.com";
//         // document.getElementById("password").value = "216218";
//      }
// });

// const nullthrows = (v) => {
//     if (v == null) throw new Error("it's a null");
//     return v;
// }

// function injectCode(src) {
//     const script = document.createElement('script');
//     // This is why it works!
//     script.src = src;
//     script.onload = function() {
//         console.log("script injected");
//         this.remove();
//     };

//     // This script runs before the <head> element is created,
//     // so we add the script to <html> instead.
//     nullthrows(document.head || document.documentElement).appendChild(script);
// }


// injectCode(chrome.runtime.getURL('/myscript.js'));