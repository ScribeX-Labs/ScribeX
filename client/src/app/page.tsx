import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="text-6xl font-bold">Scribe Home</h1>
      <Button asChild>
        {/*<Link href="/login">Login</Link>*/}
        {<Link href="/profile">profile</Link>}
      </Button>
    </div>
  );
}
