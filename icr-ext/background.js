var g_settings = {}
function load(){
	var str = localStorage['settings']
	if (!str) {
		str = JSON.stringify({})
	}
	g_settings = JSON.parse(str)
	console.log(g_settings);
}
load();

function save() {
  localStorage['settings'] = JSON.stringify(g_settings);
}

chrome.runtime.onMessage.addListener(
	function(msg, sender, sendResponse) {
		if (msg.set_options) {
			g_settings = msg.set_options.settings
			save()
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
		var urls = g_settings[reg];
		if (typeof urls == "string") {
			chrome.tabs.insertCSS(details.tabId, {
			  code: urls,
			  allFrames: true,
			  runAt: "document_end"
			});
		} else {
			for (i in urls) {
				chrome.tabs.insertCSS(details.tabId, {
				  code: urls[i] + "",
				  allFrames: true,
				  runAt: "document_end"
				});
			}
		}
	}
});
