var g_settings = {};

function load(){
	chrome.storage.sync.get("config", function (settings) {
		console.log("Loaded", settings);
		if (!settings) {
			settings = JSON.stringify({"config":"{}"})
		}
		g_settings = JSON.parse(settings["config"]);
		console.log("Using", g_settings);
	})
}
load();

function save() {
	chrome.storage.sync.set({"config": JSON.stringify(g_settings)}, function () {
		console.log("Saved", JSON.stringify(g_settings));
	});
}

chrome.storage.onChanged.addListener(
	function(changes, area) {
		console.log(`Change in storage area: ${area}`);
		if (area=="sync") {
			const changedItems = Object.keys(changes);
			for (const item of changedItems) {
				console.log(`${item} has changed:`);
				console.log("Old value:", changes[item].oldValue);
				console.log("New value:", changes[item].newValue);
				g_settings[item] = changes[item].newValue;
			}
		}
	}
)

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
			chrome.scripting.insertCSS({
				target: {
					tabId: details.tabId,
					allFrames: true
				},
				css: urls
			});
		} else {
			for (i in urls) {
				chrome.scripting.insertCSS({
					target: {
						tabId: details.tabId,
						allFrames: true
					},
					css: urls[i] + ""
				});
			}
		}
	}
});
