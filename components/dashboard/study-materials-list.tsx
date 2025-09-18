"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, BookOpen, File, Play, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { GenerateQuestionsButton } from "./generate-questions-button"

interface StudyMaterial {
  id: string
  title: string
  content: string
  file_type: string
  created_at: string
}

interface StudyMaterialsListProps {
  materials: StudyMaterial[]
}

export function StudyMaterialsList({ materials }: StudyMaterialsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <File className="w-4 h-4" />
      case "text":
        return <FileText className="w-4 h-4" />
      case "notes":
        return <BookOpen className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getFileTypeBadge = (fileType: string) => {
    const variants = {
      pdf: "bg-red-100 text-red-800",
      text: "bg-blue-100 text-blue-800",
      notes: "bg-green-100 text-green-800",
    }
    return variants[fileType as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const { error } = await supabase.from("study_materials").delete().eq("id", id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Failed to delete material:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleStartLearning = (materialId: string) => {
    router.push(`/learn/${materialId}`)
  }

  const handleQuestionsGenerated = (questions: any[]) => {
    // Refresh the page or update state to show generated questions
    router.refresh()
  }

  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No study materials yet</h3>
          <p className="text-gray-600 text-center">
            Upload your first study material to start generating interactive learning content
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Study Materials</h2>
      <div className="space-y-4">
        {materials.map((material) => (
          <Card key={material.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getFileTypeIcon(material.file_type)}</div>
                  <div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Added {new Date(material.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getFileTypeBadge(material.file_type)}>{material.file_type.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {material.content.substring(0, 200)}
                {material.content.length > 200 && "..."}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleStartLearning(material.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
                <GenerateQuestionsButton
                  materialId={material.id}
                  content={material.content}
                  onQuestionsGenerated={handleQuestionsGenerated}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(material.id)}
                  disabled={deletingId === material.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deletingId === material.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
