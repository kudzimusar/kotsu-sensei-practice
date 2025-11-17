import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { registerAsInstructor, uploadCertificationDocument } from "@/lib/supabase/instructors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, GraduationCap, ArrowLeft, CheckCircle2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const JAPANESE_PREFECTURES = [
  "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima",
  "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa",
  "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu",
  "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama",
  "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa",
  "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki",
  "Kagoshima", "Okinawa"
];

const SPECIALIZATIONS = [
  "theory_test",
  "practical_test",
  "road_signs",
  "traffic_rules",
  "parking",
  "highway_driving",
  "defensive_driving",
];

export default function BecomeInstructor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: user?.email || "",
    phone: "",
    languages: [] as string[],
    certification_number: "",
    certification_documents: [] as string[],
    bio: "",
    specializations: [] as string[],
    years_experience: 0,
    location_prefecture: "",
    location_city: "",
    location_address: "",
    available_for_video: true,
    available_for_in_person: false,
    available_for_practice_rooms: true,
    max_practice_room_size: 8,
  });

  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingDocs(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }
        const url = await uploadCertificationDocument(file, user!.id);
        return { file, url };
      });

      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      const newFiles = results.map(r => r.file);

      setFormData(prev => ({
        ...prev,
        certification_documents: [...prev.certification_documents, ...newUrls],
      }));
      setDocumentFiles(prev => [...prev, ...newFiles]);

      toast({
        title: "Documents uploaded",
        description: `${results.length} document(s) uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload documents.",
        variant: "destructive",
      });
    } finally {
      setUploadingDocs(false);
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certification_documents: prev.certification_documents.filter((_, i) => i !== index),
    }));
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.full_name || !formData.email) return false;
        if (formData.languages.length === 0) return false;
        return true;
      case 2:
        if (!formData.certification_number) return false;
        if (formData.certification_documents.length === 0) return false;
        return true;
      case 3:
        if (formData.specializations.length === 0) return false;
        if (formData.years_experience < 0) return false;
        return true;
      case 4:
        if (formData.available_for_in_person && !formData.location_prefecture) return false;
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    } else {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await registerAsInstructor({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        languages: formData.languages,
        certification_number: formData.certification_number || undefined,
        certification_documents: formData.certification_documents,
        bio: formData.bio || undefined,
        specializations: formData.specializations,
        years_experience: formData.years_experience,
        location_prefecture: formData.location_prefecture || undefined,
        location_city: formData.location_city || undefined,
        location_address: formData.location_address || undefined,
        available_for_video: formData.available_for_video,
        available_for_in_person: formData.available_for_in_person,
        available_for_practice_rooms: formData.available_for_practice_rooms,
        max_practice_room_size: formData.max_practice_room_size,
      });

      toast({
        title: "Application submitted",
        description: "Your instructor application has been submitted and is pending admin approval.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base font-bold">Become an Instructor</h1>
                <p className="text-xs text-muted-foreground">
                  Step {step} of 5
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= num
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > num ? <CheckCircle2 className="h-4 w-4" /> : num}
                </div>
                {num < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > num ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Personal Information"}
                {step === 2 && "Certification"}
                {step === 3 && "Experience & Specializations"}
                {step === 4 && "Location & Availability"}
                {step === 5 && "Review & Submit"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "Upload your certification documents"}
                {step === 3 && "Share your teaching experience"}
                {step === 4 && "Set your location and availability preferences"}
                {step === 5 && "Review your application before submitting"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+81 90-1234-5678"
                    />
                  </div>

                  <div>
                    <Label>Languages Spoken *</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lang_english"
                          checked={formData.languages.includes("english")}
                          onCheckedChange={() => handleLanguageToggle("english")}
                        />
                        <Label htmlFor="lang_english" className="font-normal cursor-pointer">
                          English
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lang_japanese"
                          checked={formData.languages.includes("japanese")}
                          onCheckedChange={() => handleLanguageToggle("japanese")}
                        />
                        <Label htmlFor="lang_japanese" className="font-normal cursor-pointer">
                          Japanese
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell students about your teaching style and experience..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Certification */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="certification_number">Certification Number *</Label>
                    <Input
                      id="certification_number"
                      value={formData.certification_number}
                      onChange={(e) => handleInputChange("certification_number", e.target.value)}
                      placeholder="Enter your official certification number"
                    />
                  </div>

                  <div>
                    <Label>Certification Documents *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload PDF or image files of your certification documents (max 10MB each)
                    </p>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        id="documents"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        onChange={handleDocumentUpload}
                        className="hidden"
                        disabled={uploadingDocs}
                      />
                      <Label
                        htmlFor="documents"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {uploadingDocs ? "Uploading..." : "Click to upload documents"}
                        </span>
                      </Label>
                    </div>

                    {formData.certification_documents.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {documentFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted rounded"
                          >
                            <span className="text-sm">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDocument(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Experience & Specializations */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={(e) => handleInputChange("years_experience", parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label>Specializations *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select all areas you specialize in
                    </p>
                    <div className="space-y-2">
                      {SPECIALIZATIONS.map((spec) => (
                        <div key={spec} className="flex items-center space-x-2">
                          <Checkbox
                            id={spec}
                            checked={formData.specializations.includes(spec)}
                            onCheckedChange={() => handleSpecializationToggle(spec)}
                          />
                          <Label htmlFor={spec} className="font-normal cursor-pointer capitalize">
                            {spec.replace(/_/g, " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Location & Availability */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Session Types</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="available_video"
                          checked={formData.available_for_video}
                          onCheckedChange={(checked) =>
                            handleInputChange("available_for_video", checked)
                          }
                        />
                        <Label htmlFor="available_video" className="font-normal cursor-pointer">
                          Available for Video Sessions
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="available_in_person"
                          checked={formData.available_for_in_person}
                          onCheckedChange={(checked) =>
                            handleInputChange("available_for_in_person", checked)
                          }
                        />
                        <Label htmlFor="available_in_person" className="font-normal cursor-pointer">
                          Available for In-Person Sessions
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="available_practice_rooms"
                          checked={formData.available_for_practice_rooms}
                          onCheckedChange={(checked) =>
                            handleInputChange("available_for_practice_rooms", checked)
                          }
                        />
                        <Label htmlFor="available_practice_rooms" className="font-normal cursor-pointer">
                          Available for Practice Rooms (Group Sessions)
                        </Label>
                      </div>
                    </div>
                  </div>

                  {formData.available_for_practice_rooms && (
                    <div>
                      <Label htmlFor="max_practice_room_size">Maximum Practice Room Size</Label>
                      <Input
                        id="max_practice_room_size"
                        type="number"
                        min="2"
                        max="20"
                        value={formData.max_practice_room_size}
                        onChange={(e) =>
                          handleInputChange("max_practice_room_size", parseInt(e.target.value) || 8)
                        }
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Maximum number of students in a practice room (2-20)
                      </p>
                    </div>
                  )}

                  {formData.available_for_in_person && (
                    <>
                      <div>
                        <Label htmlFor="location_prefecture">Prefecture *</Label>
                        <Select
                          value={formData.location_prefecture}
                          onValueChange={(value) => handleInputChange("location_prefecture", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select prefecture" />
                          </SelectTrigger>
                          <SelectContent>
                            {JAPANESE_PREFECTURES.map((pref) => (
                              <SelectItem key={pref} value={pref}>
                                {pref}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="location_city">City</Label>
                        <Input
                          id="location_city"
                          value={formData.location_city}
                          onChange={(e) => handleInputChange("location_city", e.target.value)}
                          placeholder="Tokyo"
                        />
                      </div>

                      <div>
                        <Label htmlFor="location_address">Address</Label>
                        <Input
                          id="location_address"
                          value={formData.location_address}
                          onChange={(e) => handleInputChange("location_address", e.target.value)}
                          placeholder="Street address (optional)"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Personal Information</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {formData.full_name}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone || "Not provided"}</p>
                      <p><strong>Languages:</strong> {formData.languages.join(", ")}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Certification</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Certification Number:</strong> {formData.certification_number}</p>
                      <p><strong>Documents:</strong> {formData.certification_documents.length} uploaded</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Experience</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Years of Experience:</strong> {formData.years_experience}</p>
                      <p><strong>Specializations:</strong> {formData.specializations.map(s => s.replace(/_/g, " ")).join(", ")}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Availability</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Video Sessions:</strong> {formData.available_for_video ? "Yes" : "No"}</p>
                      <p><strong>In-Person Sessions:</strong> {formData.available_for_in_person ? "Yes" : "No"}</p>
                      <p><strong>Practice Rooms:</strong> {formData.available_for_practice_rooms ? "Yes" : "No"}</p>
                      {formData.available_for_in_person && (
                        <p><strong>Location:</strong> {formData.location_prefecture} {formData.location_city}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Note:</strong> Your application will be reviewed by our admin team. 
                      You will receive an email notification once your application is approved or if 
                      additional information is required.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || loading}
                >
                  Back
                </Button>
                {step < 5 ? (
                  <Button onClick={handleNext} disabled={loading}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

