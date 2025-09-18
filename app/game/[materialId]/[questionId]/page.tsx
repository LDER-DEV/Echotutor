import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WordleGame } from "@/components/game/wordle-game"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface GamePageProps {
  params: {
    materialId: string
    questionId: string
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the question and material
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select(`
      *,
      study_materials (
        title,
        content
      )
    `)
    .eq("id", params.questionId)
    .eq("user_id", user.id)
    .single()

  if (questionError || !question) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/learn/${params.materialId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Questions
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EchoTutor Game</h1>
            <p className="text-gray-600">Guess the answer letter by letter!</p>
          </div>
        </div>

        {/* Game Component */}
        <WordleGame question={question} materialId={params.materialId} userId={user.id} />
      </div>
    </div>
  )
}
