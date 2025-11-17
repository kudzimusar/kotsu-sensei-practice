import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6 min-h-[44px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              By accessing and using this driving test preparation application, you agree to be bound by these
              Terms of Service and all applicable laws and regulations. If you do not agree with any of these
              terms, you are prohibited from using this application.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily use this application for personal, non-commercial study
              purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 text-muted-foreground space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained in the application</li>
              <li>Remove any copyright or proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              You are responsible for maintaining the confidentiality of your account and password. You agree
              to accept responsibility for all activities that occur under your account. You must notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              The materials and information provided in this application are for educational purposes only.
              While we strive to provide accurate and up-to-date content, we make no warranties about the
              completeness, reliability, or accuracy of this information. Your use of any information or
              materials in this application is entirely at your own risk.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Content Accuracy</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              We regularly update our question bank and study materials. However, driving regulations may change,
              and we recommend verifying critical information with official sources before taking your actual
              driving test.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Limitations of Liability</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              In no event shall we or our suppliers be liable for any damages (including, without limitation,
              damages for loss of data or profit, or due to business interruption) arising out of the use or
              inability to use this application.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 text-muted-foreground space-y-2">
              <li>Use the application for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any portion of the application</li>
              <li>Interfere with or disrupt the application or servers</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems to access the application</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              All content included in this application, such as text, graphics, logos, images, and software,
              is our property or the property of our content suppliers and is protected by copyright and
              intellectual property laws.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Termination</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              We may terminate or suspend your account and access to the application immediately, without prior
              notice or liability, for any reason, including if you breach these Terms of Service.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              We reserve the right to modify these terms at any time. We will notify users of any material
              changes. Your continued use of the application after such modifications constitutes your
              acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              These terms shall be governed by and construed in accordance with applicable laws, without regard
              to conflict of law provisions.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Subscription Terms</h2>
            <div className="text-muted-foreground leading-relaxed max-w-prose space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Subscription Plans</h3>
                <p>We offer the following subscription plans:</p>
                <ul className="list-disc pl-5 sm:pl-6 mt-2 space-y-1">
                  <li><strong>Monthly:</strong> ¥980 per month, billed monthly</li>
                  <li><strong>Quarterly:</strong> ¥1,500 per 3 months, billed every 3 months (Save 23%)</li>
                  <li><strong>Annual:</strong> ¥8,800 per year, billed annually (Save 25%)</li>
                  <li><strong>9-Month Access:</strong> ¥2,400 one-time payment for 9 months access (standard driving license period)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Free Trial</h3>
                <p>All subscription plans include a 7-day free trial. You will not be charged during the trial period. You may cancel your subscription at any time during the trial period without being charged.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Service Duration</h3>
                <p>Our service is designed to support students through the standard 9-month driving license preparation period. The 9-Month Access plan provides access for exactly 9 months from the date of purchase. Monthly, Quarterly, and Annual plans will continue until cancelled.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cancellation</h3>
                <p>You may cancel your subscription at any time through your account settings or by contacting us. Cancellation will take effect at the end of your current billing period. You will continue to have access to premium features until the end of the paid period. No refunds will be provided for the current billing period.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Payment Methods</h3>
                <p>We accept credit/debit cards, PayPal, PayPay (Japan), and convenience store payments (Konbini - for one-time payments only). All payments are processed securely through Stripe.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Premium Features</h3>
                <p>Premium subscriptions include:</p>
                <ul className="list-disc pl-5 sm:pl-6 mt-2 space-y-1">
                  <li>Unlimited AI-generated questions</li>
                  <li>Personalized study plans</li>
                  <li>Advanced progress analytics</li>
                  <li>Export & print study guides</li>
                  <li>Ad-free experience</li>
                  <li>Priority support</li>
                  <li>One-on-one instructor sessions (Coming soon)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: <a href="mailto:kudzimusar@gmail.com" className="text-primary hover:underline">kudzimusar@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
