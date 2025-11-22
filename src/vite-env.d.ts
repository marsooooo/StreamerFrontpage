/// <reference types="vite/client" />

interface TwitchEmbedOptions {
  width?: string | number
  height?: string | number
  channel?: string
  autoplay?: boolean
  muted?: boolean
  parent?: string[]
  layout?: string
}

interface Twitch {
  Embed: new (container: HTMLElement, options: TwitchEmbedOptions) => any
}

interface Window {
  Twitch?: Twitch
}
