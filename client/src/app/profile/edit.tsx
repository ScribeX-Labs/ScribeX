// components/ProfileCard.tsx
import { FC, useState } from "react";
import Avatar from "./Avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ProfileCardProps {
  initialName: string;
  initialEmail: string;
  initialUniversity: string;
}

const ProfileCard: FC<ProfileCardProps> = ({ initialName, initialEmail, initialUniversity }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [university, setUniversity] = useState(initialUniversity);

  const toggleEditMode = () => setIsEditing(!isEditing);
  const handleSave = () => {
    // Add logic to save changes here (e.g., API call)
    console.log("Profile saved:", { name, email, university });
    setIsEditing(false);
  };

  // Generate initials for the Avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0]?.toUpperCase())
      .join("");
  };

  return (
    <div className="w-full border rounded-md shadow-md">
      <div className="flex items-center gap-4 p-4 border-b border-gray-200">
        <Avatar fallback={getInitials(name)} />
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-gray-600">Computer Science Student</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            readOnly={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">University</label>
          <Input
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            readOnly={!isEditing}
          />
        </div>

        <div className="mt-4">
          {isEditing ? (
            <>
              <Button className="w-full" onClick={handleSave}>Save</Button>
              <Button className="w-full mt-2" variant="secondary" onClick={toggleEditMode}>
                Cancel
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={toggleEditMode}>Edit Profile</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
