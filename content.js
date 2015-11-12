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
        // iconUrl: chrome.extension.getURL('images/mute.png'),
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

  function threadMute(ev) {
    var threadId = ev.threadView.getThreadID();



    chrome.runtime.sendMessage({action: 'mute', threadIds: [threadId], origin: 'content'}, function(response) {
      console.log(response);
      if (response && response.success) {
        sdk.ButterBar.showMessage({
          text: 'Muting...'
        , time: 10000
        , hideOnViewChanged: true
        , messageKey: 'thread_muted'
        });
      } else {
        sdk.ButterBar.showError({
          text: 'Not able to starting muting...'
        , time: 5000
        , hideOnViewChanged: true
        , messageKey: 'thread_muted'
        });
      }
    });
  }

  sdk.Toolbars.registerToolbarButtonForThreadView({
    title: 'Muter',
    iconUrl: chrome.extension.getURL('images/mute.png'),
    section: sdk.Toolbars.SectionNames.METADATA_STATE,
    onClick: threadMute,
    hasDropdown: false,
    // hideFor: whenNoneSelected,
    keyboardShortcutHandle: null
  });

  // console.log(sdk.User.getEmailAddress)

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.origin !== 'bg') return false;

    if (request.action === 'mute') {
      if (request.success) {
        sdk.ButterBar.showMessage({
          text: 'Successfuly muted'
        , time: 2000
        , hideOnViewChanged: true
        , messageKey: 'thread_muted'
        })

        console.log('Successfuly muted', request.threadId)
      } else {
        sdk.ButterBar.showError({
          text: 'Unsuccessfuly muted'
        , time: 5000
        , hideOnViewChanged: true
        , messageKey: 'thread_muted'
        })

        console.log('Unsuccessfuly muted', request.threadId)
      }
    }

    sendResponse()
  });

});
