/* eslint-disable no-console */
'use strict';

import $ from 'jquery';

import { removeClassStartsWith } from './lib/util';
import { CSS_NAMESPACE, FONT_CLASS_PREFIX, RULER_ID } from './lib/consts';

const ruler = $(`<div id="${RULER_ID}"></div>`);

$(document).ready(function() {
  $('body').append(ruler);
  $('body').mousemove(function(event) {
    ruler.css('top', event.pageY);
  });

  function applyConfig(config) {
    console.log(
      '[Dyslexia Friendly] applying user settings to webpage',
      config
    );
    const body = $('body');

    if (config.extensionEnabled) {
      // apply base CSS
      body.addClass(CSS_NAMESPACE);

      // remove previous font class
      removeClassStartsWith(body, FONT_CLASS_PREFIX);
      if (config.fontEnabled) {
        body.addClass(FONT_CLASS_PREFIX + config.fontChoice);
      }

      ruler.css('marginTop', -config.rulerSize / 2);
      ruler.css('height', config.rulerSize);
      if (config.rulerEnabled) {
        ruler.show();
      } else {
        ruler.hide();
      }
    } else {
      // remove main class to disable all modifications
      body.removeClass(CSS_NAMESPACE);
      ruler.hide();
    }
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
      case 'applyConfigInContentScript':
        applyConfig(request.config);
        break;
    }
    sendResponse(true);
  });
});

const returnSelection = () => {
  return new Promise((resolve, reject) => {
      if (window.getSelection) {
          resolve(window.getSelection().toString())
      } else if (document.getSelection) {
          resolve(document.getSelection().toString())
      } else if (document.selection) {
          resolve(document.selection.createRange().text.toString())
      } else reject();
  })
}

chrome.runtime.onMessage.addListener(async (request, sender, response) => {
  const { type } = request
  if (type === "LOAD") {
      try {
          const selection = await returnSelection()
          response(selection)
      } catch (e) {
          response()
      }
  }
})