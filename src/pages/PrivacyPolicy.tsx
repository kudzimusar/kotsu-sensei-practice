import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              We respect your privacy and are committed to protecting your personal data. This privacy policy
              explains how we collect, use, and safeguard your information when you use our driving test
              preparation application.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Information We Collect</h2>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Personal Information</h3>
            <ul className="list-disc pl-5 sm:pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Name and email address when you create an account</li>
              <li>Profile information including gender (optional)</li>
              <li>Authentication credentials</li>
            </ul>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Usage Data</h3>
            <ul className="list-disc pl-5 sm:pl-6 text-muted-foreground space-y-2">
              <li>Quiz and test performance data</li>
              <li>Study progress and statistics</li>
              <li>App usage patterns and preferences</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">How We Use Your Information</h2>
            <ul className="list-disc pl-5 sm:pl-6 text-muted-foreground space-y-2">
              <li>To provide and maintain our services</li>
              <li>To personalize your learning experience</li>
              <li>To track your progress and provide performance analytics</li>
              <li>To communicate with you about updates and support</li>
              <li>To improve our application and develop new features</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              We implement appropriate technical and organizational measures to protect your personal data
              against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely
              using industry-standard encryption and security protocols.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              We do not sell, trade, or rent your personal information to third parties. We may share data with
              service providers who assist us in operating our application, but only to the extent necessary
              and under strict confidentiality agreements.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Your Rights</h2>
            <ul className="list-disc pl-5 sm:pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              Our service is intended for users who are preparing for driving tests. We do not knowingly collect
              personal information from children under 13 without parental consent.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              We may update this privacy policy from time to time. We will notify you of any changes by posting
              the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed max-w-prose">
              If you have questions about this privacy policy, please contact us at:
              <br />
              Email: <a href="mailto:kudzimusar@gmail.com" className="text-primary hover:underline">kudzimusar@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
