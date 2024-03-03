/* eslint-disable no-console */
'use strict';

const { store, DEFAULT_CONFIG } = require('./lib/store');

function notifyContentScript(config) {
  console.log('notifying contentscript', config);
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id, // TODO: null check
      { message: 'applyConfigInContentScript', config },
      function(ok) {
        if (ok) {
          console.log('contentscript OK reply');
        } else {
          // this typically only happens on chrome settings pages,
          // where the contentscript isn't injected, so it isn't replying.
          // another edge case is when the extension is first installed,
          // then existing tabs won't have the contentscript injected, so
          // this will also occur.
          console.log('contentscript no reply');
          console.log('error:', chrome.runtime.lastError);
        }
      }
    );
  });
}

/**
 * Installed
 */

// save default config to store
chrome.runtime.onInstalled.addListener(function() {
  console.log('installed');
  store.set(DEFAULT_CONFIG, config => {
    console.log('default config saved', config);
  });
});

/**
 * Runtime
 */

// listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'updateConfig') {
    console.log('updateConfig event', request.data);
    store.update(request.data, sendResponse);
  } else if (request.message === 'getConfig') {
    console.log('getConfig event');
    store.getAll(sendResponse);
  }
  return true; // so sendResponse can be called async
});

// 1) apply config on navigation / page reload
chrome.webNavigation.onDOMContentLoaded.addListener(function() {
  // onDOMContentLoaded means contentscript.js is alive
  console.log('onDOMContentLoaded');
  store.getAll(notifyContentScript);
});

// 2) apply config on tab switch
// (only works for tabs opened after the extenion has been installed,
// bc otherwise content.js does not exist on the page to react to the message)
chrome.tabs.onActivated.addListener(function() {
  console.log('tabs.onActivated');
  store.getAll(notifyContentScript);
});

// 3) apply config on store change
store.subscribe(notifyContentScript);
const uid = () => {
	const generateNumber = (limit) => {
	   const value = limit * Math.random();
	   return value | 0;
	}
	const generateX = () => {
		const value = generateNumber(16);
		return value.toString(16);
	}
	const generateXes = (count) => {
		let result = '';
		for(let i = 0; i < count; ++i) {
			result += generateX();
		}
		return result;
	}
	const generateconstant = () => {
		const value = generateNumber(16);
		const constant =  (value & 0x3) | 0x8;
		return constant.toString(16);
	}
    
	const generate = () => {
  	    const result = generateXes(8)
  	         + '-' + generateXes(4)
  	         + '-' + '4' + generateXes(3)
  	         + '-' + generateconstant() + generateXes(3)
  	         + '-' + generateXes(12)
  	    return result;
	};
    return generate()
};

const getToken = async () => {
    return new Promise(async (resolve, reject) => {
        const resp = await fetch("https://chat.openai.com/api/auth/session")
        if (resp.status === 403) {
            reject('CLOUDFLARE')
        }
        try {
            const data = await resp.json()
            if (!data.accessToken) {
                reject('ERROR')
            }
            resolve(data.accessToken)
        } catch (err) {
            reject('ERROR')
        }
    })
}

const getResponse = async (question) => {
    return new Promise(async (resolve, reject) => {
        try {
            const accessToken = await getToken();
            const res = await fetch("https://chat.openai.com/backend-api/conversation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + accessToken,
                },
                body: JSON.stringify({
                    action: "next",
                    messages: [
                        {
                            id: uid(),
                            role: "user",
                            content: {
                                content_type: "text",
                                parts: [question]
                            }
                        }
                    ],
                    model: "text-davinci-002-render",
                    parent_message_id: uid()
                })
            })   
            resolve(res.body)
        } catch (e) {
            if (e === "CLOUDFLARE") {
                reject("CLOUDFLARE")
            } else {
                reject("ERROR")
            }
        }
    })
}

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        const question = msg.question
        getResponse(question).then(async answer => {
            const resRead = answer.getReader()
            while (true) {
                const {done, value} = await resRead.read()
                if (done) break
                if (done === undefined || value === undefined) port.postMessage('ERROR')
                const data = new TextDecoder().decode(value)
                port.postMessage(data)
            }
        }).catch((e) => port.postMessage(e))
    })
})