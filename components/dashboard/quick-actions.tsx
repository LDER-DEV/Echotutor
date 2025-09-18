"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Upload, Clock, BookOpen } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  dueFlashcards: number
}

export function QuickActions({ dueFlashcards }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>Jump into your learning activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/flashcards" className="block">
          <Button className="w-full justify-start" variant={dueFlashcards > 0 ? "default" : "outline"}>
            <Clock className="w-4 h-4 mr-2" />
            Review Flashcards
            {dueFlashcards > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{dueFlashcards}</span>
            )}
          </Button>
        </Link>

        <Button
          className="w-full justify-start bg-transparent"
          variant="outline"
          onClick={() => {
            document.querySelector('input[type="file"]')?.click()
          }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Material
        </Button>

        <Link href="/dashboard" className="block">
          <Button className="w-full justify-start bg-transparent" variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Materials
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
