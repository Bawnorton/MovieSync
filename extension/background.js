//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


chrome.runtime.onInstalled.addListener(() => {  
  console.log('started'); 
  fetch("http://162.248.100.184:8000/client.txt").then(function(response) {
    response.text().then(function(text) {
        console.log(text);
    });
});
});




// chrome.runtime.addListener(() => {
//   path = "http://162.248.100.184:8000/client.txt";
//   const url = chrome.runtime.getURL(path);
//   console.log(url);
//   fetch(url)
//       .then((response) => response.text()) 
//       .then((data) => console.log(data));
// });




// var data = getData();

// function getData() {
//   path = "http://162.248.100.184:8000/client.txt";
//   fetch(path).then((response) => {
//     return response.text();
//   })
//   .then((myText) => {
//     console.log(myText);
//   });
// } 


// chrome.runtime.getPackageDirectoryEntry(function(root) {
//   root.getFile("client.txt", {}, function(fileEntry) {
//     fileEntry.file(function(file) {
//       var reader = new FileReader();
//       reader.onloadend = function(e) {
        
//       };
//       reader.readAsText(file);
//     }, errorHandler);
//   }, errorHandler); 
// });