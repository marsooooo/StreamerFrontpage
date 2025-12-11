export default function LegalSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8 space-y-8 text-gray-300">
        <h2 className="text-2xl font-bold text-white text-center mb-8">APIs et Services tiers utilisés</h2>

        <p className="text-sm leading-relaxed">
          Ce site utilise plusieurs APIs externes pour récupérer et afficher des informations publiques concernant des
          créateurs de contenu. Les données affichées proviennent exclusivement de sources publiques ou accessibles via
          les APIs officielles, conformément aux conditions d&apos;utilisation de chaque service.
        </p>

        {/* Riot Games */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">1. API Riot Games</h3>
          <p className="text-sm leading-relaxed">
            Ce site n&apos;est pas affilié à Riot Games, Inc.
            <br />
            Les informations provenant de Riot Games sont fournies grâce à l&apos;API officielle Riot Games.
          </p>
          <div className="text-sm space-y-2">
            <p>
              <strong className="text-white">Propriété intellectuelle :</strong>
              <br />
              Riot Games, League of Legends et tous les noms associés sont des marques déposées de Riot Games, Inc.
            </p>
            <p>
              <strong className="text-white">Conformité :</strong>
              <br />
              L&apos;utilisation de l&apos;API respecte les Riot Developer Terms, les Policies, ainsi que les
              limitations de données imposées par Riot.
            </p>
            <p>
              <strong className="text-white">Fichier de vérification :</strong>
              <br />
              Le fichier riot.txt utilisé pour valider la propriété du domaine est accessible à l&apos;adresse :{" "}
              <a
                href="https://peaxy.fr/riot.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                https://peaxy.fr/riot.txt
              </a>
            </p>
          </div>
        </div>

        {/* Twitch */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">2. Twitch API &amp; TwitchTracker (API tierce)</h3>
          <p className="text-sm leading-relaxed">Les données utilisées proviennent de :</p>
          <ul className="text-sm list-disc list-inside ml-4 space-y-1">
            <li>Twitch API (officielle)</li>
            <li>Wizebot API (non affilié à twitch)</li>
          </ul>
          <p className="text-sm">
            <strong className="text-white">Droits :</strong>
            <br />
            Twitch est une marque déposée de Twitch Interactive, Inc. Les données obtenues respectent les conditions
            d&apos;utilisation des APIs respectives.
          </p>
        </div>

        {/* Google */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">3. Google APIs (YouTube / Docs)</h3>
          <p className="text-sm leading-relaxed">
            Certaines données peuvent être obtenues via les services de Google, notamment pour :
          </p>
          <ul className="text-sm list-disc list-inside ml-4 space-y-1">
            <li>les informations de chaînes youtube publiques</li>
            <li>d&apos;autres données accessibles via les APIs Google</li>
          </ul>
          <div className="text-sm space-y-2">
            <p>
              <strong className="text-white">Marques et droits :</strong>
              <br />
              Google et YouTube sont des marques déposées de Google LLC.
            </p>
            <p>
              <strong className="text-white">Conformité :</strong>
              <br />
              Les données respectent les Google API Services User Data Policy, y compris les restrictions liées à la
              protection et à l&apos;utilisation des données.
            </p>
          </div>
        </div>

        {/* Responsabilité */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">4. Responsabilité et données affichées</h3>
          <p className="text-sm leading-relaxed">Toutes les données affichées :</p>
          <ul className="text-sm list-disc list-inside ml-4 space-y-1">
            <li>sont publiques ou accessibles via autorisation des APIs</li>
            <li>ne sont pas modifiées, falsifiées ou stockées illégalement</li>
            <li>sont mises à jour automatiquement selon les quotas des APIs</li>
            <li>peuvent expirer ou ne plus être disponibles en cas de changement des services tiers</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">Le site n&apos;est pas responsable :</p>
          <ul className="text-sm list-disc list-inside ml-4 space-y-1">
            <li>des erreurs, interruptions ou modifications de ces services tiers</li>
            <li>de la disponibilité permanente de ces données</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">5. Contact</h3>
          <p className="text-sm leading-relaxed">
            Pour toute question concernant les données externes ou les APIs utilisées, vous pouvez contacter :{" "}
            <a href="mailto:marso.tison@gmail.com" className="text-purple-400 hover:text-purple-300 underline">
              marso.tison@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
