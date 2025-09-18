"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, RotateCcw, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  question: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
  explanation: string
  study_materials: {
    title: string
    content: string
  }
}

interface WordleGameProps {
  question: Question
  materialId: string
  userId: string
}

type LetterState = "correct" | "present" | "absent" | "empty"

interface LetterTile {
  letter: string
  state: LetterState
}

export function WordleGame({ question, materialId, userId }: WordleGameProps) {
  const [currentGuess, setCurrentGuess] = useState("")
  const [guesses, setGuesses] = useState<LetterTile[][]>([])
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [currentRow, setCurrentRow] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const maxGuesses = 6

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Normalize answer (remove spaces, convert to uppercase)
  const targetAnswer = question.answer.replace(/\s+/g, "").toUpperCase()
  const answerLength = targetAnswer.length

  // Initialize empty grid
  useEffect(() => {
    const emptyGrid = Array(maxGuesses)
      .fill(null)
      .map(() =>
        Array(answerLength)
          .fill(null)
          .map(() => ({ letter: "", state: "empty" as LetterState })),
      )
    setGuesses(emptyGrid)
  }, [answerLength])

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

  const checkGuess = (guess: string): LetterTile[] => {
    const guessUpper = guess.toUpperCase()
    const result: LetterTile[] = []
    const answerArray = targetAnswer.split("")
    const guessArray = guessUpper.split("")

    // First pass: mark correct positions
    const answerCounts: { [key: string]: number } = {}
    answerArray.forEach((letter) => {
      answerCounts[letter] = (answerCounts[letter] || 0) + 1
    })

    // Check each letter
    guessArray.forEach((letter, index) => {
      if (letter === answerArray[index]) {
        result[index] = { letter, state: "correct" }
        answerCounts[letter]--
      } else {
        result[index] = { letter, state: "absent" }
      }
    })

    // Second pass: mark present letters
    result.forEach((tile, index) => {
      if (tile.state === "absent" && answerCounts[tile.letter] > 0) {
        result[index] = { letter: tile.letter, state: "present" }
        answerCounts[tile.letter]--
      }
    })

    return result
  }

  const handleSubmitGuess = async () => {
    if (currentGuess.length !== answerLength) {
      toast({
        title: "Invalid guess",
        description: `Guess must be ${answerLength} letters long`,
        variant: "destructive",
      })
      return
    }

    const guessResult = checkGuess(currentGuess)
    const newGuesses = [...guesses]
    newGuesses[currentRow] = guessResult
    setGuesses(newGuesses)

    // Check if won
    if (currentGuess.toUpperCase() === targetAnswer) {
      setGameState("won")
      await saveGameSession(true, currentRow + 1)
      toast({
        title: "Congratulations!",
        description: "You got it right! This will be added to your flashcards.",
      })
    } else if (currentRow >= maxGuesses - 1) {
      setGameState("lost")
      await saveGameSession(false, maxGuesses)
      toast({
        title: "Game Over",
        description: `The answer was: ${question.answer}`,
        variant: "destructive",
      })
    } else {
      setCurrentRow(currentRow + 1)
    }

    setCurrentGuess("")
  }

  const saveGameSession = async (completed: boolean, attempts: number) => {
    try {
      const { error } = await supabase.from("game_sessions").insert({
        user_id: userId,
        question_id: question.id,
        material_id: materialId,
        completed,
        attempts_used: attempts,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Failed to save game session:", error)
      }

      // If completed, create flashcard
      if (completed) {
        await supabase.from("flashcards").insert({
          user_id: userId,
          question_id: question.id,
          material_id: materialId,
          front: question.question,
          back: question.answer,
          difficulty: question.difficulty,
          next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          created_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error saving game session:", error)
    }
  }

  const handleKeyPress = (letter: string) => {
    if (gameState !== "playing") return

    if (letter === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1))
    } else if (letter === "ENTER") {
      handleSubmitGuess()
    } else if (currentGuess.length < answerLength && /^[A-Z]$/.test(letter)) {
      setCurrentGuess((prev) => prev + letter)
    }
  }

  const resetGame = () => {
    setCurrentGuess("")
    setCurrentRow(0)
    setGameState("playing")
    setShowHint(false)
    const emptyGrid = Array(maxGuesses)
      .fill(null)
      .map(() =>
        Array(answerLength)
          .fill(null)
          .map(() => ({ letter: "", state: "empty" as LetterState })),
      )
    setGuesses(emptyGrid)
  }

  const getTileColor = (state: LetterState) => {
    switch (state) {
      case "correct":
        return "bg-green-500 text-white border-green-500"
      case "present":
        return "bg-yellow-500 text-white border-yellow-500"
      case "absent":
        return "bg-gray-500 text-white border-gray-500"
      default:
        return "bg-white border-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>Question</span>
            </CardTitle>
            <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty.toUpperCase()}</Badge>
          </div>
          <CardDescription>Topic: {question.topic}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-gray-900 mb-4">{question.question}</p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
            {gameState !== "playing" && (
              <Button onClick={resetGame} size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            )}
          </div>
          {showHint && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>Hint:</strong> The answer has {answerLength} letters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Grid */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 mb-6">
            {guesses.map((guess, rowIndex) => (
              <div key={rowIndex} className="flex justify-center space-x-2">
                {guess.map((tile, colIndex) => (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 border-2 rounded flex items-center justify-center text-lg font-bold transition-colors ${getTileColor(tile.state)}`}
                  >
                    {rowIndex === currentRow && colIndex < currentGuess.length
                      ? currentGuess[colIndex].toUpperCase()
                      : tile.letter}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Input and Submit */}
          {gameState === "playing" && (
            <div className="flex justify-center space-x-2">
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmitGuess()
                  else if (e.key === "Backspace")
                    return // Let default behavior handle it
                  else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
                    // Let default behavior handle it, but ensure uppercase
                    setTimeout(() => setCurrentGuess((prev) => prev.toUpperCase()), 0)
                  }
                }}
                maxLength={answerLength}
                className="px-3 py-2 border rounded-md text-center uppercase font-mono text-lg"
                placeholder={`Enter ${answerLength} letters`}
                autoFocus
              />
              <Button onClick={handleSubmitGuess} className="bg-blue-600 hover:bg-blue-700">
                Submit
              </Button>
            </div>
          )}

          {/* Game Over Messages */}
          {gameState === "won" && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-green-800">Congratulations!</h3>
              <p className="text-green-700">You solved it in {currentRow + 1} attempts!</p>
              <p className="text-sm text-green-600 mt-2">
                This question has been added to your flashcards for spaced repetition.
              </p>
            </div>
          )}

          {gameState === "lost" && (
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-red-800">Game Over</h3>
              <p className="text-red-700">
                The answer was: <strong>{question.answer}</strong>
              </p>
              <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
