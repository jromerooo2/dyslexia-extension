/* eslint-disable no-console */
'use strict';

import $ from 'jquery';

import { removeClassStartsWith } from './lib/util';
import { CSS_NAMESPACE, FONT_CLASS_PREFIX, RULER_ID } from './lib/consts';

const ruler = $(`<div id="${RULER_ID}"></div>`);

import axios from 'axios'

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
        document.onmouseup = function() {
          let text = window.getSelection().toString();
          // console.log(text.length)
          if(text.length > 0){
            alert(text)
           //axios.post('', {}).then(response=>{console.log(response.response)})
            axios({
              method: 'post',
              url: 'http://localhost:5000/summarize',
              data: {
                content:text, 
                setting: "summarize"
              }
            }).then(function (response) {
              let t = response.data;
              console.log(t)
            });

            //call api
            console.log
          }else{
            console.log('no text selected')
            
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
   ///text
});


