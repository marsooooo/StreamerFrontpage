import LolRankOnlyWidget from "@/components/lol-rank-only-widget"

export default async function LolRankPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const index = parseInt(id, 10)

  if (isNaN(index) || index < 1) {
    return (
      <div className="text-red-400 text-sm p-2">
        Index invalide — utilisez /widgets/lol/rank/1, /widgets/lol/rank/2, etc.
      </div>
    )
  }

  return (
    <div className="p-2">
      <LolRankOnlyWidget accountIndex={index} />
    </div>
  )
}
