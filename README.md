# librato-alerts-chrome
A Chrome extension that shows Librato Alerts.

[![CircleCI](https://circleci.com/gh/bryanmikaelian/librato-alerts-chrome/tree/master.svg?style=svg)](https://circleci.com/gh/bryanmikaelian/librato-alerts-chrome/tree/master)

# Getting Started
You can download the extension from [Chrome Web Store](https://chrome.google.com/webstore/detail/librato-browser-extension/imgkpcebcnhdnbfpglklbbdhponjcinp). 

Alternatively, you can download this repo and install locally via:

```
$ git clone git@github.com:bryanmikaelian/librato-alerts-chrome.git
$ cd librato-alerts-chrome
$ npm install --save`
$ gulp
```

At this point, everything should exist in the `dist` directory. You can then load the unpackaged version of this extension in to Chrome.

# Contributing
Features and bug fixes are welcomed! You can open up a PR with your changes and we can go from there. Depending on the severity of the issue, we will cut a new release and ship it to the Chrome Web Store. For sanity purposes, code changes should be made using the following technologies:

* All CSS should be written with Sass
* All JS should ES6 features
* ReactJS is the preferred way to add components / UI elements.
* jQuery should be avoided but exceptions can always be made.

You should also get familiar with the [Chrome Developer Documentation](https://developer.chrome.com/extensions/) for Extensions.
