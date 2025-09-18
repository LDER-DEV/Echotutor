"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Play, CheckCircle } from "lucide-react"

interface Question {
  id: string
  question: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
  explanation: string
}

interface QuestionsListProps {
  questions: Question[]
  materialId: string
}

export function QuestionsList({ questions, materialId }: QuestionsListProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStartGame = (question: Question) => {
    // This will navigate to the Wordle-style game
    window.location.href = `/game/${materialId}/${question.id}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <span>Generated Questions ({questions.length})</span>
        </h2>
      </div>

      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{question.question}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">Topic: {question.topic}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Button onClick={() => handleStartGame(question)} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Play Wordle Game
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedQuestion(question)
                    setShowAnswer(!showAnswer)
                  }}
                >
                  {selectedQuestion?.id === question.id && showAnswer ? "Hide Answer" : "Show Answer"}
                </Button>
              </div>

              {selectedQuestion?.id === question.id && showAnswer && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Answer:</p>
                      <p className="text-gray-700">{question.answer}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Explanation:</p>
                      <p className="text-gray-700">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
