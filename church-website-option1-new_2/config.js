/* ===========================================================
   SITE SETTINGS: the one file you fill in to turn things on.
   Leave a value as '' (empty) and that button or link shows "coming soon".
   =========================================================== */
window.SITE = {
  email: 'info@imetjesuscommunity.com',   // CONFIRM: .com or .org?

  // Contact + newsletter forms. Create a free form at formspree.io (or web3forms.com)
  // and paste the form URL here. Empty = the visitor's email app opens instead.
  formEndpoint: '',

  // Online giving. Paste links from your payment provider (Stripe Payment Links, PayPal,
  // Givebutter, Zeffy, Tithe.ly...). Tokens you can use in the link:
  //   {amount} = the dollars chosen   {fund} = general | mission | needed
  donate: {
    once: '',      // one-time gift link
    monthly: ''    // monthly gift link
  },

  // LIVESTREAM on the Live page. Fill ONE of these:
  //  channelId: your YouTube channel ID (starts with UC). Shows whatever you are live on right now,
  //             and the "next service" message shows when you are not live. Best option.
  //  videoId:   one specific video/stream ID (the part after v= in the YouTube link).
  // Find your channel ID: YouTube Studio > Settings > Channel > Advanced settings.
  live: { channelId: '', videoId: '' },

  // SERMONS FROM YOUTUBE: fill both and the sermon lists (with thumbnails) update themselves
  // every time you post a video. channelId is the same one as above (starts with UC).
  // apiKey: free, from console.cloud.google.com > create project > enable "YouTube Data API v3"
  // > Credentials > Create API key > restrict it to "HTTP referrers" = your website address.
  // Videos with "youth" in the title show under Youth, "podcast" or "conversation" under Podcast,
  // everything else under Sermons. Leave empty to keep the built-in list on the pages.
  youtube: { channelId: '', apiKey: '' },

  // WELCOME VIDEO + HERO VIDEO
  //  videoId:   a YouTube video ID for a short "see what a Sunday is like" video. Plays in a pop-up.
  //  heroVideo: optional short silent loop (mp4) behind the home page headline, e.g. 'video/hero.mp4'
  welcome: { videoId: '', heroVideo: '' },

  // Social + media links. Empty social links are hidden in the footer.
  links: {
    youtube: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    album: '',      // "Download album" link
    calendar: '',
    zoom: ''
  },

  // Music page: put mp3 files in an /audio folder and list them in album order.
  // Example: ['audio/01-a-letter-to-the-lord.mp3', 'audio/02-the-place-where-i-belong.mp3']
  audio: []
};
