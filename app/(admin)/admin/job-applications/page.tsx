"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Download,
  Mail,
  Phone,
  Calendar,
  User,
  MapPin,
  Loader2,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MessageSquare,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  listJobApplications,
  deleteJobApplication,
  updateJobApplicationStatus,
  sendApplicationEmail,
} from "@/lib/api/admin/job-applications";
import { listCareers } from "@/lib/api/admin/careers";

interface JobApplication {
  id: string;
  job: {
    id: string;
    title: string;
    location: string;
    type: string;
  };
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status?: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Career {
  id: string;
  title: string;
  location: string;
  type: string;
  description?: string;
  isActive: boolean;
}

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    templateType: "shortlisted",
    customMessage: "",
    nextSteps: "",
    contactEmail: "hr@dehlimirch.com",
    contactPhone: "+92-XXX-XXXXXXX",
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchCareers();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await listJobApplications();
      if (data.success) setApplications(data.applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const data = await listCareers();
      if (data.success) setCareers(data.careers);
    } catch (error) {
      console.error("Error fetching careers:", error);
    }
  };

  const handleView = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsViewDialogOpen(true);
  };

  const handleSendEmail = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsEmailDialogOpen(true);
  };

  const sendEmail = async () => {
    if (!selectedApplication) return;

    setSendingEmail(true);
    setError("");

    try {
      const data = await sendApplicationEmail({
        applicantEmail: selectedApplication.email,
        applicantName: selectedApplication.name,
        jobTitle: selectedApplication.job.title,
        templateType: emailData.templateType,
        customMessage: emailData.customMessage,
        nextSteps: emailData.nextSteps,
        contactEmail: emailData.contactEmail,
        contactPhone: emailData.contactPhone,
      });
      if (data.success) {
        setSuccess("Email sent successfully!");
        setIsEmailDialogOpen(false);
        setEmailData({
          templateType: "shortlisted",
          customMessage: "",
          nextSteps: "",
          contactEmail: "hr@dehlimirch.com",
          contactPhone: "+92-XXX-XXXXXXX",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to send email");
        setTimeout(() => setError(""), 5000);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setError("Failed to send email");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const data = await deleteJobApplication(id);
      if (data.success) {
        await fetchApplications();
        setSuccess("Application deleted successfully!");
      } else {
        setError(data.error || "Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      setError("Failed to delete application");
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const data = await updateJobApplicationStatus(id, status);
      if (data.success) {
        await fetchApplications();
        setSuccess(`Application status updated to ${status}!`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update application status");
        setTimeout(() => setError(""), 5000);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      setError("Failed to update application status");
      setTimeout(() => setError(""), 5000);
    }
  };

  const downloadResume = async (resumeUrl: string, applicantName: string) => {
    try {
      // Fetch the file from the URL
      const response = await fetch(resumeUrl);
      const blob = await response.blob();

      // Get file extension from URL or default to pdf
      const urlParts = resumeUrl.split(".");
      const extension =
        urlParts.length > 1 ? urlParts[urlParts.length - 1] : "pdf";

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${applicantName.replace(
        /\s+/g,
        "-"
      )}-resume.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      setError("Failed to download resume");
      setTimeout(() => setError(""), 5000);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "reviewed":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "shortlisted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "hired":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "reviewed":
        return <Badge variant="secondary">Reviewed</Badge>;
      case "shortlisted":
        return (
          <Badge className="bg-green-100 text-green-800">Shortlisted</Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "hired":
        return <Badge className="bg-green-600 text-white">Hired</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const jobMatch = filterJob === "all" || app.job.id === filterJob;
    const statusMatch = filterStatus === "all" || app.status === filterStatus;
    return jobMatch && statusMatch;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-gray-600">
            Review and manage job applications from candidates
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total: {applications.length} applications
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>
                Review and manage applications from candidates
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterJob} onValueChange={setFilterJob}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {careers.map((career) => (
                    <SelectItem key={career.id} value={career.id}>
                      {career.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Job Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{application.name}</div>
                          <div className="text-sm text-gray-500">
                            {application.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {application.job.title}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {application.job.location}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {application.job.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        {getStatusBadge(application.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {application.email}
                        </div>
                        {application.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {application.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {application.resumeUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadResume(
                              application.resumeUrl!,
                              application.name
                            )
                          }
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500">No resume</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(application)}
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(application)}
                          title="Send Email"
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Select
                          value={application.status || "pending"}
                          onValueChange={(value) =>
                            updateApplicationStatus(application.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">
                              Shortlisted
                            </SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Application
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the application
                                from "{application.name}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(application.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              View complete application information
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Applicant Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <p className="text-sm">{selectedApplication.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Email:</span>
                      <p className="text-sm">{selectedApplication.email}</p>
                    </div>
                    {selectedApplication.phone && (
                      <div>
                        <span className="text-sm font-medium">Phone:</span>
                        <p className="text-sm">{selectedApplication.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedApplication.status)}
                        {getStatusBadge(selectedApplication.status)}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Job Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Position:</span>
                      <p className="text-sm">{selectedApplication.job.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Location:</span>
                      <p className="text-sm">
                        {selectedApplication.job.location}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedApplication.job.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {selectedApplication.resumeUrl && (
                <div>
                  <h3 className="font-medium mb-2">Resume</h3>
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadResume(
                        selectedApplication.resumeUrl!,
                        selectedApplication.name
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              )}

              {selectedApplication.coverLetter && (
                <div>
                  <h3 className="font-medium mb-2">Cover Letter</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Application Date</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedApplication.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Update Status</h3>
                  <Select
                    value={selectedApplication.status || "pending"}
                    onValueChange={(value) =>
                      updateApplicationStatus(selectedApplication.id, value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Email to {selectedApplication?.name}
            </DialogTitle>
            <DialogDescription>
              Send a professional email to the candidate about their application
              status
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Candidate Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedApplication.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedApplication.email}
                    </p>
                    <p>
                      <strong>Position:</strong> {selectedApplication.job.title}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Email Template</h3>
                  <Select
                    value={emailData.templateType}
                    onValueChange={(value) =>
                      setEmailData({ ...emailData, templateType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="interview">
                        Interview Invitation
                      </SelectItem>
                      <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customMessage">
                    Custom Message (Optional)
                  </Label>
                  <Textarea
                    id="customMessage"
                    placeholder="Add a personal message to include in the email..."
                    value={emailData.customMessage}
                    onChange={(e) =>
                      setEmailData({
                        ...emailData,
                        customMessage: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="nextSteps">
                    Next Steps / Additional Information (Optional)
                  </Label>
                  <Textarea
                    id="nextSteps"
                    placeholder="Provide specific next steps, interview details, or additional information..."
                    value={emailData.nextSteps}
                    onChange={(e) =>
                      setEmailData({ ...emailData, nextSteps: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={emailData.contactEmail}
                      onChange={(e) =>
                        setEmailData({
                          ...emailData,
                          contactEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={emailData.contactPhone}
                      onChange={(e) =>
                        setEmailData({
                          ...emailData,
                          contactPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={sendEmail}
                  disabled={sendingEmail}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEmailDialogOpen(false)}
                  disabled={sendingEmail}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
