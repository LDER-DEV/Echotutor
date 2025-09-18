"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, File, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export function UploadMaterialCard() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [fileType, setFileType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      if (file.type === "application/pdf") {
        // For now, we'll ask users to copy-paste PDF content
        // In a full implementation, you'd use a PDF parsing library
        setFileType("pdf")
        setTitle(file.name.replace(".pdf", ""))
        setContent("Please copy and paste the content from your PDF file above.")
      } else if (file.type === "text/plain") {
        const text = await file.text()
        setFileType("text")
        setTitle(file.name.replace(".txt", ""))
        setContent(text)
      } else {
        throw new Error("Unsupported file type. Please upload PDF or TXT files.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !fileType) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: insertError } = await supabase.from("study_materials").insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        file_type: fileType,
      })

      if (insertError) throw insertError

      // Reset form
      setTitle("")
      setContent("")
      setFileType("")

      // Refresh the page to show new material
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save study material")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-blue-600" />
          <span>Upload Study Material</span>
        </CardTitle>
        <CardDescription>Upload your study materials or paste content directly to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Upload File (Optional)</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <File className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> PDF or TXT files
                  </p>
                  <p className="text-xs text-gray-500">PDF, TXT (MAX. 10MB)</p>
                </div>
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Biology Chapter 5 - Cell Structure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileType">Material Type</Label>
              <Select value={fileType} onValueChange={setFileType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select material type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notes">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Study Notes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Text Document</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4" />
                      <span>PDF Content</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Paste your study material content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "Processing..." : "Save Study Material"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
