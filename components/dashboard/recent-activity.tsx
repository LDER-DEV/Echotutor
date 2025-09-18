import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Trophy, XCircle, Clock } from "lucide-react"

interface GameSession {
  id: string
  completed: boolean
  attempts_used: number
  created_at: string
}

interface RecentActivityProps {
  gameSessions: GameSession[]
}

export function RecentActivity({ gameSessions }: RecentActivityProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>Your latest learning sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {gameSessions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400">Start playing games to see your progress here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gameSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {session.completed ? (
                    <Trophy className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{session.completed ? "Game Won" : "Game Lost"}</p>
                    <p className="text-xs text-gray-500">
                      {session.attempts_used} attempts • {formatTimeAgo(session.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant={session.completed ? "default" : "secondary"}>
                  {session.completed ? "Success" : "Try Again"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
