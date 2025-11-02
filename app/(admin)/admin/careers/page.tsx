"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Briefcase,
  Calendar,
  Loader2,
  Building,
} from "lucide-react";
import {
  fetchCareers as fetchCareersApi,
  createCareer,
  updateCareer,
  deleteCareer,
  toggleCareerStatus,
} from "@/lib/api/admin/careers";
import { Career, CreateCareerData, UpdateCareerData } from "@/types/types";

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "",
    description: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const data = await fetchCareersApi();
      setCareers(data);
    } catch (error) {
      console.error("Error fetching careers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingCareer) {
        const data: UpdateCareerData = {
          id: editingCareer.id,
          title: formData.title,
          location: formData.location,
          type: formData.type,
          department: formData.type,
          description: formData.description || "",
          requirements: [],
          responsibilities: [],
          isActive: formData.isActive,
        };
        await updateCareer(data);
      } else {
        const data: CreateCareerData = {
          title: formData.title,
          location: formData.location,
          type: formData.type,
          department: formData.type,
          description: formData.description || "",
          requirements: [],
          responsibilities: [],
          isActive: formData.isActive,
        };
        await createCareer(data);
      }

      await fetchCareers();
      setIsDialogOpen(false);
      setEditingCareer(null);
      setFormData({
        title: "",
        location: "",
        type: "",
        description: "",
        isActive: true,
      });
      setSuccess(
        editingCareer
          ? "Job posting updated successfully!"
          : "Job posting created successfully!"
      );
    } catch (error) {
      console.error("Error saving job posting:", error);
      setError("Failed to save job posting");
    }
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title,
      location: career.location,
      type: career.type,
      description: career.description || "",
      isActive: career.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCareer(id);
      await fetchCareers();
      setSuccess("Job posting deleted successfully!");
    } catch (error) {
      console.error("Error deleting job posting:", error);
      setError("Failed to delete job posting");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleCareerStatus(id, !currentStatus);
      await fetchCareers();
      setSuccess(
        `Job posting ${
          !currentStatus ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      console.error("Error updating job posting status:", error);
      setError("Failed to update job posting status");
    }
  };

  const getJobTypeBadge = (type: string) => {
    const typeColors = {
      "Full-time": "bg-blue-100 text-blue-800",
      "Part-time": "bg-green-100 text-green-800",
      Contract: "bg-yellow-100 text-yellow-800",
      Internship: "bg-purple-100 text-purple-800",
      Remote: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge
        className={
          typeColors[type as keyof typeof typeColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {type}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Postings</h1>
          <p className="text-gray-600">
            Create and manage job postings for your organization
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCareer(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Job Posting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCareer ? "Edit Job Posting" : "Create New Job Posting"}
              </DialogTitle>
              <DialogDescription>
                {editingCareer
                  ? "Update the job posting details below."
                  : "Fill in the details to create a new job posting."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Job Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location *
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Lahore, Pakistan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Job Type *
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Job Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the role, responsibilities, requirements, and benefits..."
                  rows={8}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide a detailed description of the position, including key
                  responsibilities, required qualifications, and what makes this
                  role attractive to candidates.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active (visible to job seekers)
                </label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {editingCareer ? "Update Job Posting" : "Create Job Posting"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
          <CardTitle>Job Postings</CardTitle>
          <CardDescription>
            Manage all job postings and their visibility
          </CardDescription>
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
                  <TableHead>Job Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {careers.map((career) => (
                  <TableRow key={career.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{career.title}</div>
                          {career.description && (
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {career.description.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {career.location}
                      </div>
                    </TableCell>
                    <TableCell>{getJobTypeBadge(career.type)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={career.isActive ? "default" : "secondary"}
                      >
                        {career.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(career.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleStatus(career.id, career.isActive)
                          }
                        >
                          {career.isActive ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(career)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Job Posting
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the job posting
                                for "{career.title}"? This action cannot be
                                undone and will also remove any associated
                                applications.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(career.id)}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{careers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {careers.filter((c) => c.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {careers.filter((c) => !c.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
