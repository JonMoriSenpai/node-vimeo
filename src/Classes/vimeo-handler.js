const utils = require('../Utils/__defaultUtils.js')
var vimeoHandler = require('vimeo').Vimeo

class vimeo {
  static __vimeoRegex = []
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
  static async __clientManager(credentials) {
    let vimeoClient = new vimeoHandler()
  }
  static async __extractor(rawUrl, __scrapperOptions, __cacheMain) {
    try {
      if (!(rawUrl && typeof rawUrl === 'string' && rawUrl !== ''))
        return undefined
      let rawResponse = await utils.__rawfetchBody(
        rawUrl,
        __scrapperOptions?.fetchOptions,
      )
      if (
        !(rawResponse && typeof rawResponse === 'string' && rawResponse !== '')
      )
        return undefined
      let rawParsed = await utils.__customParser(rawResponse, 'videos')
      if (!rawParsed) return undefined
      else return rawParsed
    } catch (rawError) {
      if (__scrapperOptions?.ignoreError) return utils.__errorHandling(rawError)
      else throw rawError
    }
  }
}

module.exports = vimeo
