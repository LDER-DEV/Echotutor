"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GenerateQuestionsButtonProps {
  materialId: string
  content: string
  onQuestionsGenerated: (questions: any[]) => void
}

export function GenerateQuestionsButton({ materialId, content, onQuestionsGenerated }: GenerateQuestionsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateQuestions = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materialId,
          content,
          questionCount: 10,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate questions")
      }

      const data = await response.json()

      toast({
        title: "Questions Generated!",
        description: `Successfully created ${data.count} study questions.`,
      })

      onQuestionsGenerated(data.questions)
    } catch (error) {
      console.error("Error generating questions:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerateQuestions} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Questions
        </>
      )}
    </Button>
  )
}
