import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { registerAsInstructor, uploadCertification } from "@/lib/supabase/instructors";
import { ArrowLeft, Upload, FileText } from "lucide-react";

const BecomeInstructor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    hourly_rate: "2000",
    languages: "English, Japanese",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setCertificationFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let certificationUrl = "";
      let certificationFilename = "";

      // Upload certification if provided
      if (certificationFile) {
        setIsUploading(true);
        certificationUrl = await uploadCertification(certificationFile);
        certificationFilename = certificationFile.name;
        setIsUploading(false);
      }

      // Create instructor profile
      await registerAsInstructor({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        languages: formData.languages.split(',').map(l => l.trim()),
        certification_documents: certificationUrl ? [certificationUrl] : [],
        specializations: [],
        years_experience: 0,
        available_for_video: true,
        available_for_in_person: false,
        available_for_practice_rooms: true,
        max_practice_room_size: 8,
      });

      toast({
        title: "Application submitted!",
        description: "Your instructor application has been submitted successfully.",
      });

      navigate("/profile");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Become an Instructor</h1>
            <p className="text-muted-foreground mt-2">
              Join our team of professional driving instructors
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="hourly_rate">Hourly Rate (¥) *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  required
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <Label htmlFor="languages">Languages (comma separated) *</Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  required
                  placeholder="English, Japanese"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio / Experience</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your experience as a driving instructor..."
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="certification">Certification / CV (PDF or Image)</Label>
                <div className="mt-2">
                  <label
                    htmlFor="certification"
                    className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      {certificationFile ? (
                        <>
                          <FileText className="mx-auto h-8 w-8 text-primary" />
                          <p className="mt-2 text-sm text-foreground font-medium">
                            {certificationFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(certificationFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Click to upload certification or CV
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, JPG, PNG up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    id="certification"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isUploading}
            >
              {isUploading ? "Uploading certification..." : isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeInstructor;
