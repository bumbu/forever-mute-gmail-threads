InboxSDK.load('1', 'SDK_ID').then(function(sdk){
  function whenNoneSelected(route) {
    return false;
  }

  function bulkMute(ev) {
    var thread;

    for (var i = 0; i < ev.selectedThreadRowViews.length; i++) {
      thread = ev.selectedThreadRowViews[i];
      thread.addLabel({
        title: 'Muted',
        iconUrl: chrome.extension.getURL('images/mute.png'),
      })
    }
    console.log(event)
    console.log('Should mute threads');
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

});
