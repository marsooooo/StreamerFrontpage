import LolHistoryWidget from "@/components/lol-history-widget"

export default async function LolHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const index = parseInt(id, 10)

  if (isNaN(index) || index < 1) {
    return (
      <div className="text-red-400 text-sm p-2">
        Index invalide — utilisez /widgets/lol/history/1, /widgets/lol/history/2, etc.
      </div>
    )
  }

  return (
    <div className="p-2">
      <LolHistoryWidget accountIndex={index} />
    </div>
  )
}
