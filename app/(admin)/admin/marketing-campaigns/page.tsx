"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchMarketingCampaigns,
  createMarketingCampaign,
  updateMarketingCampaign,
  deleteMarketingCampaign,
} from "@/lib/api/admin/marketing-campaigns";
import {
  MarketingCampaign,
  CreateMarketingCampaignData,
  UpdateMarketingCampaignData,
} from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Calendar,
  Users,
  Eye,
  MousePointer,
  AlertTriangle,
} from "lucide-react";

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] =
    useState<MarketingCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "email",
    status: "draft",
    startDate: "",
    endDate: "",
    targetAudience: "",
    budget: 0,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await fetchMarketingCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        const data: UpdateMarketingCampaignData = {
          id: editingCampaign.id,
          ...formData,
        };
        await updateMarketingCampaign(data);
      } else {
        const data: CreateMarketingCampaignData = {
          ...formData,
        };
        await createMarketingCampaign(data);
      }

      await fetchCampaigns();
      setIsDialogOpen(false);
      setEditingCampaign(null);
      setFormData({
        name: "",
        description: "",
        type: "email",
        status: "draft",
        startDate: "",
        endDate: "",
        targetAudience: "",
        budget: 0,
      });
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  const handleEdit = (campaign: MarketingCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      startDate: campaign.startDate
        ? new Date(campaign.startDate).toISOString().split("T")[0]
        : "",
      endDate: campaign.endDate
        ? new Date(campaign.endDate).toISOString().split("T")[0]
        : "",
      targetAudience: campaign.targetAudience,
      budget: campaign.budget || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await deleteMarketingCampaign(id);
      await fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "sending":
        return "bg-yellow-100 text-yellow-800";
      case "sent":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="p-6">Loading campaigns...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Marketing Campaigns</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCampaign(null);
                setFormData({
                  name: "",
                  description: "",
                  type: "email",
                  status: "draft",
                  startDate: "",
                  endDate: "",
                  targetAudience: "",
                  budget: 0,
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Campaign Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Campaign description"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Audience
                </label>
                <Input
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                  placeholder="e.g., All customers, New users, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Budget ($)
                </label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: Number(e.target.value) })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCampaign ? "Update" : "Create"} Campaign
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {campaign.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.targetAudience}</TableCell>
                    <TableCell>${campaign.budget || 0}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {new Date(campaign.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">
                        to {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
