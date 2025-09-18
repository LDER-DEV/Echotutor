import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StudyMaterialsList } from "@/components/dashboard/study-materials-list"
import { UploadMaterialCard } from "@/components/dashboard/upload-material-card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's study materials
  const { data: studyMaterials } = await supabase
    .from("study_materials")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  // Get user's flashcards for stats
  const { data: flashcards } = await supabase.from("flashcards").select("*").eq("user_id", data.user.id)

  // Get user's game sessions for stats
  const { data: gameSessions } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get questions count
  const { data: questions } = await supabase.from("questions").select("id").eq("user_id", data.user.id)

  // Calculate due flashcards
  const dueFlashcards = flashcards?.filter((card) => new Date(card.next_review) <= new Date()) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={data.user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and continue your interactive learning journey</p>
        </div>

        <DashboardStats
          totalMaterials={studyMaterials?.length || 0}
          totalQuestions={questions?.length || 0}
          totalFlashcards={flashcards?.length || 0}
          dueFlashcards={dueFlashcards.length}
          gamesPlayed={gameSessions?.length || 0}
          gamesWon={gameSessions?.filter((session) => session.completed).length || 0}
        />

        <div className="grid lg:grid-cols-4 gap-8 mb-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <UploadMaterialCard />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions dueFlashcards={dueFlashcards.length} />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity gameSessions={gameSessions || []} />
          </div>
        </div>

        {/* Study Materials List */}
        <div className="mb-8">
          <StudyMaterialsList materials={studyMaterials || []} />
        </div>
      </main>
    </div>
  )
}
