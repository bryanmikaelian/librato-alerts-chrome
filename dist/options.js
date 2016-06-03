(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
class Options {
  constructor() {
    chrome.storage.sync.get({
      email: '',
      token: ''
    }, function (items) {
      document.getElementById('email').value = items.email;
      document.getElementById('token').value = items.token;
    });
  }

  save(callback) {
    let email = document.getElementById('email').value;
    let token = document.getElementById('token').value;
    chrome.storage.sync.set({
      email: email,
      token: token
    }, function () {
      document.querySelector('#notice').textContent = "Credentials Saved!";
      setTimeout(function () {
        document.querySelector('#notice').textContent = "";
      }, 1500);
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  let options = new Options();
  document.getElementById('save').addEventListener('click', options.save);
});

},{}]},{},[1])


//# sourceMappingURL=options.js.map
