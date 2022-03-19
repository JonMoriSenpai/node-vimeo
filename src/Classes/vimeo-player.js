const utils = require('../Utils/__defaultUtils.js')
const https = require('https')
const http = require('http')
const { Readable } = require('stream')

/**
 * @class vimeo -> Vimeo Handler Class for Handling Basic Un-Official Extraction and Parsing of Vimeo Video Metadata and Stream Readable
 */
class vimeo {
  static __scrapperOptions = {
    htmlOptions: {},
    fetchOptions: { fetchStreamReadable: true },
    ignoreError: true,
  }
  static __playerUrl = 'https://player.vimeo.com/video/'
  static __vimeoRegex = [
    /(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/,
  ]
  #__private = {
    __raw: undefined,
    __scrapperOptions: undefined,
    __rawExtra: undefined,
  }
  constructor(rawResponse, __scrapperOptions, extraContents = {}) {
    this.#__private = {
      __raw: rawResponse,
      __scrapperOptions: __scrapperOptions,
      __rawExtra: extraContents,
    }
    this.#__patch(rawResponse, false, extraContents)
  }
  static __test(rawUrl, returnRegex = false) {
    try {
      if (!(rawUrl && typeof rawUrl === 'string' && rawUrl !== '')) return false
      return returnRegex &&
        Boolean(vimeo.__vimeoRegex.find((regExp) => regExp.test(rawUrl)))
        ? rawUrl?.match(
            vimeo.__vimeoRegex.find((regExp) => rawUrl.match(regExp)),
          ) ?? false
        : Boolean(vimeo.__vimeoRegex.find((regExp) => regExp.test(rawUrl)))
    } catch {
      return false
    }
  }
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
      if (!returnOnly)
        Object.assign(this, {
          ...extraContents,
          ...rawJsonData?.video,
          stream: __rawStreamData,
        })
      return {
        ...extraContents,
        ...rawJsonData?.video,
        stream: __rawStreamData,
      }
    } catch (rawError) {
      if (this.#__private?.__scrapperOptions?.ignoreError)
        return utils.__errorHandling(rawError)
      else throw rawError
    }
  }
  /**
   * method getStreamReadable() -> Fetch Stream Readable
   * @param {string} fetchUrl Fetch Stream Url or normal Url
   * @returns {Promise<Readable>} Returns Stream for HTML5 Pages or Web Apps working on Stream Based or pipeing Stuff
   */
  async getStreamReadable(fetchUrl = this.stream?.url) {
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
        if (!utils.__customParser(fetchUrl)) return undefined
        let rawResponse = await utils.__rawfetchBody(
          vimeo.__playerUrl + (utils.__customParser(fetchUrl) ?? this.videoid),
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
          Object.assign(this.stream, {
            ...this.stream,
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
   * method __htmlFetch() -> Html 5 Player Fetch for Vimeo Url
   * @param {string} rawUrl raw Vimeo Video Url for the Extraction
   * @param {object} __scrapperOptions scrapping Options for raw Fetch Method
   * @param {object} extraContents Extra Contents to be Added  if placed from Html file Parser
   * @returns {Promise<vimeo>} Returns Instance of Vimeo with properties of Data
   */
  static async __htmlFetch(
    rawUrl,
    __scrapperOptions = vimeo.__scrapperOptions,
    extraContents = {},
  ) {
    try {
      if (
        !(
          rawUrl &&
          typeof rawUrl === 'string' &&
          rawUrl !== '' &&
          utils.__customParser(rawUrl)
        )
      )
        throw new TypeError(
          'Vimeo Internal Error : Invalid Vimeo Video Url is for Parsing and Extraction',
        )
      __scrapperOptions = {
        ...vimeo.__scrapperOptions,
        ...__scrapperOptions,
        htmlOptions: {
          ...vimeo.__scrapperOptions?.htmlOptions,
          ...__scrapperOptions?.htmlOptions,
        },
        fetchOptions: {
          ...vimeo.__scrapperOptions?.fetchOptions,
          ...__scrapperOptions?.fetchOptions,
        },
      }
      rawUrl = rawUrl?.includes('player.vimeo.com')
        ? rawUrl
        : vimeo.__playerUrl + utils.__customParser(rawUrl)
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
      let rawVimeo = new vimeo(rawResponse, __scrapperOptions, extraContents)
      if (__scrapperOptions?.fetchOptions?.fetchStreamReadable)
        await rawVimeo.getStreamReadable()
      return rawVimeo
    } catch (rawError) {
      if (__scrapperOptions?.ignoreError) return utils.__errorHandling(rawError)
      else throw rawError
    }
  }
  /**
   * @type {object} Raw Data from HTML Fetches and <response.data> Body and Compiled
   */
  get raw() {
    return this.#__private?.__raw
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
    else return utils.__customParser(this.url)
  }
}

module.exports = vimeo
