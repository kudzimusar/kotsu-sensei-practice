import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedInstructors, type Instructor } from "@/lib/supabase/instructors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, GraduationCap } from "lucide-react";
import { InstructorCard } from "@/components/instructor/InstructorCard";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { getCurrentLocation, calculateDistance, formatDistance } from "@/lib/location/distance";
import { useState, useEffect } from "react";

const JAPANESE_PREFECTURES = [
  "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima",
  "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa",
  "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu",
  "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama",
  "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa",
  "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki",
  "Kagoshima", "Okinawa"
];

export default function BookInstructor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    languages: [] as string[],
    session_type: "" as "" | "video" | "in_person",
    location_prefecture: "",
    min_rating: "",
    practice_rooms: false,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt");

  useEffect(() => {
    // Request location if filtering for in-person sessions
    if (filters.session_type === "in_person" && locationPermission === "prompt") {
      getCurrentLocation().then((loc) => {
        if (loc) {
          setUserLocation(loc);
          setLocationPermission("granted");
        } else {
          setLocationPermission("denied");
        }
      });
    }
  }, [filters.session_type, locationPermission]);

  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ["instructors", filters],
    queryFn: () => getApprovedInstructors({
      languages: filters.languages.length > 0 ? filters.languages : undefined,
      session_type: filters.session_type || undefined,
      location_prefecture: filters.location_prefecture || undefined,
      min_rating: filters.min_rating ? parseFloat(filters.min_rating) : undefined,
    }),
  });

  const filteredInstructors = useMemo(() => {
    let filtered = instructors;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (instructor) =>
          instructor.full_name.toLowerCase().includes(term) ||
          instructor.bio?.toLowerCase().includes(term) ||
          instructor.specializations.some((s) => s.toLowerCase().includes(term))
      );
    }

    // Practice rooms filter
    if (filters.practice_rooms) {
      filtered = filtered.filter((instructor) => instructor.available_for_practice_rooms);
    }

    return filtered;
  }, [instructors, searchTerm, filters.practice_rooms]);

  const handleLanguageToggle = (language: string) => {
    setFilters((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const clearFilters = () => {
    setFilters({
      languages: [],
      session_type: "",
      location_prefecture: "",
      min_rating: "",
      practice_rooms: false,
    });
    setSearchTerm("");
  };

  const activeFilterCount = [
    filters.languages.length > 0,
    filters.session_type !== "",
    filters.location_prefecture !== "",
    filters.min_rating !== "",
    filters.practice_rooms,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Book an Instructor</h1>
              <p className="text-sm text-muted-foreground">
                Find certified instructors for theory test preparation
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/become-instructor")}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Become Instructor
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialization, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter Instructors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Languages</Label>
                <div className="flex gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lang_english"
                      checked={filters.languages.includes("english")}
                      onCheckedChange={() => handleLanguageToggle("english")}
                    />
                    <Label htmlFor="lang_english" className="font-normal cursor-pointer">
                      English
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lang_japanese"
                      checked={filters.languages.includes("japanese")}
                      onCheckedChange={() => handleLanguageToggle("japanese")}
                    />
                    <Label htmlFor="lang_japanese" className="font-normal cursor-pointer">
                      Japanese
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Session Type</Label>
                <Select
                  value={filters.session_type}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, session_type: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All session types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="video">Video Sessions</SelectItem>
                    <SelectItem value="in_person">In-Person Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Location (Prefecture)</Label>
                <Select
                  value={filters.location_prefecture}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, location_prefecture: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All prefectures" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Prefectures</SelectItem>
                    {JAPANESE_PREFECTURES.map((pref) => (
                      <SelectItem key={pref} value={pref}>
                        {pref}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Minimum Rating</Label>
                <Select
                  value={filters.min_rating}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, min_rating: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    <SelectItem value="3.0">3.0+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="practice_rooms"
                  checked={filters.practice_rooms}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, practice_rooms: !!checked }))
                  }
                />
                <Label htmlFor="practice_rooms" className="font-normal cursor-pointer">
                  Available for Practice Rooms (Group Sessions)
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filteredInstructors.length} {filteredInstructors.length === 1 ? "Instructor" : "Instructors"} Found
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading instructors...</p>
              </div>
            </div>
          ) : filteredInstructors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No instructors found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstructors.map((instructor) => (
                <InstructorCard key={instructor.id} instructor={instructor} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

