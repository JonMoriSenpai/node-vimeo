const utils = require('../Utils/__defaultUtils.js')
const vimeo = require('./vimeo-player')
class htmlVimeo {
  static async extraction(rawUrl, __scrapperOptions) {
    if (!(rawUrl && typeof rawUrl === 'string' && rawUrl !== ''))
      return undefined
    try {
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

      const vimeoInstance = await vimeo.__htmlFetch(
        rawJsonResponse?.['url'],
        __scrapperOptions,
        rawJsonResponse,
      )
      console.log(vimeoInstance)
      return vimeoInstance
    } catch (rawError) {
      if (__scrapperOptions?.ignoreError) return utils.__errorHandling(rawError)
      else throw rawError
    }
  }
}
htmlVimeo.extraction('https://vimeo.com/baku89/fly')
module.exports = htmlVimeo
