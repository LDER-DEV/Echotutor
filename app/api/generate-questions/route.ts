import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"

const questionSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().describe("The question text"),
        answer: z.string().describe("The correct answer"),
        difficulty: z.enum(["easy", "medium", "hard"]).describe("Question difficulty level"),
        topic: z.string().describe("The main topic or concept this question covers"),
        explanation: z.string().describe("Brief explanation of why this answer is correct"),
      }),
    )
    .min(5)
    .max(15)
    .describe("Array of generated questions"),
})

export async function POST(req: Request) {
  try {
    const { materialId, content, questionCount = 10 } = await req.json()

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: questionSchema,
      prompt: `
        You are an expert educational content creator. Generate ${questionCount} high-quality study questions based on the following content.
        
        Create questions that:
        - Test understanding of key concepts
        - Vary in difficulty (mix of easy, medium, hard)
        - Cover different aspects of the material
        - Have clear, concise answers
        - Include helpful explanations
        
        Content to analyze:
        ${content}
        
        Generate exactly ${questionCount} questions with a good mix of difficulty levels.
      `,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    const questionsToInsert = object.questions.map((q) => ({
      user_id: user.id,
      material_id: materialId,
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty,
      topic: q.topic,
      explanation: q.explanation,
      created_at: new Date().toISOString(),
    }))

    const { data: insertedQuestions, error } = await supabase.from("questions").insert(questionsToInsert).select()

    if (error) {
      console.error("Database error:", error)
      return Response.json({ error: "Failed to save questions" }, { status: 500 })
    }

    return Response.json({
      questions: insertedQuestions,
      count: insertedQuestions.length,
    })
  } catch (error) {
    console.error("Question generation error:", error)
    return Response.json(
      {
        error: "Failed to generate questions",
      },
      { status: 500 },
    )
  }
}
