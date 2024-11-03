// components/TabbedContent.tsx
import { FC, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Transcriptions from "@/components/Transcriptions"
import Chats from "./Chats"
import UploadContent from "@/components/UploadContent"

const TabbedContent: FC = () => {
  const [activeTab, setActiveTab] = useState("transcriptions")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="transcriptions">Transcriptions</TabsTrigger>
        <TabsTrigger value="chats">Chats</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
      </TabsList>

      <TabsContent value="transcriptions">
        <Transcriptions />
      </TabsContent>

      <TabsContent value="chats">
        <Chats />
      </TabsContent>

      <TabsContent value="upload">
        <UploadContent />
      </TabsContent>
    </Tabs>
  )
}

export default TabbedContent
