"use client";

import { API_URL } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Send, User, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { uploadToImgBB } from "@/lib/imgbb";

export default function BikeReviews({ bikeId }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ count: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", image: "" });

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${bikeId}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [bikeId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }

    setUploading(true);
    const result = await uploadToImgBB(file);
    if (result.success) {
      setNewReview(prev => ({ ...prev, image: result.url }));
      toast.success("Image uploaded!");
    } else {
      toast.error(result.message);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    setSubmitting(true);
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/reviews/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.email}`
        },
        body: JSON.stringify({
          bikeId,
          rating: newReview.rating,
          comment: newReview.comment,
          image: newReview.image
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Review submitted!");
        setNewReview({ rating: 5, comment: "", image: "" });
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-purple-600" />
          Customer Reviews
        </h2>
        <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-xl font-bold">{stats.averageRating}</span>
          <span className="text-muted-foreground">({stats.count} reviews)</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              {session ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={`p-1 transition-colors ${
                            star <= newReview.rating 
                              ? "text-yellow-400" 
                              : "text-gray-300"
                          }`}
                        >
                          <Star className={`h-8 w-8 ${star <= newReview.rating ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Comment</label>
                    <Textarea
                      placeholder="Share your thoughts about this bike..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Photo (Optional)</label>
                    {newReview.image ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                           <Image src={newReview.image} alt="Preview" fill className="object-cover" />
                           <button 
                             type="button"
                             onClick={() => setNewReview(prev => ({ ...prev, image: "" }))}
                             className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 hover:bg-white z-10"
                           >
                             <X className="h-3 w-3 text-red-500" />
                           </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                           <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                           <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                             {uploading ? "Uploading..." : "Upload Photo"}
                           </span>
                           <input 
                             type="file" 
                             className="hidden" 
                             accept="image/*" 
                             onChange={handleImageUpload}
                             disabled={uploading}
                           />
                        </label>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bike-gradient-alt text-white border-0 gap-2"
                    disabled={submitting}
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Post Review"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You must be logged in to post a review.</p>
                  <Button variant="outline" className="w-full">Login to Review</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold">{review.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic mb-4">
                      &quot;{review.comment}&quot;
                    </p>
                    {review.image && (
                       <div className="mt-3">
                          <Image 
                            src={review.image} 
                            alt="Review Attachment" 
                            width={150}
                            height={100}
                            className="rounded-lg border shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(review.image, '_blank')}
                          />
                       </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
