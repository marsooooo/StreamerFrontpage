import { useEffect, useRef } from "react"

interface TwitchEmbedOptions {
  width?: string | number
  height?: string | number
  channel?: string
  autoplay?: boolean
  muted?: boolean
  parent?: string[]
}

interface Twitch {
  Embed: new (container: HTMLElement, options: TwitchEmbedOptions) => any
}

declare global {
  interface Window {
    Twitch?: Twitch
  }
}

export default function TwitchStream() {
  const twitchChannel = import.meta.env.VITE_TWITCH_USER || "peaxy"
  const twitchParent = import.meta.env.VITE_TWITCH_PARENT || window.location.hostname
  const twitchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (twitchRef.current && window.Twitch) {
      new window.Twitch.Embed(twitchRef.current, {
        width: "100%",
        height: "100%",
        channel: twitchChannel,
        autoplay: true,
        muted: true,
        parent: [twitchParent],
      })
    }
  }, [twitchChannel, twitchParent])

  return (
    <section className="w-full bg-gradient-to-b from-purple-950 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-8">
            Peaxy <span className="text-purple-400">Live</span>
          </h1>
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <div
              ref={twitchRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
