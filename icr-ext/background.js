var g_settings = {};
function update_settings(settings) {
  if (!settings) {
    settings = JSON.stringify({})
  }
  console.log('settings: ', settings)
  g_settings = JSON.parse(settings);
  console.log("g_settings: ", g_settings);
}

function load() {
  chrome.storage.sync.get(["settings"]).then((result) => {
    update_settings(result.settings);
  });
}
load();

function save_settings(settings) {
  chrome.storage.sync.set({"settings": JSON.stringify(settings)}, () => {
    console.log("Saved", JSON.stringify(settings));
  });
}

chrome.storage.onChanged.addListener(
  (changes, area) => {
    console.log(`Change in storage area: ${area}`);
    if (area=="sync") {
      let settings = changes.settings;
      if (settings) {
        update_settings(settings.newValue);
      }
    }
  }
)

chrome.runtime.onMessage.addListener(
  (msg, sender, sendResponse) => {
    if (msg.set_options) {
      save_settings(msg.set_options.settings);
      return
    }
    if (msg.get_options) {
      sendResponse({
        settings: g_settings
      })
      return
    }
  }
)

chrome.webNavigation.onCompleted.addListener(function(details) {
  for (reg in g_settings) {
    if (!details.url.match(reg)) {
      continue;
    }
    let insert_css = (css) => {
      chrome.scripting.insertCSS({
        target: {
          tabId: details.tabId,
          allFrames: true
        },
        css: css
      });
    };
    let value = g_settings[reg];
    console.log(reg, "matched, inserting: ", value);
    if (typeof value == "string") {
      insert_css(value);
    } else {
      value.forEach(insert_css);
    }
  }
});

