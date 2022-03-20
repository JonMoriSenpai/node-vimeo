const utils = require('../Utils/__defaultUtils.js')
const vimeoTrack = require('./vimeo-player')

/**
 * @class htmlVimeo -> Html Vimeo Handler Class for Handling Basic Un-Official Extraction and Parsing of Vimeo Video Metadata and Stream Readable
 */
class htmlVimeo extends vimeoTrack {
  /**
   * @static
   * html() -> Html 5 Player Fetch for Vimeo Url
   * @param {string} rawUrl raw Vimeo Video Url for the Extraction
   * @param {object} __scrapperOptions scrapping Options for raw Fetch Method
   * @returns {Promise<vimeoTrack>} Returns Instance of Vimeo with properties of Data
   */
  static async html(rawUrl, __scrapperOptions = htmlVimeo.__scrapperOptions) {
    if (
      !(
        rawUrl &&
        typeof rawUrl === 'string' &&
        rawUrl !== '' &&
        htmlVimeo.__test(rawUrl)
      )
    )
      throw new TypeError(
        'Vimeo Internal Error : Invalid Url is Provided for Extraction',
      )

    try {
      __scrapperOptions = {
        ...htmlVimeo.__scrapperOptions,
        ...__scrapperOptions,
        htmlOptions: {
          ...htmlVimeo.__scrapperOptions?.htmlOptions,
          ...__scrapperOptions?.htmlOptions,
        },
        fetchOptions: {
          ...htmlVimeo.__scrapperOptions?.fetchOptions,
          ...__scrapperOptions?.fetchOptions,
        },
      }
      if (
        htmlVimeo.__vimeoPlayerRegex?.find(
          (regex) => regex && regex.test(rawUrl),
        )
      )
        return await htmlVimeo.__htmlFetch(rawUrl, __scrapperOptions)
      let rawResponse = await utils.__rawfetchBody(
        rawUrl,
        __scrapperOptions?.htmlOptions,
      )
      if (
        !(rawResponse && typeof rawResponse === 'string' && rawResponse !== '')
      )
        return undefined

      let rawJsonResponse = JSON.parse(
        `{` +
          rawResponse
            ?.split('<meta ')
            ?.filter((raw) => raw && raw?.includes('content='))
            ?.map((raw) => {
              try {
                raw = raw?.split(`>`)?.[0]
                if (!(raw && typeof raw === 'string' && raw !== ''))
                  return undefined
                else if (raw?.startsWith('property=')) {
                  return (
                    raw
                      ?.slice(
                        raw?.indexOf('property=') + `property=`.length,
                        raw?.indexOf('content='),
                      )
                      ?.replace('og:', '')
                      ?.replace('al:', '')
                      ?.replace('twitter:', '')
                      ?.replace(/[~`!@#$%^&*()+={}\[\];:<>.,\/\\\?-_]/g, '_')
                      ?.trim() +
                    `:` +
                    raw
                      ?.slice(raw?.indexOf('content=') + `content=`.length)
                      ?.trim()
                  )
                } else if (raw?.startsWith('name=')) {
                  return (
                    raw
                      ?.slice(
                        raw?.indexOf('name=') + `name=`.length,
                        raw?.indexOf('content='),
                      )
                      ?.replace('og:', '')
                      ?.replace('al:', '')
                      ?.replace('twitter:', '')
                      ?.replace(/[~`!@#$%^&*()+={}\[\];:<>.,\/\\\?-]/g, '_')
                      ?.trim() +
                    `:` +
                    raw
                      ?.slice(raw?.indexOf('content=') + `content=`.length)
                      ?.trim()
                  )
                } else return undefined
              } catch {
                return undefined
              }
            })
            ?.filter(Boolean)
            ?.join(',') +
          `}`,
      )
      return await htmlVimeo.__htmlFetch(
        rawJsonResponse?.['url'],
        __scrapperOptions,
        rawJsonResponse,
      )
    } catch (rawError) {
      if (__scrapperOptions?.ignoreError) return utils.__errorHandling(rawError)
      else throw rawError
    }
  }
}
module.exports = htmlVimeo
