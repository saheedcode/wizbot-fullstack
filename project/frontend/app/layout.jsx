import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SavedJobsProvider } from '@/context/SavedJobsContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { SchedulerProvider } from '@/context/SchedulerContext';
import { InterviewPrepProvider } from '@/context/InterviewPrepContext';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'WizJobAI',
  description: 'Your AI-powered job search assistant — find, tailor, and apply faster.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <NotificationsProvider>
            <SchedulerProvider>
              <InterviewPrepProvider>
                <SavedJobsProvider>{children}</SavedJobsProvider>
              </InterviewPrepProvider>
            </SchedulerProvider>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
