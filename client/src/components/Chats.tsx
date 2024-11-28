// components/Chats.tsx
import { FC } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Trash2 } from "lucide-react"
import { useAuth } from '@/context/AuthContext';

type ChatItem = {
  id: string;
  title: string;
  lastActive: string;
}

const chatData: ChatItem[] = [
  /*
  {id: "1", title: "Data Structure Q&A", lastActive: "2 hours ago"},
  {id: "2", title: "Algorithm Analysis Discussion", lastActive: "1 day ago"},
  {id: "3", title: "Algorithm Analysis Discussion", lastActive: "1 day ago"},
  {id: "4", title: "Algorithm Analysis Discussion", lastActive: "1 day ago"},
  {id: "5", title: "Algorithm Analysis Discussion", lastActive: "1 day ago"},
  {id: "6", title: "Algorithm Analysis Discussion", lastActive: "1 day ago"},
  */
]

const Chats: FC = () => {
  const deleteChat = useAuth()

  const handleDelete = async (id: string) => {
    try{
      console.log("Inside the try part of the function")
      //await deleteChat(id);

      console.log("Inside the try part of the function")
    }catch(error){
      console.error("Failed to delete chat: ", error)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Chats</CardTitle>
        <CardDescription>Interact with your transcribed content.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {chatData.map((chat) => (
            <li key={chat.id} className="flex items-center gap-4">
              <MessageSquare className="text-purple-500" />
              <div className="flex-1">
                <p className="font-medium">{chat.title}</p>
                <p className="text-sm text-gray-500">Last active: {chat.lastActive}</p>
              </div>
              <button
                onClick={() => handleDelete(chat.id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Delete chat"
              >
                <Trash2 />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default Chats


{/*<Card>
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
    </Card>*/}