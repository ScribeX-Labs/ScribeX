// components/TabbedContent.tsx
import { FC, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Transcriptions from "@/components/Transcriptions"
import Chats from "./Chats"
import UploadContent from "@/components/UploadContent"

//Objects can be stored in keys and pulled from to populate Transcriptions, Chats, and Content Uploaded

/*
ideal content for the transcription, Chats, and Upload:

"transcription": [{}],

"chats": [{}],

"uploads": [{}]

The idea is to iterate through each element in each of these respective keys and pupulate ui with content

*/

const TabbedContent: FC = () => {
  const [activeTab, setActiveTab] = useState("transcriptions")
  //let transcriptions = 

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
