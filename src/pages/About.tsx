import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-foreground">About Our App</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are dedicated to providing comprehensive driving test preparation resources to help learners
              pass their driving tests with confidence. Our platform offers practice questions, study materials,
              and personalized learning tools designed to ensure success.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">What We Offer</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Comprehensive practice quizzes covering all aspects of driving theory</li>
              <li>Personalized study calendar to track your progress</li>
              <li>Mock tests that simulate real exam conditions</li>
              <li>Performance analytics to identify areas for improvement</li>
              <li>Goal setting and progress tracking features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to providing accurate, up-to-date information that reflects current driving
              regulations and best practices. Our content is regularly reviewed and updated to ensure
              learners have access to the most relevant study materials.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions, feedback, or support, please visit our <a href="/support" className="text-primary hover:underline">Support page</a> or email us at kudzimusar@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
