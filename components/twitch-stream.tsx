"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    Twitch?: {
      Embed: new (
        element: HTMLElement,
        options: {
          width: string
          height: string
          channel: string
          layout: string
          autoplay: boolean
          muted: boolean
          parent: string[]
        },
      ) => unknown
    }
  }
}

export default function TwitchStream() {
  const twitchChannel = process.env.NEXT_PUBLIC_TWITCH_USER || "peaxy"
  const twitchRef = useRef<HTMLDivElement>(null)
  const embedRef = useRef<unknown>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (!window.Twitch) {
      const script = document.createElement("script")
      script.setAttribute("src", "https://embed.twitch.tv/embed/v1.js")
      script.addEventListener("load", () => setScriptLoaded(true))
      document.body.appendChild(script)
    } else {
      setScriptLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (scriptLoaded && twitchRef.current && !embedRef.current) {
      twitchRef.current.innerHTML = ""

      const parents = [window.location.hostname]

      try {
        if (window.Twitch) {
          embedRef.current = new window.Twitch.Embed(twitchRef.current, {
            width: "100%",
            height: "100%",
            channel: twitchChannel,
            layout: "video",
            autoplay: true,
            muted: true,
            parent: parents,
          })
        }
      } catch (e) {
        console.error("Twitch embed error:", e)
      }
    }
  }, [scriptLoaded, twitchChannel])

  return (
    <section className="w-full py-8 animate-in fade-in duration-700">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
            Peaxy <span className="text-purple-400">Live</span>
          </h1>
          <div
            className="relative w-full bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ paddingBottom: "56.25%" }}
          >
            <div id="twitch-embed" ref={twitchRef} className="absolute top-0 left-0 w-full h-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
