'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, LogOut, Search, UploadCloud, User } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { useAuth } from '@/context/auth-context';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="press hidden h-8 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search</span>
        <kbd className="ml-2 rounded border border-border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search or jump to…" />
          <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Go to">
            <CommandItem onSelect={() => go(() => router.push('/dashboard'))}>
              <LayoutGrid />
              Library
            </CommandItem>
            <CommandItem onSelect={() => go(() => router.push('/dashboard/upload'))}>
              <UploadCloud />
              Upload
              <CommandShortcut>new</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => go(() => router.push('/dashboard/profile'))}>
              <User />
              Profile
            </CommandItem>
          </CommandGroup>
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => go(logout)}>
                <LogOut />
                Sign out
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
