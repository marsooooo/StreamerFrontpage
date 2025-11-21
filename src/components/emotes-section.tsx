export default function EmotesSection() {
  // Placeholder for emotes - user will add actual emote images
  const latestEmotes = [
    { id: 1, name: 'Emote1' },
    { id: 2, name: 'Emote2' },
    { id: 3, name: 'Emote3' },
    { id: 4, name: 'Emote4' },
    { id: 5, name: 'Emote5' },
  ]
  
  const olderEmotes = [
    { id: 6, name: 'Emote6' },
    { id: 7, name: 'Emote7' },
    { id: 8, name: 'Emote8' },
    { id: 9, name: 'Emote9' },
    { id: 10, name: 'Emote10' },
    { id: 11, name: 'Emote11' },
    { id: 12, name: 'Emote12' },
  ]

  return (
    <section className="w-full bg-gray-800 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Emotes du <span className="text-purple-400">Mois</span>
          </h2>

          {/* Latest 5 Emotes - Large Display */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">
              Nouveautés
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {latestEmotes.map((emote) => (
                <div
                  key={emote.id}
                  className="bg-gray-700 rounded-lg p-6 flex items-center justify-center aspect-square hover:bg-purple-900/50 transition-colors border-2 border-purple-500/30"
                >
                  {/* REPLACE THIS DIV WITH: <img src="/emotes/{emote.name}.png" alt={emote.name} className="w-full h-full object-contain" /> */}
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎭</div>
                    <p className="text-gray-400 text-sm">{emote.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Older Emotes - Grid Display */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Collection
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              {olderEmotes.map((emote) => (
                <div
                  key={emote.id}
                  className="bg-gray-700 rounded-lg p-3 flex items-center justify-center aspect-square hover:bg-purple-900/50 transition-colors"
                >
                  {/* REPLACE THIS DIV WITH: <img src="/emotes/{emote.name}.png" alt={emote.name} className="w-full h-full object-contain" /> */}
                  <div className="text-center">
                    <div className="text-3xl">🎭</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-500 text-sm text-center mt-6">
            Ajout dans /public/emotes/
          </p>
        </div>
      </div>
    </section>
  )
}
