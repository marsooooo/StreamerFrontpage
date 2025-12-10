"use client"

import useSWR from "swr"
import { fetchYouTubeVideos } from "@/lib/api-client"

type YouTubeVideo = {
  id: string
  title: string
  thumbnail: string
}

export default function LatestContent() {
  const youtubeUser = process.env.NEXT_PUBLIC_YOUTUBE_USER || "peaxy"

  const { data: youtubeVideos = [], isLoading } = useSWR(
    `youtube-videos-${youtubeUser}`,
    () => fetchYouTubeVideos(youtubeUser),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )

  const socialLinks = [
    {
      name: "Twitch",
      url: `https://twitch.tv/${process.env.NEXT_PUBLIC_TWITCH_USER}`,
      icon: "📺",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      name: "YouTube",
      url: `https://youtube.com/@${process.env.NEXT_PUBLIC_YOUTUBE_USER}`,
      icon: "🎥",
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      name: "X",
      url: `https://x.com/${process.env.NEXT_PUBLIC_XTWITTER_USER}`,
      icon: "𝕏",
      color: "bg-black hover:bg-gray-900 border border-white",
    },
    {
      name: "Instagram",
      url: `https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_USER}`,
      icon: "📸",
      color: "bg-pink-600 hover:bg-pink-700",
    },
  ]

  return (
    <section className="w-full bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Derniers <span className="text-purple-400">Contenus</span>
          </h2>

          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6">Dernières vidéos YouTube</h3>

            {isLoading ? (
              <div className="text-center text-white py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="mt-4">Chargement des vidéos...</p>
              </div>
            ) : youtubeVideos.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p>Pas de vidéos trouvées.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {youtubeVideos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/50 transition-shadow"
                  >
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-white font-medium line-clamp-2">{video.title}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Retrouve Peaxy sur</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${link.color} text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg`}
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
