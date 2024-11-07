// components/Transcriptions.tsx
import { FC } from "react"
import { FileAudio, FileVideo, Trash2 } from "lucide-react"
import { useAuth } from '@/context/AuthContext';

// we can pull the File Audio files

type TranscriptionItem = {
  id: string;
  type: 'audio' | 'video';
  title: string;
  date: string;
}

const transcriptionData: TranscriptionItem[] =  [
  {id: "1", type: "audio", title: "Lecture on Data Structures", date: "May 15, 2023"},
  {id: "2", type: "video", title: "Algorithm Analysis Tutorial", date: "May 10, 2023"},  
]
/*

*/

const Transcriptions: FC = () => {
  const { deleteTranscription } = useAuth();

  const handleDelete = async (id: string) => {
    try{
      await deleteTranscription(id)
    }catch(error){
      console.error("Failed to delete transcription: ", error)
    }
  }

  return (
    <div className="space-y-4">
      {transcriptionData.map((item) => (
        <div key={item.id} className="flex items-center gap-4">
          {item.type === 'audio' ? (
            <FileAudio className="text-blue-500" />
          ) : (
            <FileVideo className="text-green-500" />
          )}
          <div className="flex-1">
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-gray-500">Transcribed on {item.date}</p>
          </div>
          <button
            onClick={() => handleDelete(item.id)}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete transcription"
          >
            <Trash2 />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Transcriptions


{/*<div className="space-y-4">
    {
      transcriptionData.map((item, index) => {
        <div key={index} className="flex items-center gap-4">
          {item.type == 'audio' ? (
            <FileAudio className="text-blue-500"/>
          ): (
            <FileAudio className="text-green-500"/>
          )}
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-gray-500">Transcibed on {item.data}</p>
          </div>
        </div>
      })
    }

    <div className="flex items-center gap-4">
      <FileAudio className="text-blue-500" />
      <div>
        <p className="font-medium">Lecture on Data Structures</p>
        <p className="text-sm text-gray-500">Transcribed on May 15, 2023</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <FileVideo className="text-green-500" />
      <div>
        <p className="font-medium">Algorithm Analysis Tutorial</p>
        <p className="text-sm text-gray-500">Transcribed on May 10, 2023</p>
      </div>
    </div>
  </div>*/}