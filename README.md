# Forever mute GMail threads (conversations)

GMail has [mute functionality](https://support.google.com/mail/answer/47787?hl=en) for threads: a muted thread will not show as unread when it will get new messages.

But muting will not work in 2 use-cases:
* If a new message in the conversation is addressed to you and no one else, or if you're added to the "To" or "Cc" line in a new message
* If a thread has a custom label on it (set manually or by filters)

## What this extension does?

This extension creates a custom label **M** and a **Mute** button to the GMail nav menu to mute conversations.

![Mute threads](https://cloud.githubusercontent.com/assets/171178/14768456/8b858f06-0a3a-11e6-9120-985bf2e2696f.png)

## How it works

* Clicking on **Mute** button does:
  * Check if **M** label exists, and if not - creates it
  * Assigns **M** label to all selected threads
  * Marks as _Read_ all unread threads that have **M** label
* Every X minutes it:
  * Marks as _Read_ all unread threads that have **M** label

## Dependencies

This extension uses:

* [InboxSDK](https://www.inboxsdk.com) - get a key [here](https://www.inboxsdk.com/register)
* [Google Cloud Platform key with acesss to GMail API](https://developers.google.com/api-client-library/javascript/features/authentication#simple-access-using-the-api-key)

## Use it yourself

Because the app uses API with limits, API keys are intentionally not shiped in this code.
Hence you'll have to get your own API keys and replace them:

* `GMAIL_API_KEY` in `manifest.json` and `background.js`
* `SDK_ID` in `content.js`

After replacing these placeholders with actual keys you can either use this extension by [loading an unpacked extension]() or by publishing it for your private organization.
It is not recomended to publish this extension on Chrome store for public use as your API quota may get used pretty fast by thousands of people : )

While developing you may want to add a [`key` attribute to your manifest file](https://developer.chrome.com/apps/app_identity) so that development and published version will use the same API key.
