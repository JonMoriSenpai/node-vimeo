const Axios = require('axios').default
const fileSystem = require('fs')
const path = require('path')

String.prototype.replaceAll = function (search, replacement) {
  var target = this
  return target.replace(new RegExp(search, 'g'), replacement)
}

class utils {
  static async __rawfetchBody(
    rawApiUrl,
    apiOptions,
    returnType = 'data',
    ignoreError = true,
    axiosMethod = 'GET',
    filters,
  ) {
    if (!(rawApiUrl && typeof rawApiUrl === 'string' && rawApiUrl !== ''))
      return undefined
    try {
      let rawResponse
      switch (axiosMethod?.toLowerCase()?.trim()) {
        case 'get':
          rawResponse = await Axios.get(rawApiUrl, { ...apiOptions })
        case 'post':
          rawResponse = await Axios.post(rawApiUrl, { ...apiOptions })
        default:
          return undefined
      }

      if (
        !(
          rawResponse &&
          rawResponse.status === 200 &&
          rawResponse?.[returnType ?? 'data']
        )
      )
        throw new Error('Invalid Response Fetched from Api Url')
      else return rawResponse?.[returnType ?? 'data']
    } catch (rawError) {
      if (ignoreError) return utils.__errorHandling(rawError)
      else throw rawError
    }
  }

  static #__cacheTemp(rawData, fileName = '__fbWatchPage.html') {
    if (!fileSystem.existsSync(path.join(__dirname, '/../cache')))
      fileSystem.mkdirSync(path.join(__dirname, '/../cache'))
    const __cacheLocation = path.join(__dirname, '/../cache', '/' + fileName)
    if (!__cacheLocation) return undefined
    return fileSystem.writeFileSync(__cacheLocation, rawData)
  }
  static __errorHandling(error = new Error()) {
    if (!error?.message) return undefined
    if (!fileSystem.existsSync(path.join(__dirname, '/../cache')))
      fileSystem.mkdirSync(path.join(__dirname, '/../cache'))
    const __cacheLocation = path.join(
      __dirname,
      '/../cache',
      '/__errorLogs.txt',
    )
    if (!__cacheLocation) return undefined
    if (!fileSystem.existsSync(__cacheLocation)) {
      fileSystem.writeFileSync(
        __cacheLocation,
        `${new Date()} | ` +
          `\n ErrorMessage: ${error?.message ?? `${error}`}\n ErrorStack: ${
            error?.stack ?? 'Unknown-Stack'
          }`,
      )
    } else if (
      (fileSystem.readFileSync(__cacheLocation)?.length ?? 0) < 500000
    ) {
      fileSystem.appendFileSync(
        __cacheLocation,
        `\n\n${new Date()} | ` +
          `\n ErrorMessage: ${error?.message ?? `${error}`}\n ErrorStack: ${
            error?.stack ?? 'Unknown-Stack'
          }`,
        'utf8',
      )
    } else {
      fileSystem.writeFileSync(
        __cacheLocation,
        `${new Date()} | ` +
          `\n ErrorMessage: ${error?.message ?? `${error}`}\n ErrorStack: ${
            error?.stack ?? 'Unknown-Stack'
          }`,
      )
    }
    return true
  }
}

module.exports = utils
