const utils = require('../Utils/__defaultUtils.js')
const https = require('https')
const http = require('http')
const { Readable } = require('stream')

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
    __type: undefined,
  }
  constructor(
    rawResponse,
    __scrapperOptions,
    parseType = 'playerhtml',
    extraFillters = {},
  ) {
    this.#__private = {
      __raw: rawResponse,
      __scrapperOptions: __scrapperOptions,
      __type: parseType,
      ...extraFillters,
    }
    this.#__patch(rawResponse, parseType, false)
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
  #__patch(rawResponse, parseType = 'playerhtml', returnOnly = false) {
    if (!(rawResponse && typeof rawResponse === 'string' && rawResponse !== ''))
      return undefined
    switch (parseType?.toLowerCase()?.trim()) {
      case 'playerhtml':
        let rawJsonData = JSON.parse(
          rawResponse
            ?.split('<script> (function(document, player) { var config = ')?.[1]
            ?.split(';')?.[0],
        )
        if (!(rawJsonData?.video && rawJsonData?.request?.files?.progressive))
          return undefined
        let __rawStreamData = rawJsonData?.request?.files?.progressive?.find(
          (stream) =>
            stream?.url &&
            typeof stream?.url === 'string' &&
            stream?.url !== '',
        )
        if (!returnOnly)
          Object.assign(this, {
            ...rawJsonData?.video,
            stream: __rawStreamData,
          })
        return {
          ...rawJsonData?.video,
          stream: __rawStreamData,
        }
    }
  }
  /**
   * method getStreamReadable() -> Fetch Stream Readable
   * @param {string} fetchUrl Fetch Stream Url or normal Url
   * @returns {Promise<Readable>}
   */
  async getStreamReadable(fetchUrl = this.stream?.url) {
    try {
      if (!(fetchUrl && typeof fetchUrl === 'string' && fetchUrl !== ''))
        return undefined
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
          return undefined
        else fetchUrl = this.#__patch(rawResponse, 'html', true)?.stream?.url
      }
      if (!(fetchUrl && typeof fetchUrl === 'string' && fetchUrl !== ''))
        return undefined
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
      return utils.__errorHandling(rawError)
    }
  }
  /**
   *
   * @param {string} rawUrl raw Vimeo Video Url for the Extraction
   * @param {object} __scrapperOptions scrapping Options for raw Fetch Method
   * @returns {Promise<vimeo>} Returns Instance of Vimeo with properties of Data
   */
  static async __htmlFetch(
    rawUrl,
    __scrapperOptions = vimeo.__scrapperOptions,
  ) {
    try {
      if (!(rawUrl && typeof rawUrl === 'string' && rawUrl !== ''))
        return undefined
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
        return undefined
      let rawVimeo = new vimeo(rawResponse, __scrapperOptions)
      if (__scrapperOptions?.fetchOptions?.fetchStreamReadable)
        await rawVimeo.getStreamReadable()
      return rawVimeo
    } catch (rawError) {
      if (__scrapperOptions?.ignoreError) return utils.__errorHandling(rawError)
      else throw rawError
    }
  }
  get raw() {
    return this.#__private?.__raw
  }
  get videoid() {
    if (!this.url) return undefined
    else return utils.__customParser(this.url)
  }
}
new Promise(async () => {
  console.log(
    await vimeo.__htmlFetch('https://vimeo.com/246660563', {
      fetchOptions: { fetchStreamReadable: true },
    }),
  )
})

module.exports = vimeo
