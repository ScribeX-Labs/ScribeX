// app/profile/page.tsx
// app/profile/page.tsx
"use client";
import ProfileCard from "@/components/ProfileCard";
import TabbedContent from "@/components/TabbedContent";
import { FC } from "react";


const profilePage: FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-1/3">
          <ProfileCard name="John Doe" email="john.doe@utdallas.edu" university="University of Texas at Dallas" />
        </aside>
        <main className="w-full md:w-2/3">
          <TabbedContent />
        </main>
      </div>
    </div>
  );
}
/*
"use client";

import ProfileCard from "@/components/ProfileCard";
import TabbedContent from "@/components/TabbedContent";

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-1/3">
          <ProfileCard name="John Doe" email="john.doe@utdallas.edu" university="University of Texas at Dallas" />
        </aside>
        <main className="w-full md:w-2/3">
          <TabbedContent />
        </main>
      </div>
    </div>
  );
}
*/

export default profilePage