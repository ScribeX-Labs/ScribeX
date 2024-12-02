import React from 'react';
import ScribeLogo from './ScribeLogo';
import { ModeToggle } from './theme-toggle';

function Navbar() {
  return (
    <header className="bg-primary py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <ScribeLogo className="h-8 w-8 text-secondary" />
          <h1 className="text-3xl font-bold text-secondary">Scribe</h1>
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}

export default Navbar;
