export default function EmotesSection() {
  const latestEmotes = [
    { id: 1, name: "Emote1" },
    { id: 2, name: "Emote2" },
    { id: 3, name: "Emote3" },
    { id: 4, name: "Emote4" },
    { id: 5, name: "Emote5" },
  ]

  const olderEmotes = [
    { id: 6, name: "Emote6" },
    { id: 7, name: "Emote7" },
    { id: 8, name: "Emote8" },
    { id: 9, name: "Emote9" },
    { id: 10, name: "Emote10" },
    { id: 11, name: "Emote11" },
    { id: 12, name: "Emote12" },
  ]

  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Emotes du <span className="text-purple-400">Mois</span>
          </h2>

          <div className="mb-12">
            <div className="flex flex-wrap justify-center content-center gap-6 mx-auto">
              {latestEmotes.map((emote) => (
                <div
                  key={emote.id}
                  className="w-32 h-32 md:w-40 md:h-40 bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center hover:bg-purple-900/50 transition-all duration-300 border-2 border-purple-500/30 hover:scale-110 hover:-rotate-2 cursor-pointer shadow-lg"
                >
                  <img src={`/emotes/${emote.name}.png`} alt={emote.name} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center opacity-80">Archives</h3>
            <div className="flex flex-wrap justify-center content-center gap-3 mx-auto">
              {olderEmotes.map((emote) => (
                <div
                  key={emote.id}
                  className="w-20 h-20 md:w-24 md:h-24 bg-gray-700/30 backdrop-blur-sm rounded-lg p-3 flex items-center justify-center hover:bg-purple-900/50 transition-all hover:scale-105 cursor-pointer"
                >
                  <img src={`/emotes/${emote.name}.png`} alt={emote.name} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-500 text-sm text-center mt-6">
            {"⚠️😡 Spammez Peaxy pour qu'elle me laisse mettre les emotes en place !!"}
          </p>
        </div>
      </div>
    </section>
  )
}
