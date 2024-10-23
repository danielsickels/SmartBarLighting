import { ReactNode } from 'react';
import './globals.css'; // Import global styles including Tailwind CSS

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Bottle Management App</title>
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="bg-blue-600 text-white p-4 text-center">
          <h1 className="text-3xl font-bold">Bottle Management App</h1>
        </header>
        <main className="flex-grow p-4">{children}</main>
        <footer className="bg-blue-600 text-white p-4 text-center">
          <p>&copy; 2024 Bottle App</p>
        </footer>
      </body>
    </html>
  );
}
