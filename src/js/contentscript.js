/* eslint-disable no-console */
'use strict';

import $ from 'jquery';

import { removeClassStartsWith } from './lib/util';
import { CSS_NAMESPACE, FONT_CLASS_PREFIX, RULER_ID } from './lib/consts';
import OpenAI from "openai";
const ruler = $(`<div id="${RULER_ID}"></div>`);

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true 
});

$(document).ready(function() {
  $('body').append(ruler);
  $('body').mousemove(function(event) {
    ruler.css('top', event.pageY);
  });

  function applyConfig(config) {
    console.log(
      '4L',
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
        // body.addClass("text-" + config.fontSize);
      }
      if(config.summaryEnabled){
        document.onmouseup = async function() {
          let t = window.getSelection().toString(); 
          if(t.length > 0){
            const response = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  "role": "system",
                  "content": "Summarize the content you are provided."
                },
                {
                  "role": "user",
                  "content": t
                }
              ],
              temperature: 0.7,
              // max_tokens: 64,
              top_p: 1,
            });

            alert(response.choices[0].message.content)
            chrome.runtime.sendMessage({toSay: response.choices[0].message.content}, function() {});
            
          }else{
            console.log("no text provided")
          }

        }
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