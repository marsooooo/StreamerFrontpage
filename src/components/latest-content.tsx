import { useState, useEffect } from 'react'
import { fetchYouTubeVideos } from '../api/client'

type YouTubeVideo = {
  id: string
  title: string
  thumbnail: string
}

export default function LatestContent() {
  const twitchUser = import.meta.env.VITE_TWITCH_USER || 'peaxy'
  const youtubeUser = import.meta.env.VITE_YOUTUBE_USER || 'peaxy'
  const twitterUser = import.meta.env.VITE_XTWITTER_USER || 'peaxy'
  const instagramUser = import.meta.env.VITE_INSTAGRAM_USER || 'peaxy'

  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videos = await fetchYouTubeVideos(youtubeUser)
        setYoutubeVideos(videos)
      } catch (error) {
        console.error('Error fetching YouTube videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [youtubeUser])

  const socialLinks = [
    { name: 'Twitch', url: `https://twitch.tv/${twitchUser}`, icon: '📺', color: 'bg-purple-600 hover:bg-purple-700' },
    { name: 'YouTube', url: `https://youtube.com/@${youtubeUser}`, icon: '🎥', color: 'bg-red-600 hover:bg-red-700' },
    { name: 'X', url: `https://x.com/${twitterUser}`, icon: '𝕏', color: 'bg-black hover:bg-gray-900 border border-white' },
    { name: 'Instagram', url: `https://instagram.com/${instagramUser}`, icon: '📸', color: 'bg-pink-600 hover:bg-pink-700' },
  ]

  return (
    <section className="w-full bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Latest <span className="text-purple-400">Content</span>
          </h2>

          {/* YouTube Videos */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6">
              Latest YouTube Videos
            </h3>
            
            {loading ? (
              <div className="text-center text-white py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="mt-4">Loading videos...</p>
              </div>
            ) : youtubeVideos.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p>No videos found. Check VITE_YOUTUBE_USER and VITE_GOOGLE_API_KEY</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {youtubeVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/50 transition-shadow"
                  >
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id}`}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-white font-medium line-clamp-2">{video.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">
              Find Peaxy on
            </h3>
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
