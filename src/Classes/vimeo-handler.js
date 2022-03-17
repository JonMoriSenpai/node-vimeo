const utils = require('../Utils/__defaultUtils.js')
const vimeoHandler = require('vimeo').Vimeo
const https = require('https')
const http = require('http')
const { Readable } = require('stream')

class vimeo {
  static __playerUrl = 'https://player.vimeo.com/video/'
  #__private = {
    __raw: undefined,
    __scrapperOptions: undefined,
    __type: undefined,
  }
  constructor(rawResponse, __scrapperOptions, parseType = 'html') {
    this.#__private = {
      __raw: rawResponse,
      __scrapperOptions: __scrapperOptions,
      __type: parseType,
    }
    this.#__patch(rawResponse, parseType)
  }
  static __vimeoRegex = [
    /(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/,
  ]
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
  #__patch(rawResponse, parseType = 'html', returnOnly = false) {
    switch (parseType?.toLowerCase()?.trim()) {
      case 'html':
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
          this.videoMetadata = {
            ...rawJsonData?.video,
            stream: __rawStreamData,
          }
        return {
          ...rawJsonData?.video,
          stream: __rawStreamData,
        }
    }
  }
  /**
   * method getStreamReadable() -> Fetch Stream Readable
   * @param {string} fetchUrl
   * @returns {Promise<Readable>}
   */
  async getStreamReadable(
    fetchUrl = this.videoMetadata?.stream?.url ?? this.stream?.url,
  ) {
    if (!(fetchUrl && typeof fetchUrl === 'string' && fetchUrl !== ''))
      return undefined
    else if (!(fetchUrl?.endsWith('mp3') || fetchUrl?.endsWith('mp4'))) {
      if (!fetchUrl?.split('/')?.filter(Boolean)?.pop() ?? this.videoid)
        return undefined
      let rawResponse = await utils.__rawfetchBody(
        vimeo.__playerUrl +
          (fetchUrl?.split('/')?.filter(Boolean)?.pop() ?? this.videoid),
        this.#__private?.__scrapperOptions?.apiOptions,
      )
      if (
        !(rawResponse && typeof rawResponse === 'string' && rawResponse !== '')
      )
        return undefined
      else fetchUrl = this.#__patch(rawResponse, 'html', true)?.stream?.url
    }
    const rawDownloadFunction = fetchUrl?.startsWith('https://') ? https : http
    return new Promise((resolve) => {
      rawDownloadFunction.get(fetchUrl, (response) => {
        if (!this.stream)
          this.videoMetadata = {
            ...this.videoMetadata,
            stream: { ...this.videoMetadata?.stream, buffer: response },
          }
        else
          this.stream = {
            ...this.stream,
            buffer: response,
          }
        resolve(response)
      })
    })
  }
  static async __clientManager(credentials) {
    let vimeoClient = new vimeoHandler()
  }
  static async __extractor(rawUrl, __scrapperOptions, __cacheMain) {
    try {
      if (!(rawUrl && typeof rawUrl === 'string' && rawUrl !== ''))
        return undefined
      let rawResponse = await utils.__rawfetchBody(
        rawUrl,
        __scrapperOptions?.apiOptions,
      )
      if (
        !(rawResponse && typeof rawResponse === 'string' && rawResponse !== '')
      )
        return undefined
      let rawVimeo = new vimeo(rawResponse, __scrapperOptions, 'html')
      if (__scrapperOptions?.fetchStreamReadable)
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
    else return this.url?.split('/')?.filter(Boolean)?.pop()
  }
}
vimeo.__extractor('https://player.vimeo.com/video/246660563')

module.exports = vimeo
