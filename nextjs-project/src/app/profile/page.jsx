"use client";

import { API_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Lock, Phone } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
      // Note: We can't fetch the existing password or phone easily without a GET endpoint, 
      // but for now we'll just allow setting new ones.
    }
  }, [session]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.email}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password || undefined // Only send if set
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Profile updated successfully");
        // Update session if name changed
        if (formData.name !== session.user.name) {
          await update({ name: formData.name });
        }
        router.push('/dashboard');
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className="p-8 text-center">Loading session...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6 pl-0 gap-2 hover:bg-transparent hover:text-purple-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
          <div className="flex items-center gap-4">
             <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
               <User className="h-8 w-8 text-white" />
             </div>
             <div>
               <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
               <p className="text-slate-300 text-sm mt-1">Update your personal information and security settings.</p>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 border-b pb-2">Personal Details</h3>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <Input 
                  value={formData.email}
                  disabled
                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">Email address cannot be changed directly.</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Security
              </h3>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">New Password (Optional)</label>
                 <Input 
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                    autoComplete="new-password"
                  />
              </div>
              
              {formData.password && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                   <Input 
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter new password"
                      required={!!formData.password}
                    />
                </div>
              )}
            </div>

            <div className="pt-6 flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bike-gradient-alt text-white border-0 font-bold"
                disabled={loading}
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
