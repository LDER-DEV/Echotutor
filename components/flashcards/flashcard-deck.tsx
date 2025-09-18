"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, ChevronRight, Brain, BookOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: "easy" | "medium" | "hard"
  interval_days: number
  ease_factor: number
  repetitions: number
  study_materials: {
    title: string
  }
}

interface FlashcardDeckProps {
  flashcards: Flashcard[]
  userId: string
}

export function FlashcardDeck({ flashcards, userId }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const currentCard = flashcards[currentIndex]
  const progress = (currentIndex / flashcards.length) * 100

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

  // Spaced repetition algorithm (SM-2)
  const calculateNextReview = (quality: number, card: Flashcard) => {
    let { interval_days, ease_factor, repetitions } = card

    if (quality >= 3) {
      if (repetitions === 0) {
        interval_days = 1
      } else if (repetitions === 1) {
        interval_days = 6
      } else {
        interval_days = Math.round(interval_days * ease_factor)
      }
      repetitions += 1
    } else {
      repetitions = 0
      interval_days = 1
    }

    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (ease_factor < 1.3) ease_factor = 1.3

    return {
      interval_days,
      ease_factor,
      repetitions,
      next_review: new Date(Date.now() + interval_days * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  const handleResponse = async (quality: number) => {
    const updates = calculateNextReview(quality, currentCard)

    try {
      const { error } = await supabase
        .from("flashcards")
        .update({
          ...updates,
          last_reviewed: new Date().toISOString(),
        })
        .eq("id", currentCard.id)

      if (error) throw error

      // Move to next card or complete
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        setIsCompleted(true)
        toast({
          title: "Session Complete!",
          description: `You've reviewed ${flashcards.length} flashcards. Great job!`,
        })
      }
    } catch (error) {
      console.error("Error updating flashcard:", error)
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setIsCompleted(false)
  }

  if (isCompleted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="w-16 h-16 text-green-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h3>
          <p className="text-gray-600 text-center mb-6">
            You've successfully reviewed {flashcards.length} flashcards. Your progress has been saved.
          </p>
          <Button onClick={resetSession} className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Review Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>
            {currentIndex + 1} of {flashcards.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>{currentCard.study_materials.title}</span>
            </CardTitle>
            <Badge className={getDifficultyColor(currentCard.difficulty)}>{currentCard.difficulty.toUpperCase()}</Badge>
          </div>
          <CardDescription>
            Card {currentIndex + 1} of {flashcards.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{currentCard.front}</h3>
          </div>

          {/* Answer */}
          {showAnswer && (
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-gray-900 mb-2">Answer:</h4>
              <p className="text-gray-700 text-lg">{currentCard.back}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center">
            {!showAnswer ? (
              <Button onClick={() => setShowAnswer(true)} className="bg-blue-600 hover:bg-blue-700">
                Show Answer
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="space-y-4 w-full">
                <p className="text-center text-gray-600 font-medium">How well did you know this?</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleResponse(1)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Again
                    <br />
                    <span className="text-xs">(&lt;1 day)</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleResponse(2)}
                    className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  >
                    Hard
                    <br />
                    <span className="text-xs">(1 day)</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleResponse(3)}
                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Good
                    <br />
                    <span className="text-xs">(3 days)</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleResponse(4)}
                    className="text-green-600 hover:bg-green-50 hover:text-green-700"
                  >
                    Easy
                    <br />
                    <span className="text-xs">(1 week)</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
