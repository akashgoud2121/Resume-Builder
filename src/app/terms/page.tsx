
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import Footer from '@/components/footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">Resume Builder</span>
        </Link>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </header>
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto max-w-4xl rounded-lg bg-background p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mb-6 text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-blue max-w-none text-foreground">
            <p>
              Welcome to the Cognisys AI Resume Builder. These Terms and Conditions ("Terms") govern your use of our website and services (the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">1. Your Account</h2>
            <p>
              To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">2. Data Storage and User Experience</h2>
            <p>
              To provide a seamless and reliable user experience, the resume data you create is securely saved to your account profile in our cloud database.
            </p>
            <ul>
              <li>
                <strong>Cloud Storage:</strong> By saving your data to a secure database, we ensure that you can access and edit your resume from any device, at any time, simply by logging into your account. This prevents the frustrating experience of losing your work if you switch browsers, clear your cache, or use a different computer.
              </li>
              <li>
                <strong>Data Portability:</strong> This feature is designed for your convenience, allowing you to pick up where you left off, no matter where you are. Your resume is tied to your account, not to a single device.
              </li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold">3. Use of AI Features</h2>
            <p>
              Our Service includes AI-powered features to assist you in generating content for your resume.
            </p>
            <ul>
              <li>
                <strong>API Key:</strong> To use the AI features, you must provide your own Google AI API key. This key is stored exclusively in your browser's local storage and is never sent to our servers. All AI-related requests are made directly from your browser to the Google AI API.
              </li>
              <li>
                <strong>Responsibility:</strong> You are responsible for the content you generate and use. The AI-generated suggestions are provided as a starting point, and you should review and edit them to ensure accuracy and professionalism. Cognisys AI is not liable for any inaccuracies, errors, or consequences arising from the use of AI-generated content.
              </li>
            </ul>

            <h2 className="mt-8 text-2xl font-semibold">4. User Conduct</h2>
            <p>
              You agree not to use the Service for any unlawful purpose or to engage in any activity that could damage, disable, or impair the Service. You are solely responsible for the content of your resume and your interactions with the Service.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">5. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content created by you), features, and functionality are and will remain the exclusive property of Cognisys AI and its licensors. The content you create for your resume remains your property.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">6. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the Terms.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">7. Limitation of Liability</h2>
            <p>
              In no event shall Cognisys AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
            
            <h2 className="mt-8 text-2xl font-semibold">8. Disclaimer</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>

            <h2 className="mt-8 text-2xl font-semibold">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us through the links provided on our website.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
