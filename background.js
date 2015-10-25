//oauth2 auth
chrome.identity.getAuthToken(
	{'interactive': true},
	function(){
	  //load Google's javascript client libraries
		window.gapi_onload = authorize;
		loadScript('https://apis.google.com/js/client.js');
	}
);

function loadScript(url){
  var request = new XMLHttpRequest();

	request.onreadystatechange = function(){
		if(request.readyState !== 4) {
			return;
		}

		if(request.status !== 200){
			return;
		}

    eval(request.responseText);
	};

	request.open('GET', url);
	request.send();
}

function authorize(){
  gapi.auth.authorize(
		{
			client_id: 'GMAIL_API_KEY',
			immediate: true,
			scope: 'https://mail.google.com/ https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.labels'
		},
		function(){
		  gapi.client.load('gmail', 'v1', gmailAPILoaded);
		}
	);
}

function gmailAPILoaded(){
  // Check for Mute label. If it doesn't exist, then create one
  checkForMuteLabel()
  	.then(function(data) {
  		console.log('Label id', data)
  	})
  	.catch(function(err) {
  		console.log('Error', err)
  	})
}

var muteLabelId = null;
var muteLabelTitle = 'M';
var muteThreadsQueue = [];

/*************************
 Communication channel
 *************************/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.origin !== 'content') return false;

	if (!muteLabelId) {
		sendResponse({success: false, message: 'mutedLabelId not yet available'});
		return;
	}

	if (request.action === 'mute') {
		onMessageMute(request, sender)
	}

	sendResponse({success: true, message: 'Started working...'});
});

function onMessageMute(request, sender) {
	if (request.threadIds && request.threadIds.length) {
		for (var threadId of request.threadIds) {
			muteThreadsQueue.push({
				threadId: threadId,
				tabId: sender.tab.id
			})
		}

		// Start setting labels only if there is no similar ongoing job
		if (muteThreadsQueue.length >= request.threadIds.length) {
			setMuteLabelToThreads();
		}
	}
}

/*************************
 After authentication
 *************************/

// Checks if Mute label exists
// If muted label doesn't exist - delegates its creation to `createMuteLabel`
//
// @return {Promise}
function checkForMuteLabel() {
	return new Promise(function(resolve, reject) {
		gapi.client.gmail.users.labels.list({userId: 'me'})
			.then(function(data) {
				// Check if labels data exists
				if (data && data.result && data.result.labels) {
					var labelFound = false;

					for(var label of data.result.labels) {
						if (label.name === muteLabelTitle && label.type === 'user') {
							labelFound = true;
							muteLabelId = label.id;
							break;
						}
					}

					if (labelFound) {
						resolve(muteLabelId)
					} else {
						// Create mute label
						createMuteLabel()
							.then(resolve)
							.catch(reject)
					}
				} else {
					reject(Error('Error while retrieving labels'))
				}
			}, function() {
				reject(Error('Error while retrieving labels'))
			})
	})
}

// Creates Mute label
//
// @return {Promise}
function createMuteLabel() {
	return new Promise(function(resolve, reject) {
		gapi.client.gmail.users.labels.create({
			userId: 'me',
			name: muteLabelTitle,
			labelListVisibility: 'labelHide',
			messageListVisibility: 'show'
		})
			.then(function(data) {
				muteLabelId = data.result.id
				resolve(muteLabelId)
			}, function() {
				reject(Error('Error creating Mute label'))
			})
	})
}

// Set Mute label to given threads
//
// @return {Promise}
function setMuteLabelToThreads() {
	if (!muteThreadsQueue.length) return false; // In case that there are no more threads to process
	var thread = muteThreadsQueue.shift()
		, threadId = thread.threadId
		, tabId = thread.tabId
		;

	chrome.runtime.sendMessage({action: 'start', success: true, threadId: threadId, origin: 'bg'})

	gapi.client.gmail.users.threads.modify({
		userId: 'me',
		id: threadId,
		addLabelIds: [muteLabelId],
		removeLabelIds: ['UNREAD']
	})
		.then(function() {
			chrome.tabs.sendMessage(tabId, {action: 'mute', success: true, threadId: threadId, origin: 'bg'})
			setMuteLabelToThreads() // next thread
		}, function() {
			chrome.tabs.sendMessage(tabId, {action: 'mute', success: false, threadId: threadId, origin: 'bg'})
			setMuteLabelToThreads() // next thread
		})
}
