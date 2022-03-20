<div align="center">
  <br />
  <p>
    <a href="https://github.com/SidisLiveYT/node-vimeo"><img src="https://raw.githubusercontent.com/SidisLiveYT/node-vimeo/master/.github/asserts/logo.svg" width="546" alt="node-vimeo" /></a>
  </p>
  <br />
<p>
<a href="https://discord.gg/MfME24sJ2a"><img src="https://img.shields.io/discord/795434308005134406?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
<a href="https://www.npmjs.com/package/node-vimeo"><img src="https://img.shields.io/npm/v/node-vimeo.svg?maxAge=3600" alt="npm version" /></a>
<a href="https://www.npmjs.com/package/node-vimeo"><img src="https://img.shields.io/npm/dt/node-vimeo.svg?maxAge=3600" alt="npm downloads" /></a>
<a href="https://github.com/SidisLiveYT/node-vimeo/actions"><img src="https://github.com/discordjs/discord.js/workflows/Testing/badge.svg" alt="Tests status" /></a>
</p>
</div>

## Installation

### Install **[node-vimeo](https://npmjs.com/package/node-vimeo)**

```sh
$ npm install --save node-vimeo
```

# Features

- Soft and Hard fetch methods Integrated with vimeoTracks Class
- Package can be used with Commonjs or ES6 Type of Javascript and typings included
- HTML Scrapper/Parser and even Support fetching of Stream Readable for HTML 5 Players/Piping
- Custom Vimeo Wrapper and have many functions to fetch data
- Better Error Handlers and Request Handlers
- Api EndPoints Support (soon)
- User Fetch Data Support (soon)

### [Documentation](https://node-vimeo.js.org/)

### Schemes :

#### Raw Vimeo Track Scheme :

```js
vimeoTrack {
  fb_app_id: '19884028963',
  viewport: 'width=device-width,initial-scale=1.0,maximum-scale=5.0,user-scalable=yes',
  site_name: 'Vimeo',
  url: 'https://vimeo.com/246660563',
  type: 'video.other',
  title: 'Fly - imai ft. 79, Kaho Nakamura',
  description: 'Stop-motioned various kinds of mochi at my grandparents&#039; place.  Direction/animation: Baku Hashimoto Logo design: 79  Track by imai (group_inou) featuring&hellip;',
  updated_time: '2022-03-19T13:55:55-04:00',
  image: 'https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F696079667-94a0641db16295fc9c32803c15331b4dea14ded3dcdcad3101a8b278c6c04bf1-d_1280x720&amp;src1=https%3A%2F%2Ff.vimeocdn.com%2Fimages_v6%2Fshare%2Fplay_icon_overlay.png',
  image_secure_url: 'https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F696079667-94a0641db16295fc9c32803c15331b4dea14ded3dcdcad3101a8b278c6c04bf1-d_1280x720&src1=https%3A%2F%2Ff.vimeocdn.com%2Fimages_v6%2Fshare%2Fplay_icon_overlay.png',
  image_type: 'image/jpg',
  image_width: '1280',
  image_height: '720',
  video_url: 'https://player.vimeo.com/video/246660563?autoplay=1&amp;h=2e6d23f925',
  video_secure_url: 'https://player.vimeo.com/video/246660563?autoplay=1&amp;h=2e6d23f925',
  video_type: 'text/html',
  video_width: '1280',
  video_height: '720',
  ios_app_name: 'Vimeo',
  ios_app_store_id: '425194759',
  ios_url: 'vimeo://app.vimeo.com/videos/246660563',
  android_app_name: 'Vimeo',
  android_package: 'com.vimeo.android.videoapp',
  android_url: 'vimeo://app.vimeo.com/videos/246660563',
  web_should_fallback: 'true',
  video_director: 'https://vimeo.com/baku89',
  video_other_tag: 'motion graphics',
  card: 'player',
  site: '@vimeo',
  player: 'https://player.vimeo.com/video/246660563?h=2e6d23f925',
  player_width: '1280',
  player_height: '720',
  app_name_iphone: 'Vimeo',
  app_id_iphone: '425194759',
  app_url_iphone: 'vimeo://app.vimeo.com/videos/246660563',
  app_name_ipad: 'Vimeo',
  app_id_ipad: '425194759',
  app_url_ipad: 'vimeo://app.vimeo.com/videos/246660563',
  app_name_googleplay: 'Vimeo',
  app_id_googleplay: 'com.vimeo.android.videoapp',
  app_url_googleplay: 'vimeo://app.vimeo.com/videos/246660563',
  creator: '_baku89',
  creator_id: '339501114',
  msapplication_TileImage: 'https://i.vimeocdn.com/favicon/main-touch_144',
  msapplication_TileColor: '#00adef',
  rating: { id: 6 },
  version: { current: null, available: null },
  height: 1080,
  duration: 194,
  thumbs: {
    '640': 'https://i.vimeocdn.com/video/696079667-94a0641db16295fc9c32803c15331b4dea14ded3dcdcad3101a8b278c6c04bf1-d_640',
    '960': 'https://i.vimeocdn.com/video/696079667-94a0641db16295fc9c32803c15331b4dea14ded3dcdcad3101a8b278c6c04bf1-d_960',
    '1280': 'https://i.vimeocdn.com/video/696079667-94a0641db16295fc9c32803c15331b4dea14ded3dcdcad3101a8b278c6c04bf1-d_1280',
    base: 'https://i.vimeocdn.com/video/696079667-94a0641db16295fc9c32803c15331b4dea14ded3dcdcad3101a8b278c6c04bf1-d'
  },
  owner: {
    account_type: 'plus',
    name: 'Baku 麦',
    img: 'https://i.vimeocdn.com/portrait/19948870_60x60.jpg',
    url: 'https://vimeo.com/baku89',
    img_2x: 'https://i.vimeocdn.com/portrait/19948870_120x120.jpg',
    id: 4818669
  },
  id: 246660563,
  embed_code: '<iframe title="vimeo-player" src="https://player.vimeo.com/video/246660563?h=2e6d23f925" width="640" height="360" frameborder="0" allowfullscreen></iframe>',
  share_url: 'https://vimeo.com/246660563',
  width: 1920,
  embed_permission: 'public',
  fps: 15,
  spatial: 0,
  live_event: null,
  allow_hd: 1,
  hd: 1,
  lang: 'en',
  default_to_hd: 1,
  privacy: 'anybody',
  bypass_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGlwX2lkIjoyNDY2NjA1NjMsImV4cCI6MTY0NzcxNjQ2MH0.gBg4bSdNe-DuA_jGxaNGbOiPu0XNv81oOUFyOiUDuzM',
  unlisted_hash: null,
  streamMetadata: {
    profile: '175',
    width: 1920,
    mime: 'video/mp4',
    fps: 15,
    url: 'https://vod-progressive.akamaized.net/exp=1647716746~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F4332%2F9%2F246660563%2F891121771.mp4~hmac=0a5d83d7d2ece81035c41cb49db1f194794dec04b3d2227373a6aeb4d52ee33b/vimeo-prod-skyfire-std-us/01/4332/9/246660563/891121771.mp4',
    cdn: 'akamai_interconnect',
    quality: '1080p',
    id: '0173d7d2-ea4e-4c9c-8c73-3b0ddfe1112f',
    origin: 'gcs',
    height: 1080,
    buffer: StreamReadable
  }
}
```

#### Parsed Vimeo Track:

```js
vimeoTrack {
  title: 'Inledning - grupputbildning',
  url: 'https://vimeo.com/407943692',
  description: 'Inledning. Visas i gruputbildning i M&ouml;ts &amp; L&auml;r. Grupputbildning_Inledning_1920x1080_200414_1',
  duration: { ms: 143000, readable: '2m 23s' },
  thumbnails: {
    '640': 'https://i.vimeocdn.com/video/878726798-c9b0aef95da3925a23007ec8ff865fef23d6d6fe45fab8054af4d80b1b5404ca-d_640',
    '960': 'https://i.vimeocdn.com/video/878726798-c9b0aef95da3925a23007ec8ff865fef23d6d6fe45fab8054af4d80b1b5404ca-d_960',
    '1280': 'https://i.vimeocdn.com/video/878726798-c9b0aef95da3925a23007ec8ff865fef23d6d6fe45fab8054af4d80b1b5404ca-d_1280',
    base: 'https://i.vimeocdn.com/video/878726798-c9b0aef95da3925a23007ec8ff865fef23d6d6fe45fab8054af4d80b1b5404ca-d'
  },
  author: {
    type: 'live_premium',
    name: 'STR',
    url: 'https://vimeo.com/user32313364',
    images: {
      normal: 'https://i.vimeocdn.com/portrait/9653276_60x60.jpg',
      normal2X: 'https://i.vimeocdn.com/portrait/9653276_120x120.jpg'
    },
    authorId: 32313364
  },
  trackId: 407943692,
  privacy: 'anybody',
  language: undefined,
  shareURL: 'https://vimeo.com/407943692',
  isLive: false,
  streamMetadata: {
    type: 'video/mp4',
    width: 1280,
    height: 720,
    fps: 25,
    quality: '720p',
    streamUrl: 'https://vod-progressive.akamaized.net/exp=1647765700~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F1588%2F16%2F407943692%2F1747941996.mp4~hmac=ce8dce3557fcb29616793286f0912592a6b542137cbfaf844d1e27cb49174e51/vimeo-prod-skyfire-std-us/01/1588/16/407943692/1747941996.mp4',
    buffer: StreamReadable
  },
  htmlPlayer: {
    url: 'https://player.vimeo.com/video/407943692?h=04cd636c18',
    width: '1280',
    height: '720'
  }
}
```

### Example :

```js
const { vimeo } = require("node-vimeo");

new Promise(async () => {
  let rawVimeoTrack = await vimeo.html("https://vimeo.com/246660563", {
    fetchOptions: { fetchStreamReadable: true },
  });
  resolve(rawVimeoTrack);
});
```

## Links

- [Source Code](https://github.com/SidisLiveYT/node-vimeo.git)
- [GitHub Repo Link](https://github.com/SidisLiveYT/node-vimeo)
- [NPM Package](https://www.npmjs.com/package/node-vimeo)
- [Yarn Package](https://yarn.pm/node-vimeo)
