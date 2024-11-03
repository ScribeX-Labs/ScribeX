// components/Chats.tsx
import { FC } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

const Chats: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Chats</CardTitle>
        <CardDescription>Interact with your transcribed content.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-center gap-4">
            <MessageSquare className="text-purple-500" />
            <div>
              <p className="font-medium">Data Structures Q&A</p>
              <p className="text-sm text-gray-500">Last active: 2 hours ago</p>
            </div>
          </li>
          <li className="flex items-center gap-4">
            <MessageSquare className="text-purple-500" />
            <div>
              <p className="font-medium">Algorithm Analysis Discussion</p>
              <p className="text-sm text-gray-500">Last active: 1 day ago</p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

export default Chats
