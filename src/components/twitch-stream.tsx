export default function TwitchStream() {
  const twitchChannel = import.meta.env.VITE_TWITCH_USER || 'peaxy'

  return (
    <section className="w-full bg-gradient-to-b from-purple-950 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-8">
            Peaxy <span className="text-purple-400">Live</span>
          </h1>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=localhost`}
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}
