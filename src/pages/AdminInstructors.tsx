import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminRoute } from "@/components/AdminRoute";
import {
  getAllInstructors,
  approveInstructor,
  rejectInstructor,
  suspendInstructor,
  type Instructor,
} from "@/lib/supabase/instructors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { format } from "date-fns";

export default function AdminInstructors() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ["admin-instructors", activeTab],
    queryFn: () => getAllInstructors(activeTab === "all" ? undefined : (activeTab as Instructor['status'])),
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: (instructorId: string) => approveInstructor(instructorId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      toast({
        title: "Instructor approved",
        description: "The instructor has been approved and can now accept bookings.",
      });
      setSelectedInstructor(null);
    },
    onError: (error: any) => {
      toast({
        title: "Approval failed",
        description: error.message || "Failed to approve instructor.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ instructorId, reason }: { instructorId: string; reason: string }) =>
      rejectInstructor(instructorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      toast({
        title: "Instructor rejected",
        description: "The instructor application has been rejected.",
      });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedInstructor(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rejection failed",
        description: error.message || "Failed to reject instructor.",
        variant: "destructive",
      });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ instructorId, reason }: { instructorId: string; reason?: string }) =>
      suspendInstructor(instructorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      toast({
        title: "Instructor suspended",
        description: "The instructor has been suspended.",
      });
      setSuspendDialogOpen(false);
      setRejectionReason("");
      setSelectedInstructor(null);
    },
    onError: (error: any) => {
      toast({
        title: "Suspension failed",
        description: error.message || "Failed to suspend instructor.",
        variant: "destructive",
      });
    },
  });

  const handleReject = () => {
    if (!selectedInstructor || !rejectionReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({
      instructorId: selectedInstructor.id,
      reason: rejectionReason,
    });
  };

  const handleSuspend = () => {
    if (!selectedInstructor) return;
    suspendMutation.mutate({
      instructorId: selectedInstructor.id,
      reason: rejectionReason.trim() || undefined,
    });
  };

  const getStatusBadge = (status: Instructor['status']) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "suspended":
        return <Badge variant="destructive" className="bg-orange-500">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold">Instructor Management</h1>
            <p className="text-sm text-muted-foreground">Review and manage instructor applications</p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending ({instructors.filter(i => i.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({instructors.filter(i => i.status === 'approved').length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({instructors.filter(i => i.status === 'rejected').length})</TabsTrigger>
              <TabsTrigger value="suspended">Suspended ({instructors.filter(i => i.status === 'suspended').length})</TabsTrigger>
              <TabsTrigger value="all">All ({instructors.length})</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : instructors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No instructors found in this category.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {instructors.map((instructor) => (
                  <Card key={instructor.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{instructor.full_name}</CardTitle>
                            {getStatusBadge(instructor.status)}
                          </div>
                          <CardDescription>
                            {instructor.email} {instructor.phone && `• ${instructor.phone}`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInstructor(instructor)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {instructor.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => approveMutation.mutate(instructor.id)}
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedInstructor(instructor);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          {instructor.status === "approved" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedInstructor(instructor);
                                setSuspendDialogOpen(true);
                              }}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Suspend
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Languages</p>
                          <p className="font-medium">{instructor.languages.join(", ")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Experience</p>
                          <p className="font-medium">{instructor.years_experience} years</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Certification</p>
                          <p className="font-medium">{instructor.certification_number || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Applied</p>
                          <p className="font-medium">
                            {format(new Date(instructor.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      {instructor.bio && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">{instructor.bio}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Tabs>
        </div>

        {/* Instructor Details Dialog */}
        <Dialog open={!!selectedInstructor && !rejectDialogOpen && !suspendDialogOpen} onOpenChange={(open) => !open && setSelectedInstructor(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedInstructor && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedInstructor.full_name}</DialogTitle>
                  <DialogDescription>
                    {selectedInstructor.email} {selectedInstructor.phone && `• ${selectedInstructor.phone}`}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedInstructor.status)}</div>
                  </div>

                  <div>
                    <Label>Languages</Label>
                    <p className="mt-1">{selectedInstructor.languages.join(", ")}</p>
                  </div>

                  <div>
                    <Label>Certification Number</Label>
                    <p className="mt-1">{selectedInstructor.certification_number || "Not provided"}</p>
                  </div>

                  {selectedInstructor.certification_documents.length > 0 && (
                    <div>
                      <Label>Certification Documents</Label>
                      <div className="mt-2 space-y-2">
                        {selectedInstructor.certification_documents.map((doc, index) => (
                          <a
                            key={index}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            Document {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedInstructor.bio && (
                    <div>
                      <Label>Bio</Label>
                      <p className="mt-1 text-sm">{selectedInstructor.bio}</p>
                    </div>
                  )}

                  <div>
                    <Label>Specializations</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedInstructor.specializations.map((spec) => (
                        <Badge key={spec} variant="outline">
                          {spec.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Years of Experience</Label>
                      <p className="mt-1">{selectedInstructor.years_experience}</p>
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <p className="mt-1">{selectedInstructor.rating.toFixed(1)} ({selectedInstructor.total_reviews} reviews)</p>
                    </div>
                  </div>

                  <div>
                    <Label>Availability</Label>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        Video: {selectedInstructor.available_for_video ? "Yes" : "No"}
                      </p>
                      <p className="text-sm">
                        In-Person: {selectedInstructor.available_for_in_person ? "Yes" : "No"}
                      </p>
                      <p className="text-sm">
                        Practice Rooms: {selectedInstructor.available_for_practice_rooms ? "Yes" : "No"}
                        {selectedInstructor.available_for_practice_rooms && ` (Max: ${selectedInstructor.max_practice_room_size})`}
                      </p>
                    </div>
                  </div>

                  {selectedInstructor.location_prefecture && (
                    <div>
                      <Label>Location</Label>
                      <p className="mt-1">
                        {selectedInstructor.location_prefecture}
                        {selectedInstructor.location_city && `, ${selectedInstructor.location_city}`}
                        {selectedInstructor.location_address && `, ${selectedInstructor.location_address}`}
                      </p>
                    </div>
                  )}

                  {selectedInstructor.rejection_reason && (
                    <div>
                      <Label>Rejection/Suspension Reason</Label>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedInstructor.rejection_reason}</p>
                    </div>
                  )}

                  {selectedInstructor.approved_at && (
                    <div>
                      <Label>Approved</Label>
                      <p className="mt-1 text-sm">
                        {format(new Date(selectedInstructor.approved_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedInstructor(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Instructor Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this instructor application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Certification documents are invalid..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Application"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Instructor</DialogTitle>
              <DialogDescription>
                This will prevent the instructor from accepting new bookings. You can provide an optional reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="suspend-reason">Suspension Reason (Optional)</Label>
                <Textarea
                  id="suspend-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Violation of terms..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={suspendMutation.isPending}
              >
                {suspendMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suspending...
                  </>
                ) : (
                  "Suspend Instructor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <BottomNav />
      </div>
    </AdminRoute>
  );
}

