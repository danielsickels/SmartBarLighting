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
      <body className="min-h-screen flex flex-col">
        <header className="bg-black text-white p-4 text-center">
          <h1 className="text-3xl font-bold">Smart Bar</h1>
        </header>
        <main className="flex-grow p-4">{children}</main>
        <footer className="bg-black text-white p-1 text-center">
          <p>&copy; Reece Bar 2024</p>
        </footer>
      </body>
    </html>
  );
}
