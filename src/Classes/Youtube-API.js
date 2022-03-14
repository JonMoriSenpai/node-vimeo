const Utils = require('../Utils/Youtube-Utils.js')
const {
  enumData,
  searchOptions,
  youtubeValidateData,
} = require('../types/interfaces.js')
const YoutubeVideo = require('../Structures/Youtube-Elements/video-element')
const YoutubeChannel = require('../Structures/Youtube-Elements/channel-element.js')
const YoutubePlaylist = require('../Structures/Youtube-Elements/playlist-element.js')

/**
 * @class YoutubeApiLTE -> Custom Youtube API and not related to Official Youtube API | Though <Class>.<methods> fetches from Actual Youtube Page and Parses the Whole HTML Source Code from Request and returns Value .
 *  ### We Developers are not Responsible for the Data used by Someone else for any legal/illegal means returned by our Package/Repo
 */

class YoutubeApiLTE {
  /**
   * @constructor
   * @param {searchOptions} searchOptions -> Youtube Search Options for Request Module and Filter Parsing Sections
   */

  constructor(searchOptions) {
    /**
     * @type {searchOptions}
     * @readonly
     * searchOptions -> Youtube Search Options for Request Module and Filter Parsing Sections
     */
    this.searchOptions = { type: 'all', ...searchOptions }
  }

  /**
   * search() -> Normal Search Method for Youtube with "https://www.youtube.com/results" as Base Search Query Url and fetches data given by Youtube
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo} rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo[] | YoutubePlaylist[] | YoutubeChannel[] | void>} Returns Array of Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async search(rawQuery, searchOptions = this.searchOptions) {
    const validationData = await this.validate(rawQuery)
    if (!rawQuery || !validationData)
      throw TypeError(
        'Invalid Query is Detected for Safe Check: "Only needs Youtube URLs or Ids for: <YoutubeApiLTE>.search()"',
      )

    return await this.#htmlSearchResultFetch(
      validationData?.type === 'query' ? rawQuery : validationData?.url,
      {
        ...this.searchOptions,
        ...searchOptions,
      },
    )
      .then(async (cookedData) => {
        if (!cookedData?.length && validationData?.type === 'video')
          return [await this.getVideo(validationData?.url, searchOptions)]
        else if (!cookedData?.length && validationData?.type === 'playlist')
          return [await this.getPlaylist(validationData?.url, searchOptions)]
        else if (!cookedData?.length) return []
        return cookedData
      })
      .catch(() => undefined)
  }

  /**
   * searchOne() -> Search One Specific Data in Search Query Result
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo | YoutubePlaylist | YoutubeChannel | void>} Returns  Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async searchOne(rawQuery, searchOptions = this.searchOptions) {
    if (!rawQuery) return undefined
    return await this.search(rawQuery, {
      type: searchOptions?.type ?? 'video',
      limit: 1,
      AxiosHttpRequestConfigs: searchOptions?.AxiosHttpRequestConfigs,
      safeSearchMode: searchOptions?.safeSearchMode ?? false,
    })
      .then((cookedData) => {
        if (!cookedData?.length) return undefined
        return cookedData[0]
      })
      .catch(() => undefined)
  }

  /**
   * safeSearch() -> Safe Search Mode Function where "safeSearchMode" will be enabled by default
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo[] | YoutubePlaylist[] | YoutubeChannel[] | void>} Returns Array of Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async safeSearch(rawQuery, searchOptions = this.searchOptions) {
    if (!rawQuery) return undefined
    return await this.search(rawQuery, {
      type: searchOptions?.type ?? 'video',
      limit: searchOptions?.limit ?? 1,
      AxiosHttpRequestConfigs: searchOptions?.AxiosHttpRequestConfigs,
      safeSearchMode: true,
    })
      .then((cookedData) => {
        if (!cookedData?.length) return undefined
        return cookedData
      })
      .catch(() => undefined)
  }

  /**
   * safeSearchOne() -> Safe Search Mode Function where "safeSearchMode" will be enabled by default and Fetches 1 Value as its Answer
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo | YoutubePlaylist | YoutubeChannel | void>} Returns  Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async safeSearchOne(rawQuery, searchOptions = this.searchOptions) {
    if (!rawQuery) return undefined
    return await this.search(rawQuery, {
      type: searchOptions?.type ?? 'video',
      limit: 1,
      AxiosHttpRequestConfigs: searchOptions?.AxiosHttpRequestConfigs,
      safeSearchMode: true,
    })
      .then((cookedData) => {
        if (!cookedData?.length) return undefined
        return cookedData[0]
      })
      .catch(() => undefined)
  }

  /**
   * isSafeCheck() -> Safe Function check for Youtube Video as its primary scope and returns boolean as "true" or "false"
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawUrl Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<Boolean | void> | void} Returns Boolean Value for if its safe to use or not
   */

  async isSafeCheck(rawUrl, searchOptions = this.searchOptions) {
    let cookedUrl
    if (rawUrl instanceof YoutubeVideo) cookedUrl = rawUrl.url
    else if (typeof rawUrl === 'string') cookedUrl = rawUrl
    else
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )
    if (
      Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType !== 'video' &&
      Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.contentType !== 'videoId'
    )
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls to check"',
      )
    return await this.safeSearchOne(
      Utils.youtubeUrlParseHtmlSearch(cookedUrl)?.parsedUrl,
      {
        type: 'video',
        AxiosHttpRequestConfigs: searchOptions?.AxiosHttpRequestConfigs,
      },
    )
      .then((cookedData) => {
        if (cookedData || (Array.isArray(cookedData) && cookedData?.[0]))
          return true
        else return false
      })
      .catch(() => false)
  }

  /**
   * getVideo() -> Fetches Only Video and Fetches Data from Video's Official Page for correct and more valuable Data to Fetch
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawUrl Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @param {boolean | void} hardFetchMode hard Fetch method to fetch everything aggressively
   * @returns {Promise<YoutubeVideo | void> | void} Returns Youtube Video Data or undefined on failure
   */

  async getVideo(
    rawUrl,
    searchOptions = this.searchOptions,
    hardFetchMode = false,
  ) {
    const validationData = await this.validate(
      rawUrl,
      searchOptions?.safeSearchMode,
    )
    if (
      !rawUrl ||
      !validationData ||
      validationData?.type !== 'video' ||
      (validationData?.type === 'video' &&
        searchOptions?.safeSearchMode &&
        !validationData?.isSafeCheck)
    )
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Video URls or Video IDs to check"',
      )

    const fetchedVideo =
      rawUrl instanceof YoutubeVideo
        ? rawUrl.fetch(searchOptions)
        : Utils.hardHTMLSearchparse(
          await Utils.getHtmlData(
            `${validationData.url}&hl=en`,
            searchOptions?.AxiosHttpRequestConfigs,
          ),
          'video',
        )
    if (!hardFetchMode) return fetchedVideo

    fetchedVideo.suggestionVideos = (
      await Promise.all(
        fetchedVideo?.suggestionVideos?.map(async (suggestionVideo, Id) => {
          if (!(Id >= (searchOptions?.limit ?? Infinity))) {
            const cachedVideo = await suggestionVideo.fetch(
              searchOptions,
              Id + 1,
            )
            if (!cachedVideo) return undefined
            else return cachedVideo
          } else return undefined
        }),
      )
    )?.filter(Boolean)
    return fetchedVideo
  }

  /**
   * getPlaylist() -> Fetches Playlist Data from Playlist Url or Id and Fetches Data from Actual Playlist Page
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawUrl Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @param {boolean | void} hardPlaylistfetchMode hard Fetch method to fetch Playlist Video Data aggressively
   * @param {boolean | void} hardVideofetchMode hard Fetch method to fetch every Suggestion Videos in Youtube Video aggressively
   * @returns {Promise<YoutubePlaylist | void> | void} Returns Youtube Playlist Data or undefined on failure
   */

  async getPlaylist(
    rawUrl,
    searchOptions = this.searchOptions,
    hardPlaylistfetchMode = false,
    hardVideofetchMode = false,
  ) {
    const validationData = await this.validate(
      rawUrl,
      searchOptions?.safeSearchMode,
    )
    if (
      validationData?.type !== 'playlist' ||
      (validationData?.type === 'playlist' &&
        searchOptions?.safeSearchMode &&
        !validationData?.isSafeCheck)
    )
      throw TypeError(
        'Invalid rawUrl is Detected for Safe Check: "Only needs Playlist URls or Playlist IDs to check"',
      )

    const fetchedData = Utils.hardHTMLSearchparse(
      await Utils.getHtmlData(
        `${validationData.url}&hl=en`,
        searchOptions?.AxiosHttpRequestConfigs,
      ),
      'playlist',
      searchOptions?.limit ?? 0,
    )
    if (!hardPlaylistfetchMode) return fetchedData

    await fetchedData.fetchAll()

    fetchedData.videos = (
      await Promise.all(
        fetchedData?.videos?.map(async (video, Id) => {
          if (!(Id >= (searchOptions?.limit ?? Infinity))) {
            const cachedVideo = await this.getVideo(
              video,
              searchOptions,
              hardVideofetchMode ?? false,
            )
            cachedVideo.Id = Id + 1
            return cachedVideo
          } else return undefined
        }),
      )
    )?.filter(Boolean)
    return fetchedData
  }

  /**
   * validate() -> Validation of Urls or strings for Query , Video , Playlist and Channel
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawUrl Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {string | void} safeSearchMode Youtube Search Safe Mode if to check
   * @returns {Promise<youtubeValidateData> | void} Returns Parsed Data of Url and Id after validate of Data
   */

  async validate(rawData, safeSearchMode = false) {
    let cookedUrl
    if (!rawData) return undefined
    else if (
      rawData instanceof YoutubeVideo ||
      rawData instanceof YoutubeChannel ||
      rawData instanceof YoutubePlaylist
    )
      cookedUrl = rawData.url
    else if (typeof rawData === 'string') cookedUrl = rawData.trim()
    else return undefined

    const cookedData = Utils.youtubeUrlParseHtmlSearch(cookedUrl)
    if (typeof cookedUrl === 'string' && cookedData?.contentType === 'query') {
      return {
        Id: cookedUrl,
        url: cookedData.parsedUrl,
        type: 'query',
        isSafeCheck: true,
      }
    } else if (
      (typeof cookedUrl === 'string' && cookedData?.contentType === 'video') ||
      cookedData?.contentType === 'videoId'
    ) {
      return {
        Id: cookedData?.parsedData?.trim(),
        url: cookedData?.parsedUrl,
        type: 'video',
        isSafeCheck: safeSearchMode
          ? await this.isSafeCheck(cookedData.parsedUrl)
          : undefined,
      }
    } else if (
      (typeof cookedUrl === 'string' &&
        cookedData?.contentType === 'playlist') ||
      cookedData?.contentType === 'playlistId'
    ) {
      return {
        Id: cookedData?.parsedData?.trim(),
        url: cookedData?.parsedUrl,
        type: 'playlist',
        isSafeCheck: true,
      }
    } else if (
      typeof cookedUrl === 'string' &&
      cookedData?.contentType === 'channel'
    ) {
      return {
        Id: cookedData?.parsedData?.trim(),
        url: cookedData?.parsedUrl,
        type: 'channel',
        isSafeCheck: true,
      }
    } else return undefined
  }

  /**
   * getHomepage() -> Fetches Homepage Video Data into Youtube Video Formated
   * @param {searchOptions} searchOptions Search Options for HTTP Request Options
   * @returns {Promise<YoutubeVideo[] | void>} Returns Youtube Video Array or undefined on failure
   */

  async getHomepage(searchOptions = this.searchOptions) {
    return (
      Utils.parseHtmlHomepage(
        await Utils.getHtmlData(
          enumData?.HTML_YOUTUBE_HOMEPAGE_BASE_URL,
          searchOptions?.AxiosHttpRequestConfigs,
        ),
      ) ?? []
    )
  }

  /**
   * getTrending() -> Fetches Trending Page Data into Youtube Video Formated
   * @param {searchOptions} searchOptions Search Options for HTTP Request Options
   * @returns {Promise<YoutubeVideo[] | void>} Returns Youtube Video Array or [] or undefined on failure
   */

  async getTrending(searchOptions = this.searchOptions) {
    return (
      Utils.parseHTMLTrendingPage(
        await Utils.getHtmlData(
          enumData.HTML_YOUTUBE_TRENDING_PAGE_BASE_URL,
          searchOptions?.AxiosHttpRequestConfigs,
        ),
      ) ?? []
    )
  }

  /**
   * InnerTube() -> Fetches Inner API Key Data from Youtube HomePage
   * @param {searchOptions | void} searchOptions Search Options for HTTP Request Options
   * @returns {string | void} Returns Youtube Inner Tube API Key or undefined on failure
   */

  async innerTubeApikey(searchOptions = this.searchOptions) {
    const rawHTMLData = await Utils.getHtmlData(
      enumData.HTML_YOUTUBE_HOMEPAGE_BASE_URL,
      searchOptions?.AxiosHttpRequestConfigs,
    )
    if (!rawHTMLData) return undefined
    const apiKey =
      rawHTMLData?.split('INNERTUBE_API_KEY":"')?.[1]?.split('"')?.[0] ??
      rawHTMLData?.split('innertubeApiKey":"')?.[1]?.split('"')?.[0]
    return apiKey ?? undefined
  }

  /**
   * @private
   * #htmlSearchResultFetch() -> HTML Search Result private Fetch Function for public search method
   * @param {string | YoutubeChannel | YoutubePlaylist | YoutubeVideo } rawQuery Raw Query like Url , Youtube Ids or instance of YoutubeVideo | <YoutubeApiLTE>.validate() will Validate the value to Request
   * @param {searchOptions} searchOptions Youtube Search Options for Request Module and Filter Parsing Sections
   * @returns {Promise<YoutubeVideo[] | YoutubePlaylist[] | YoutubeChannel[] | void>} Returns Array of Youtube Video/Playlist/Channel Based on Client's requested searchOptions.type> value
   */

  async #htmlSearchResultFetch(rawQuery, searchOptions) {
    if (!rawQuery) return undefined
    if (
      !['all', 'channel', 'video', 'playlist', 'query'].includes(
        searchOptions?.type?.toLowerCase()?.trim(),
      )
    )
      return undefined
    const cookedQuery = Utils.youtubeUrlParseHtmlSearch(rawQuery)
    if (!cookedQuery?.parsedData || !cookedQuery.searchQueryUrl)
      return undefined

    const htmlgetUrl =
      `${cookedQuery?.searchQueryUrl}` +
      '&hl=en' +
      `${Utils.htmlSearchrawFilterParser(
        searchOptions?.type?.toLowerCase()?.trim(),
      )}`

    const htmlOptions = searchOptions?.safeSearchMode
      ? {
        ...searchOptions.AxiosHttpRequestConfigs,
        headers: { cookie: enumData?.HTML_SAFE_SEARCH_COOKIE_VALUE },
      }
      : {
        headers: enumData.HTML_YOUTUBE_HEADER_DATA,
        ...searchOptions.AxiosHttpRequestConfigs,
      }
    return Utils.parseHtmlSearchResults(
      await Utils.getHtmlData(htmlgetUrl, htmlOptions),
      searchOptions,
    )
  }
}

module.exports = YoutubeApiLTE
