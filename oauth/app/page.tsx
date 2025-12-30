"use client"

const SCOPES = ["channel:read:redemptions", "channel:manage:redemptions", "bits:read", "channel:read:subscriptions"]

export default function Home() {
  const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/twitch/callback`
  const scopeString = SCOPES.join(" ")

  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopeString)}`

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4 gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Twitch OAuth Helper</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Connectez-vous avec le compte <strong>broadcaster</strong> pour autoriser l&apos;accès aux données de la
          chaîne.
        </p>
      </div>

      <a
        href={authUrl}
        className="bg-[#9146FF] hover:bg-[#7c3aed] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Se connecter avec Twitch
      </a>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p className="font-medium">Permissions requises :</p>
        <ul className="space-y-0.5">
          {SCOPES.map((scope) => (
            <li key={scope} className="font-mono">
              {scope}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
