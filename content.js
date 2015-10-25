InboxSDK.load('1', 'SDK_ID').then(function(sdk){
  function whenNoneSelected(route) {
    return false;
  }

  function bulkMute(ev) {
    var thread,
      threadIds = []
      ;

    for (var i = 0; i < ev.selectedThreadRowViews.length; i++) {
      thread = ev.selectedThreadRowViews[i];
      threadIds.push(thread.getThreadID());

      thread.addLabel({
        title: 'Muting...',
        iconUrl: chrome.extension.getURL('images/mute.png'),
      })
    }

    chrome.runtime.sendMessage({action: 'mute', threadIds: threadIds, origin: 'content'}, function(response) {
      console.log(response);
    });
  }

  sdk.Toolbars.registerToolbarButtonForList({
    title: 'Muter',
    iconUrl: chrome.extension.getURL('images/mute.png'),
    section: sdk.Toolbars.SectionNames.METADATA_STATE,
    onClick: bulkMute,
    hasDropdown: false,
    // hideFor: whenNoneSelected,
    keyboardShortcutHandle: null
  });

  // console.log(sdk.User.getEmailAddress)

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.origin !== 'bg') return false;

    if (request.action === 'mute') {
      if (request.success) {
        console.log('Successfuly muted', request.threadId)
      } else {
        console.log('Unsuccessfuly muted', request.threadId)
      }
    }

    sendResponse()
  });

});
