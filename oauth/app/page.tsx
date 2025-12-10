export default function Home() {

  const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/twitch/callback`
  const scopes = "channel:read:redemptions channel:manage:redemptions"

  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_BACKEND_URL}/api/twitch/callback&response_type=code&scope=${encodeURIComponent(scopes)}`

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <a
        href={authUrl}
        className="bg-[#9146FF] hover:bg-[#7c3aed] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Connect with Twitch
      </a>
    </main>
  )
}
