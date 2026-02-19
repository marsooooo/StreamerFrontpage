import LolRankWidget from "@/components/lol-rank-widget"

export default async function LolWidgetPage({ params }: { params: Promise<{ account: string }> }) {
  const { account } = await params
  const index = parseInt(account, 10)

  if (isNaN(index) || index < 1) {
    return (
      <div className="text-red-400 text-sm p-2">
        Index invalide — utilisez /widgets/lol/1, /widgets/lol/2, etc.
      </div>
    )
  }

  return (
    <div className="p-2">
      <LolRankWidget accountIndex={index} />
    </div>
  )
}
