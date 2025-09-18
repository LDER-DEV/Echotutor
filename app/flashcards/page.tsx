import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FlashcardDeck } from "@/components/flashcards/flashcard-deck"
import { FlashcardStats } from "@/components/flashcards/flashcard-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, BookOpen } from "lucide-react"

export default async function FlashcardsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch flashcards due for review
  const { data: dueFlashcards, error: dueError } = await supabase
    .from("flashcards")
    .select(`
      *,
      study_materials (
        title
      )
    `)
    .eq("user_id", user.id)
    .lte("next_review", new Date().toISOString())
    .order("next_review", { ascending: true })

  // Fetch all flashcards for stats
  const { data: allFlashcards, error: allError } = await supabase.from("flashcards").select("*").eq("user_id", user.id)

  if (dueError || allError) {
    console.error("Error fetching flashcards:", dueError || allError)
  }

  const flashcardsDue = dueFlashcards || []
  const totalFlashcards = allFlashcards || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
              <p className="text-gray-600">Review your knowledge with spaced repetition</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <FlashcardStats
          totalCards={totalFlashcards.length}
          dueCards={flashcardsDue.length}
          completedToday={
            totalFlashcards.filter((card) => {
              const today = new Date().toDateString()
              const lastReview = card.last_reviewed ? new Date(card.last_reviewed).toDateString() : null
              return lastReview === today
            }).length
          }
        />

        {/* Flashcard Deck */}
        {flashcardsDue.length > 0 ? (
          <FlashcardDeck flashcards={flashcardsDue} userId={user.id} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No flashcards due for review</h3>
              <p className="text-gray-600 text-center">
                {totalFlashcards.length === 0
                  ? "Complete some Wordle games to create your first flashcards!"
                  : "Great job! Check back later for more reviews."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
