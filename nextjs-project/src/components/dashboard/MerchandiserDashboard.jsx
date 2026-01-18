"use client";

import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, DollarSign, Users, ShoppingCart, ArrowRight, BarChart3, Award, MessageSquare, Star, Trash2, CheckCircle, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function MerchandiserDashboard({ user }) {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeListings: 0,
    totalInventory: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [lowStockBikes, setLowStockBikes] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [updating, setUpdating] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkJson, setBulkJson] = useState("");

  const fetchAdminData = useCallback(async () => {
    try {
      const [ordersRes, bikesRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/orders`, {
          headers: { 'Authorization': `Bearer ${user.email}` }
        }),
        fetch(`${API_URL}/api/bikes`),
        fetch(`${API_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${user.email}` }
        })
      ]);

      const ordersData = await ordersRes.json();
      const bikesData = await bikesRes.json();
      const usersData = await usersRes.json();

      if (ordersData.success && bikesData.success && usersData.success) {
        setRecentOrders(ordersData.orders);
        setUsers(usersData.users);
        setBikes(bikesData.bikes);
        setLowStockBikes(bikesData.bikes.filter(b => b.stock < 5));

        // Fetch all reviews for moderation
        const reviewsPromises = bikesData.bikes.map(b => 
          fetch(`${API_URL}/api/reviews/${b.id}`).then(r => r.json())
        );
        const allRes = await Promise.all(reviewsPromises);
        const reviews = allRes.flatMap(res => res.success ? res.reviews.map(r => ({
          ...r, 
          bikeName: bikesData.bikes.find(bk => bk.id === r.bikeId)?.name 
        })) : []);
        setAllReviews(reviews);

        setStats({
          totalSales: ordersData.orders.reduce((sum, o) => sum + o.total, 0),
          totalOrders: ordersData.orders.length,
          activeListings: bikesData.bikes.length,
          totalInventory: bikesData.bikes.reduce((sum, b) => sum + b.stock, 0),
          pendingVerifications: usersData.users.filter(u => u.verificationStatus === 'pending').length
        });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  async function handleDeleteReview(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Review removed");
        setAllReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  }

  async function handleDeleteBike(id) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const response = await fetch(`${API_URL}/api/bikes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Bike listing removed");
        setBikes(prev => prev.filter(b => b.id !== id));
        setStats(prev => ({ ...prev, activeListings: prev.activeListings - 1 }));
      }
    } catch (error) {
      toast.error("Failed to delete bike");
    }
  }

  async function handleBulkUpload() {
    if (!bulkJson.trim()) return;
    try {
      const bikesToUpload = JSON.parse(bulkJson);
      const response = await fetch(`${API_URL}/api/bikes/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify(bikesToUpload)
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowBulkUpload(false);
        setBulkJson("");
        fetchAdminData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  }

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Management Portal</h1>
          <p className="text-muted-foreground">
            Overview of MotruBi platform performance and inventory
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setShowBulkUpload(true)}>
            <Package className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Link href="/add-bike">
            <Button className="bike-gradient-alt text-white border-0 gap-2">
              <Plus className="h-4 w-4" />
              Add New Bike
            </Button>
          </Link>
        </div>
      </div>

      {showBulkUpload && (
        <Card className="mb-8 border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-lg">Bulk Product Upload</CardTitle>
            <p className="text-xs text-muted-foreground">Paste a JSON array of bike objects to import them in bulk.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea 
              className="w-full h-32 p-3 text-xs font-mono border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder='[{"name": "New Bike", "category": "Sport", "price": 5000, "description": "...", "stock": 10}, ...]'
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowBulkUpload(false)}>Cancel</Button>
              <Button size="sm" className="bike-gradient-alt text-white border-0" onClick={handleBulkUpload}>Start Import</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                <p className="text-3xl font-bold">${stats.totalSales.toLocaleString()}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
                <p className="text-3xl font-bold">{stats.activeListings}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Dealer Verification</p>
                <p className={`text-3xl font-bold ${stats.pendingVerifications > 0 ? 'text-orange-600' : ''}`}>{stats.pendingVerifications}</p>
              </div>
              <Users className="h-10 w-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b overflow-x-auto">
        <button 
          className={`pb-2 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`pb-2 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'inventory' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`pb-2 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'dealers' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('dealers')}
        >
          Dealer Verification {stats.pendingVerifications > 0 && <span className="ml-2 bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full">{stats.pendingVerifications}</span>}
        </button>
        <button 
          className={`pb-2 px-4 font-medium transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('reviews')}
        >
          Product Reviews
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'orders' ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Global Platform Orders</CardTitle>
                <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-600 rounded">ADMIN ACCESS</span>
              </CardHeader>
              {/* ... orders content ... */}
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No orders recorded</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-semibold">Order ID</th>
                          <th className="text-left py-3 font-semibold">Customer</th>
                          <th className="text-left py-3 font-semibold">Total</th>
                          <th className="text-left py-3 font-semibold">Status</th>
                          <th className="text-right py-3 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-4 font-medium">{order.orderNumber}</td>
                            <td className="py-4 text-muted-foreground truncate max-w-[150px]">{order.userEmail}</td>
                            <td className="py-4 font-bold">${order.total.toLocaleString()}</td>
                            <td className="py-4">
                              <select 
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.orderNumber, e.target.value)}
                                className={`px-2 py-1 rounded-md text-xs font-medium border-0 focus:ring-2 focus:ring-purple-500 cursor-pointer ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}
                              >
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-4 text-right">
                               <Link href={`/order-confirmation/${order.orderNumber}`}>
                                 <Button variant="ghost" size="sm">Details</Button>
                               </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : activeTab === 'inventory' ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Catalog Inventory</CardTitle>
                <span className="text-xs font-bold text-muted-foreground">{bikes.length} Models Listed</span>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-semibold">Bike</th>
                        <th className="text-left py-3 font-semibold">Category</th>
                        <th className="text-left py-3 font-semibold">Price</th>
                        <th className="text-left py-3 font-semibold">Stock</th>
                        <th className="text-right py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bikes.map((bike) => (
                        <tr key={bike.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <Image src={bike.image} alt={bike.name} width={48} height={32} className="h-8 w-12 object-cover rounded shadow-sm border" />
                              <div className="font-medium">{bike.name}</div>
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground">{bike.category}</td>
                          <td className="py-4 font-bold">${bike.price.toLocaleString()}</td>
                          <td className="py-4">
                             <span className={`font-bold ${bike.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                               {bike.stock}
                             </span>
                          </td>
                          <td className="py-4 text-right">
                             <div className="flex justify-end gap-1">
                               <Button variant="ghost" size="sm" onClick={() => toast.success("Editing enabled (Phase 13)")}>
                                  <Edit className="h-3.5 w-3.5" />
                               </Button>
                               <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteBike(bike.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                               </Button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : activeTab === 'dealers' ? (
            <Card>
              <CardHeader>
                <CardTitle>Dealer Verification Requests</CardTitle>
              </CardHeader>
              {/* ... dealer content ... */}
              <CardContent>
                {users.filter(u => u.role === 'dealer').length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No dealer accounts found</div>
                ) : (
                  <div className="space-y-4">
                    {users.filter(u => u.role === 'dealer').map((dealer) => (
                      <div key={dealer.id} className="p-4 border rounded-xl bg-white shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold flex items-center gap-2">
                              {dealer.dealerInfo?.businessName || dealer.name}
                              {dealer.isVerified && <Award className="h-4 w-4 text-green-600" />}
                            </h4>
                            <p className="text-xs text-muted-foreground">{dealer.email}</p>
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            dealer.isVerified ? 'bg-green-100 text-green-700' : 
                            dealer.verificationStatus === 'pending' ? 'bg-orange-100 text-orange-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {dealer.isVerified ? 'Verified' : dealer.verificationStatus || 'Unverified'}
                          </div>
                        </div>

                        {dealer.dealerInfo && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                            <div><span className="text-muted-foreground">Tax ID:</span> {dealer.dealerInfo.taxId}</div>
                            <div><span className="text-muted-foreground">Phone:</span> {dealer.dealerInfo.phone}</div>
                            <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {dealer.dealerInfo.address}</div>
                          </div>
                        )}

                        {!dealer.isVerified && dealer.verificationStatus === 'pending' && (
                          <div className="flex gap-2 pt-1">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white border-0 text-xs"
                              onClick={() => handleDealerVerify(dealer.email, 'verified')}
                              disabled={updating}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:bg-red-50 text-xs"
                              onClick={() => handleDealerVerify(dealer.email, 'rejected')}
                              disabled={updating}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Community Reviews Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                {/* We'll fetch and display reviews here */}
                {allReviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No reviews found</div>
                ) : (
                  <div className="space-y-4">
                    {allReviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <div className="font-bold text-sm">{review.userName} <span className="text-xs text-muted-foreground font-normal">on {review.bikeName}</span></div>
                              <div className="flex items-center gap-1 mt-1">
                                 {[...Array(5)].map((_, i) => (
                                   <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                 ))}
                              </div>
                           </div>
                           <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteReview(review.id)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                        <p className="text-xs text-slate-600 italic">&quot;{review.comment}&quot;</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="text-lg">Inventory Summary</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <div className="text-sm">Low Stock Items</div>
                   <div className="font-bold text-red-600">{lowStockBikes.length}</div>
                </div>
                {lowStockBikes.length > 0 && (
                   <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {lowStockBikes.map(b => (
                         <div key={b.id} className="text-[10px] flex justify-between items-center border-l-2 border-red-500 pl-2 bg-red-50/50 py-1">
                            <span className="font-medium truncate max-w-[100px]">{b.name}</span>
                            <span className="font-bold text-red-700">{b.stock} left</span>
                         </div>
                      ))}
                   </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <div className="text-sm">Featured Units</div>
                   <div className="font-bold text-blue-600">5</div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => router.push('/bikes')}>
                  Manage Listings
                </Button>
             </CardContent>
           </Card>

           <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
             <CardHeader>
               <CardTitle className="text-lg">System Status</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  API Services Operational
                </div>
                 <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Payment Gateway Active
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );

  async function handleStatusUpdate(orderNumber, newStatus) {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/status/${orderNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Order status updated");
        setRecentOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, status: newStatus } : o));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDealerVerify(email, status) {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/verify-dealer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify({ email, status })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setUsers(prev => prev.map(u => u.email === email ? { ...u, isVerified: status === 'verified', verificationStatus: status } : u));
        setStats(prev => ({
          ...prev,
          pendingVerifications: prev.pendingVerifications - 1
        }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error verifying dealer:", error);
      toast.error("An error occurred");
    } finally {
      setUpdating(false);
    }
  }
}
