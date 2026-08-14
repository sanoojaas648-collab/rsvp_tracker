import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'MeetupRSVP — Local gatherings, properly hosted',
  description: 'Find local meetups, create your own, and track who is coming.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-ivory text-ink flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-ivory-line mt-16">
            <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-ink/40">
              <span className="tracking-widest uppercase">MeetupRSVP</span>
              <span>Local gatherings, properly hosted.</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
