// bottles-app/src/app/layout.tsx

import { ReactNode } from 'react';
import './globals.css'; // Import global styles including Tailwind CSS

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Smart Bar</title>
      </head>
      <body className="h-screen flex flex-col overflow-hidden">
        {/* Fixed header */}
        <header className="bg-black text-white p-4 text-center fixed top-0 left-0 right-0 z-10">
          <h1 className="text-3xl font-bold">Smart Bar</h1>
        </header>

        {/* Main content area with scrolling */}
        <main className="flex-grow overflow-y-auto pt-20 pb-12">
          {children}
        </main>

        {/* Fixed footer */}
        <footer className="bg-black text-white p-1 text-center fixed bottom-0 left-0 right-0 z-10">
          <p>&copy; Reece Bar 2024</p>
        </footer>
      </body>
    </html>
  );
}
