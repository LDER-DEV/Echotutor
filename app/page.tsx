import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BookOpen, Target, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">EchoTutor</span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-blue-700 hover:text-blue-900">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-6 text-balance">
            Transform Your Study Materials into Interactive Learning
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-pretty">
            Upload your notes, PDFs, or study materials and let AI create engaging Wordle-style games and spaced
            repetition flashcards to boost your learning retention.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Start Learning Now
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Upload Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Upload PDFs, text files, or paste your study notes directly</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">AI Question Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>GPT-4 analyzes your content and creates targeted practice questions</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Wordle-Style Games</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Engage with your material through fun, interactive word games</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Spaced Repetition</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Completed games become flashcards with optimized review scheduling</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-blue-900">Upload & Analyze</h3>
              <p className="text-gray-600">
                Upload your study materials and let our AI extract key concepts and generate questions
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-blue-900">Play & Learn</h3>
              <p className="text-gray-600">
                Engage with Wordle-style games that make learning your material fun and memorable
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-blue-900">Review & Retain</h3>
              <p className="text-gray-600">
                Completed games become flashcards with spaced repetition for long-term retention
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-6 h-6" />
            <span className="text-xl font-bold">EchoTutor</span>
          </div>
          <p className="text-blue-200">Transforming the way you learn with AI-powered interactive education</p>
        </div>
      </footer>
    </div>
  )
}
