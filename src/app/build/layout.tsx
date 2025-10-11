import { ResumeProvider } from '@/lib/store';

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <ResumeProvider>{children}</ResumeProvider>;
}
