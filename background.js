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
    //do stuff here
  console.log('gmail.api loaded')
  // Check for Mute label. If it doesn't exist, then create one
  checkForMuteLabel()
  	.then(function(data) {
  		console.log('Label id', data)
  	})
  	.catch(function(err) {
  		console.log('Error', err)
  	})
}

/*************************
 After authentication
 *************************/

var muteLabelId = null;
var muteLabelTitle = 'TMute'

// returns: Promise
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
