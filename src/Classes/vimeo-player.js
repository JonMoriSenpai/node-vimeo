const utils = require('../Utils/__defaultUtils.js')
const https = require('https')
const http = require('http')
const { Readable } = require('stream')
const prettyMS = require('pretty-ms')

/**
 * @class vimeoTrack -> Vimeo Handler Class for Handling Basic Un-Official Extraction and Parsing of Vimeo Video Metadata and Stream Readable
 */
class vimeoTrack {
  /**
   * @static
   * @property {object} __scrapperOptions Default HTML Scrapping and Parsing Options Compilation
   */

  static __scrapperOptions = {
    htmlOptions: {},
    fetchOptions: { fetchStreamReadable: true },
    ignoreError: true,
    parseRaw: true,
  }

  /**
   * @static
   * @property {string | "https://player.vimeo.com/video/" } __playerUrl Player URL for Extraction of Player Metada and Stream Metadata
   */

  static __playerUrl = 'https://player.vimeo.com/video/'

  /**
   * @static
   * @property {Regexp[]} __vimeoRegex Array of Vimeo Video URL Supported Regexes
   */

  static __vimeoRegex = [
    /(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/,
    /(https?:\/\/)?(www\.)?(player\.)?vimeo\.com\/?(showcase\/)*([0-9))([a-z]*\/)*([0-9]{6,11})[?]?.*/,
    /(?:http:|https:|)\/\/(?:player.|www.)?vimeo\.com\/(?:video\/|embed\/|watch\?\S*v=|v\/)?(\d*)/g,
    /((http|https)?:\/\/(?:[\w\-\_]+\.))+(player+\.)vimeo\.com/g,
  ]

  /**
   * @static
   * @property {Regexp[]} __vimeoPlayerRegex Array of Vimeo Player URL Supported Regexes
   */

  static __vimeoPlayerRegex = [
    /((http|https)?:\/\/(?:[\w\-\_]+\.))+(player+\.)vimeo\.com/g,
  ]

  /**
   * @private
   * @property {object} __private Prirvate Caches/Data for further Parsing and Memory Cache for Vimeo Constructor
   */
  #__private = {
    __raw: undefined,
    __scrapperOptions: undefined,
    __rawExtra: undefined,
    __rawJSON: undefined,
  }

  /**
   * @constructor
   * @param {string} rawResponse Response Body like in text or HTML Player's Source Code
   * @param {object} __scrapperOptions scrapping Options for raw Fetch Method
   * @param {object} extraContents Extra Contents for Merging for cache in "extra Cache"
   */
  constructor(
    rawResponse,
    __scrapperOptions = vimeoTrack.__scrapperOptions,
    extraContents = {},
  ) {
    this.#__private = {
      __raw: rawResponse,
      __scrapperOptions: __scrapperOptions,
      __rawExtra: extraContents,
    }
    this.#__patch(rawResponse, false, extraContents)
  }

  /**
   * @static
   * __test() -> Regex Testing with respect to Arrays of Regex and Raw Url Provided
   * @param {string} rawUrl raw url for checking if its Vimeo Video URL
   * @param {boolean | 'false'} returnRegex Boolean Value for if return the residue or results
   * @returns {boolean | RegExpMatchArray} returns Boolean on success and Regex match Array Data if its requested
   */
  static __test(rawUrl, returnRegex = false) {
    try {
      if (!(rawUrl && typeof rawUrl === 'string' && rawUrl !== '')) return false
      return returnRegex &&
        Boolean(vimeoTrack.__vimeoRegex.find((regExp) => regExp.test(rawUrl)))
        ? rawUrl?.match(
            vimeoTrack.__vimeoRegex.find((regExp) => rawUrl.match(regExp)),
          ) ?? false
        : Boolean(vimeoTrack.__vimeoRegex.find((regExp) => regExp.test(rawUrl)))
    } catch {
      return false
    }
  }

  /**
   * @private
   * #__patch() -> Patching Method for constructor Vimeo Handler
   * @param {string} rawResponse Response Body like in text or HTML Player's Source Code
   * @param {boolean | "false"} returnOnly Boolean value for exceptions of Parsing only method use
   * @param {object} extraContents extra keys and values to merge/assign to the constructor on request
   * @returns {object} Returns the parsed structured Data for if any use
   */
  #__patch(rawResponse, returnOnly = false, extraContents = {}) {
    try {
      if (
        !(rawResponse && typeof rawResponse === 'string' && rawResponse !== '')
      )
        throw new TypeError(
          'Vimeo Internal Error : Invalid Response is Fetched from Axios.get()',
        )

      let rawJsonData = JSON.parse(
        rawResponse
          ?.split('<script> (function(document, player) { var config = ')?.[1]
          ?.split(';')?.[0],
      )
      if (!(rawJsonData?.video && rawJsonData?.request?.files?.progressive))
        throw new TypeError(
          'Vimeo Internal Error : Invalid Response JSON is Parsed',
        )
      let __rawStreamData = rawJsonData?.request?.files?.progressive?.find(
        (stream) =>
          stream?.url && typeof stream?.url === 'string' && stream?.url !== '',
      )
      this.#__private.__rawJSON = {
        ...this.__private?.__rawJSON,
        ...rawJsonData?.video,
        ...extraContents,
        stream: __rawStreamData,
      }
      let __cookedStructure = this.#__private?.__scrapperOptions?.parseRaw
        ? this.parseRaw()
        : this.#__private.__rawJSON
      if (!returnOnly) Object.assign(this, __cookedStructure)
      return __cookedStructure
    } catch (rawError) {
      if (this.#__private?.__scrapperOptions?.ignoreError)
        return utils.__errorHandling(rawError)
      else throw rawError
    }
  }

  /**
   * parseRaw() -> Parse Raw Object/Properties of teh Class or requested Object Variable
   * @param {object} rawObjects Raw Objects Value to be parsed into meaningfull and cleaned
   * @returns {object} Return cleaned Object Variable
   */
  parseRaw(rawObjects = this.#__private?.__rawJSON) {
    try {
      if (!(rawObjects && typeof rawObjects === 'object' && rawObjects !== {}))
        return undefined
      let __rawEntries = Object.entries(rawObjects),
        cookedStructure = {}
      cookedStructure['title'] = __rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'title' && raw?.[1],
      )?.[1]
      cookedStructure['url'] = __rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'url' && raw?.[1],
      )?.[1]
      cookedStructure['description'] = __rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'description' && raw?.[1],
      )?.[1]
      cookedStructure['duration'] = {
        ms:
          parseInt(
            __rawEntries?.find(
              (raw) => raw?.[0] && raw?.[0]?.trim() === 'duration' && raw?.[1],
            )?.[1] ?? 0,
          ) * 1000,
        readable: prettyMS(
          parseInt(
            __rawEntries?.find(
              (raw) => raw?.[0] && raw?.[0]?.trim() === 'duration' && raw?.[1],
            )?.[1] ?? 0,
          ) * 1000,
        ),
      }
      cookedStructure['thumbnails'] = __rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'thumbs' && raw?.[1],
      )?.[1]
      cookedStructure['author'] = {
        type: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'owner' && raw?.[1],
        )?.[1]?.['account_type'],
        name: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'owner' && raw?.[1],
        )?.[1]?.['name'],
        url: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'owner' && raw?.[1],
        )?.[1]?.['url'],
        images: {
          normal: __rawEntries?.find(
            (raw) => raw?.[0] && raw?.[0]?.trim() === 'owner' && raw?.[1],
          )?.[1]?.['img'],
          normal2X: __rawEntries?.find(
            (raw) => raw?.[0] && raw?.[0]?.trim() === 'owner' && raw?.[1],
          )?.[1]?.['img_2x'],
        },
        authorId:
          __rawEntries?.find(
            (raw) => raw?.[0] && raw?.[0]?.trim() === 'creator_id' && raw?.[1],
          )?.[1] ??
          __rawEntries?.find(
            (raw) => raw?.[0] && raw?.[0]?.trim() === 'owner' && raw?.[1],
          )?.[1]?.['id'],
      }
      cookedStructure['trackId'] = __rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'id' && raw?.[1],
      )?.[1]
      cookedStructure['privacy'] = __rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'privacy' && raw?.[1],
      )?.[1]
      cookedStructure['language'] = __rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'lang' && raw?.[1],
      )?.[1]
      cookedStructure['shareURL'] = __rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'share_url' && raw?.[1],
      )?.[1]
      cookedStructure['isLive'] = !!__rawEntries?.find(
        (raw) => raw?.[0] && raw?.[0]?.trim() === 'live_event' && raw?.[1],
      )?.[1]
      cookedStructure['streamMetadata'] = {
        type: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'stream' && raw?.[1],
        )?.[1]?.['mime'],
        width: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'stream' && raw?.[1],
        )?.[1]?.['width'],
        height: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'stream' && raw?.[1],
        )?.[1]?.['height'],
        fps: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'stream' && raw?.[1],
        )?.[1]?.['fps'],
        quality: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'stream' && raw?.[1],
        )?.[1]?.['quality'],
        streamUrl: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'stream' && raw?.[1],
        )?.[1]?.['url'],
        buffer: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'stream' && raw?.[1],
        )?.[1]?.['buffer'],
      }
      cookedStructure['htmlPlayer'] = {
        url: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'player' && raw?.[1],
        )?.[1],
        width: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'player_width' && raw?.[1],
        )?.[1],
        height: __rawEntries?.find(
          (raw) => raw?.[0] && raw?.[0]?.trim() === 'player_height' && raw?.[1],
        )?.[1],
      }
      return cookedStructure
    } catch (rawError) {
      if (this.#__private?.__scrapperOptions?.ignoreError)
        return utils.__errorHandling(rawError)
      else throw rawError
    }
  }

  /**
   * method getStream() -> Fetch Stream Readable
   * @param {string} fetchUrl Fetch Stream Url or normal Vimeo Video Url
   * @returns {Promise<Readable>} Returns Stream for HTML5 Pages or Web Apps working on Stream Based or pipeing Stuff
   */
  async getStream(fetchUrl = this.streamMetadata?.url ?? this.url ?? this?.video_url) {
    try {
      if (!(fetchUrl && typeof fetchUrl === 'string' && fetchUrl !== ''))
        throw new TypeError(
          'Vimeo Internal Error : Invalid Stream Url is Parsed for creating Readable Stream',
        )
      else if (
        !(
          fetchUrl?.endsWith('mp3') ||
          fetchUrl?.endsWith('mp4') ||
          fetchUrl?.startsWith('http')
        )
      ) {
        if (!utils.__vimeoVideoIdParser(fetchUrl)) return undefined
        let rawResponse = await utils.__rawfetchBody(
          vimeoTrack.__playerUrl +
            (utils.__vimeoVideoIdParser(fetchUrl) ??
              this.videoid ??
              this.trackId),
          this.#__private?.__scrapperOptions?.htmlOptions,
        )
        if (
          !(
            rawResponse &&
            typeof rawResponse === 'string' &&
            rawResponse !== ''
          )
        )
          throw new TypeError(
            'Vimeo Internal Error : Invalid Response is Fetched from Axios.get()',
          )
        else fetchUrl = this.#__patch(rawResponse, true)?.stream?.url
      }
      if (!(fetchUrl && typeof fetchUrl === 'string' && fetchUrl !== ''))
        throw new TypeError(
          'Vimeo Internal Error : Invalid Stream Url is Parsed for creating Readable Stream',
        )
      const rawDownloadFunction = fetchUrl?.startsWith('https') ? https : http
      return new Promise((resolve) => {
        rawDownloadFunction.get(fetchUrl, (response) => {
          Object.assign(this.streamMetadata, {
            ...this.streamMetadata,
            buffer: response,
          })
          resolve(response)
        })
      })
    } catch (rawError) {
      if (this.#__private?.__scrapperOptions?.ignoreError)
        return utils.__errorHandling(rawError)
      else throw rawError
    }
  }
  /**
   * @static
   * __htmlFetch() -> Html 5 Player Fetch for Vimeo Url
   * @param {string} rawUrl raw Vimeo Video Url for the Extraction
   * @param {object} __scrapperOptions scrapping Options for raw Fetch Method
   * @param {object} extraContents Extra Contents to be Added  if placed from Html file Parser
   * @returns {Promise<vimeoTrack>} Returns Instance of Vimeo with properties of Data
   */
  static async __htmlFetch(
    rawUrl,
    __scrapperOptions = vimeoTrack.__scrapperOptions,
    extraContents = {},
  ) {
    try {
      if (
        !(
          rawUrl &&
          typeof rawUrl === 'string' &&
          rawUrl !== '' &&
          utils.__vimeoVideoIdParser(rawUrl)
        )
      )
        throw new TypeError(
          'Vimeo Internal Error : Invalid Vimeo Video Url is for Parsing and Extraction',
        )
      __scrapperOptions = {
        ...vimeoTrack.__scrapperOptions,
        ...__scrapperOptions,
        htmlOptions: {
          ...vimeoTrack.__scrapperOptions?.htmlOptions,
          ...__scrapperOptions?.htmlOptions,
        },
        fetchOptions: {
          ...vimeoTrack.__scrapperOptions?.fetchOptions,
          ...__scrapperOptions?.fetchOptions,
        },
      }
      rawUrl = vimeoTrack.__vimeoPlayerRegex?.find(
        (regex) => regex && regex.test(rawUrl),
      )
        ? rawUrl
        : vimeoTrack.__playerUrl + utils.__vimeoVideoIdParser(rawUrl)
      let rawResponse = await utils.__rawfetchBody(
        rawUrl,
        __scrapperOptions?.htmlOptions,
      )
      if (
        !(rawResponse && typeof rawResponse === 'string' && rawResponse !== '')
      )
        throw new TypeError(
          'Vimeo Internal Error : Invalid Response is Fetched from Axios.get()',
        )
      let rawVimeo = new vimeoTrack(
        rawResponse,
        __scrapperOptions,
        extraContents,
      )
      if (__scrapperOptions?.fetchOptions?.fetchStreamReadable)
        await rawVimeo.getStream()
      return rawVimeo
    } catch (rawError) {
      if (__scrapperOptions?.ignoreError) return utils.__errorHandling(rawError)
      else throw rawError
    }
  }

  /**
   * embedHTMl() -> Embed Frame Method to make a single html code snippet to paste for Embeded HTML Player
   * @param {number | string | 640} width width length of the Player in  Embeded HTML Player Frame
   * @param {number | string | 360} height height length of the Player in Embeded HTML Player Frame
   * @param {number | string | 0} frameBorder frameBorder data of the Player in Embeded HTML Player Frame
   * @returns {string | void} Returns <frame> Embed Player for HTML pages
   */
  embedHTMl(width = 640, height = 360, frameBorder = 0) {
    if (
      !this.htmlPlayer?.url &&
      !this.#__private?.__rawJSON?.embed_code &&
      !this.#__private?.__rawExtra?.player
    )
      return undefined
    else
      this.#__private?.__rawJSON?.embed_code ??
        `<iframe title="vimeo-player" src="` +
          (this.htmlPlayer?.url ?? this.#__private?.__rawExtra?.player) +
          `" width="` +
          width +
          `" height="` +
          height +
          `" frameborder="` +
          (frameBorder ?? 0) +
          `" allowfullscreen></iframe>`
  }

  /**
   * @type {object} Raw Data from HTML Fetches and <response.data> Body and Compiled
   */
  get raw() {
    return this.#__private?.__raw
  }
  /**
   * @type {object} Raw JSON Data from HTML Fetches and <response.data> Body and Compiled
   */
  get rawJSON() {
    return this.#__private?.__rawJSON
  }
  /**
   * @type {object} Raw Extra Data from HTML Fetches and <response.data> Body and Compiled
   */
  get extraRaw() {
    return this.#__private?.__rawExtra
  }

  /**
   * @type {string} Vimeo Video's Id Parsed from fetched Url if present
   */
  get videoid() {
    if (!this.url) return undefined
    else return utils.__vimeoVideoIdParser(this.url, vimeoTrack.__vimeoRegex)
  }
}

module.exports = vimeoTrack
