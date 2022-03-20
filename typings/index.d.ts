import { Readable } from 'stream'

declare type scrapperOptions = {
  htmlOptions: object
  fetchOptions: { fetchStreamReadable: boolean | 'true' }
  ignoreError: boolean | 'true'
  parseRaw: boolean | 'true'
}
declare class vimeoTrack {
  public get videoId(): string | void
  public get raw(): object | void
  public get extraRaw(): object | void
  public get rawJSON(): object | void
  public parseRaw(rawObjects: object | void): object | void
  public getStream(fetchUrl: string | void): Promise<Readable>
}

export declare class vimeo {
  public static readonly __scrapperOptions: scrapperOptions
  public static readonly __vimeoRegex: RegExp[]
  public static readonly __vimeoPlayerRegex: RegExp[]
  public static readonly __playerUrl: string
  public static html(
    rawUrl: string,
    __scrapperOptions: scrapperOptions,
  ): Promise<vimeoTrack>
  public static __test(
    rawUrl: string,
    returnRegex: boolean | 'false',
  ): boolean | RegExpMatchArray
}

declare const _default: {
  vimeo: typeof vimeo
  html: typeof vimeo.html
}
export default _default
export function html(
  rawUrl: string,
  __scrapperOptions: scrapperOptions,
): Promise<vimeoTrack>
