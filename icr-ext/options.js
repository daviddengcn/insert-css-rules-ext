function ut(id, text) {
	document.getElementById(id).innerText = text;
}

ut('span-page-title', 'Insert CSS Rules ' + chrome.app.getDetails().version);

function send_options() {
	try {
		var settings = JSON.parse(document.getElementById('ta-patterns').value);
	} catch (e) {
		document.getElementById('art-msg').innerText = e.message;
		document.getElementById('art-msg').classList.add('failed');
		document.getElementById('art-msg').classList.remove('succ');
		return;
	}
	chrome.runtime.sendMessage({
		set_options: {
			settings: settings
		},
	})
	document.getElementById('art-msg').innerText = "Saved";
	document.getElementById('art-msg').classList.add('succ');
	document.getElementById('art-msg').classList.remove('failed');
}

function load() {
	chrome.runtime.sendMessage({get_options:{}}, function(opt) {
		console.log(JSON.stringify(opt))
		document.getElementById('ta-patterns').value = JSON.stringify(opt.settings, null, 2)
		
		document.getElementById('ta-patterns').addEventListener('change', function(e) {
			send_options()
		});
	})
	
}

load()
