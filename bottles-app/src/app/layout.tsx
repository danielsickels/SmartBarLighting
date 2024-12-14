import { ReactNode } from "react";
import "./globals.css";

interface LayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Smart Bar",
  description: "An intuitive app to manage bottles and recipes for your coctails!",
};

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Smart Bar</title>
      </head>
      <body className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        {/* <header className="bg-black text-white p-4 text-center fixed top-0 left-0 right-0 z-10">
          <h1 className="text-3xl font-bold">Smart Bar</h1>
        </header> */}

        {/* Main content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        {/* <footer className="bg-black text-white p-2 text-center fixed bottom-0 left-0 right-0 z-10">
          <p>&copy; Reece Bar 2025</p>
        </footer> */}
      </body>
    </html>
  );
}
