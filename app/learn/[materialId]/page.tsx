import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { QuestionsList } from "@/components/learn/questions-list"
import { GenerateQuestionsButton } from "@/components/dashboard/generate-questions-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain } from "lucide-react"

interface LearnPageProps {
  params: {
    materialId: string
  }
}

export default async function LearnPage({ params }: LearnPageProps) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the study material
  const { data: material, error: materialError } = await supabase
    .from("study_materials")
    .select("*")
    .eq("id", params.materialId)
    .eq("user_id", user.id)
    .single()

  if (materialError || !material) {
    redirect("/dashboard")
  }

  // Fetch existing questions for this material
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("material_id", params.materialId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{material.title}</h1>
              <p className="text-gray-600">Interactive Learning Session</p>
            </div>
          </div>
        </div>

        {/* Material Content Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>Study Material</span>
            </CardTitle>
            <CardDescription>Review your content before starting the learning session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{material.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        {questions && questions.length > 0 ? (
          <QuestionsList questions={questions} materialId={params.materialId} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions generated yet</h3>
              <p className="text-gray-600 text-center mb-6">
                Generate AI-powered questions from your study material to start learning
              </p>
              <GenerateQuestionsButton
                materialId={params.materialId}
                content={material.content}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
