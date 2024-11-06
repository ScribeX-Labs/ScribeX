// components/ProfileCard.tsx
import { FC } from "react"
import Avatar from "./Avatar"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface ProfileCardProps {
  name: string
  email: string
  university: string
}

const ProfileCard: FC<ProfileCardProps> = ({ name, email, university }) => (
  <div className="w-full">
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <Avatar fallback={() => {
    let initials = "";
    const words = name.trim().split(" ");
    
    words.forEach(word => {
        if (word.length > 0) {
            initials += word[0].toUpperCase();
        }
    });
    console.log(initials)
    return initials;
}}/>
      <div>
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-gray-600">Computer Science Student</p>
      </div>
    </div>
    <div className="p-4 space-y-4">
      <div>
        <label>Email</label>
        <Input value={email} readOnly />
      </div>
      <div>
        <label>University</label>
        <Input value={university} readOnly />
      </div>
      <Button className="w-full mt-4" href="/edit">Edit Profile</Button>
    </div>
  </div>
)

export default ProfileCard
