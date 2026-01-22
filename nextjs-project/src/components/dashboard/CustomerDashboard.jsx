import { API_URL } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  Star, 
  ShoppingCart, 
  Trash2,
  Plus,
  MessageSquare,
  CheckCircle,
  X,
  Settings,
  CreditCard,
  User,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useWishlist } from "@/contexts/WishlistContext";
import BikeCard from "@/components/BikeCard";
import { useCart } from "@/contexts/CartContext";

export default function CustomerDashboard({ user }) {
  const searchParams = useSearchParams();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Address Management State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA"
  });

  // Review Management State
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${user.email}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const orders = data.orders;
        setRecentOrders(orders);

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const response = await fetch(`${API_URL}/api/user/addresses`, {
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      const data = await response.json();
      if (data.success) setAddresses(data.addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user.email]);

  const fetchUserReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`${API_URL}/api/user/reviews`, {
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      const data = await response.json();
      if (data.success) {
        setUserReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  }, [user.email]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'orders', 'wishlist', 'addresses', 'reviews'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'addresses') fetchAddresses();
    if (activeTab === 'reviews') fetchUserReviews();
  }, [activeTab, fetchAddresses, fetchUserReviews]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/user/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify(newAddress)
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Address added");
        setAddresses([...addresses, data.address]);
        setShowAddAddressModal(false);
        setNewAddress({ fullName: "", street: "", city: "", state: "", zipCode: "", country: "USA" });
      }
    } catch (error) {
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/user/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Address deleted");
        setAddresses(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Review deleted");
        setUserReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleMoveToCart = async (bike) => {
    const success = await addToCart(bike, 1);
    if (success) {
      toggleWishlist(bike.id);
      toast.success("Moved to cart");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShoppingBag },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'reviews', label: 'My Reviews', icon: MessageSquare },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}!
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
            {user.role} Account
          </span>
        </div>
        <div className="flex gap-2">
           <Link href="/profile">
             <Button variant="outline" className="gap-2">
               <Settings className="h-4 w-4" />
               Edit Profile
             </Button>
           </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 relative">
        <div className="flex overflow-x-auto pb-2 gap-2 md:gap-4 border-b scrollbar-hide snap-x snap-mandatory">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id 
                ? "border-purple-600 text-purple-600" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white pointer-events-none md:hidden" />
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
                  </div>
                  <Package className="h-10 w-10 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">In Transit</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.pendingOrders}</p>
                  </div>
                  <ShoppingBag className="h-10 w-10 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Completed</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.completedOrders}</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Savings</p>
                    <p className="text-3xl font-bold text-purple-600">${stats.totalSpent.toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-10 w-10 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="text-lg">Recent Order History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                      <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
                      <Link href="/bikes">
                        <Button className="bike-gradient-alt text-white border-0">Browse Inventory</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                               <Package className="h-5 w-5" />
                            </div>
                            <div>
                               <div className="font-bold text-slate-900">Order #{order.orderNumber}</div>
                               <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-slate-900">${order.total.toLocaleString()}</div>
                                <div className={`text-[10px] font-bold uppercase ${
                                  order.status === 'delivered' ? 'text-green-600' : 'text-blue-600'
                                }`}>{order.status}</div>
                             </div>
                             <Link href={`/my-orders/${order.orderNumber}`}>
                               <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">Details</Button>
                             </Link>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-slate-50/50">
                        <Link href="/my-orders">
                          <Button variant="ghost" className="w-full text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-white border border-dashed">View All Transaction History</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
               <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-600 to-blue-700 text-white overflow-hidden">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md">
                       <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">My Wishlist</h3>
                    <p className="text-sm text-white/80 mb-6">You have {wishlist.length} items saved in your collection for later viewing.</p>
                    <Button 
                      variant="secondary" 
                      className="w-full font-bold text-purple-700"
                      onClick={() => setActiveTab('wishlist')}
                    >
                      View Collection
                    </Button>
                  </CardContent>
               </Card>

               <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Quick Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     <Button variant="outline" className="w-full justify-start gap-3 border-slate-200" onClick={() => setActiveTab('addresses')}>
                        <MapPin className="h-4 w-4 text-purple-600" />
                        Shipping Addresses
                     </Button>
                     <Button variant="outline" className="w-full justify-start gap-3 border-slate-200" onClick={() => setActiveTab('reviews')}>
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        My Reviews
                     </Button>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Comprehensive Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">No orders found</div>
            ) : (
              <div className="space-y-6">
                {recentOrders.map(order => {
                  const steps = [
                    { id: 'placed', label: 'Placed' },
                    { id: 'processing', label: 'Processing' },
                    { id: 'shipped', label: 'Shipped' },
                    { id: 'delivered', label: 'Delivered' }
                  ];
                  
                  // Simple logic to determine active step index based on status
                  const getStatusIndex = (status) => {
                    const statusMap = { 'confirmed': 0, 'processing': 1, 'shipped': 2, 'delivered': 3 };
                    return statusMap[status] || 0;
                  };
                  
                  const activeStepIndex = getStatusIndex(order.status);

                  return (
                    <div key={order.id} className="p-6 border rounded-xl bg-white shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-3">
                             <div className="font-bold text-lg">Order #{order.orderNumber}</div>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {order.status}
                             </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600 text-xl">${order.total.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">{order.items.length} items</div>
                        </div>
                      </div>

                      {/* Visual Timeline */}
                      <div className="relative flex flex-col md:flex-row justify-between w-full max-w-3xl mx-auto mt-8 mb-4 gap-8 md:gap-0">
                        {/* Connecting Line (Horizontal - md+) */}
                        <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 z-0 hidden md:block"></div>
                        <div 
                           className="absolute top-4 left-0 h-1 bg-green-500 z-0 transition-all duration-500 hidden md:block"
                           style={{ width: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {/* Connecting Line (Vertical - <md) */}
                        <div className="absolute left-4 top-0 bottom-0 w-1 bg-slate-100 z-0 md:hidden"></div>
                        <div 
                           className="absolute left-4 top-0 w-1 bg-green-500 z-0 transition-all duration-500 md:hidden"
                           style={{ height: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((step, index) => {
                          const isCompleted = index <= activeStepIndex;
                          const isCurrent = index === activeStepIndex;
                          
                          return (
                            <div key={step.id} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                                isCompleted 
                                  ? "bg-green-500 text-white shadow-lg shadow-green-200" 
                                  : "bg-slate-100 text-slate-400"
                              }`}>
                                {isCompleted ? <CheckCircle className="h-4 w-4" /> : (index + 1)}
                              </div>
                              <span className={`text-xs font-semibold ${isCurrent ? 'text-green-600' : 'text-slate-400'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end border-t pt-4 mt-4">
                         <Link href={`/my-orders/${order.orderNumber}`}>
                           <Button variant="outline" size="sm" className="gap-2">
                             Full Details <ArrowLeft className="h-3 w-3 rotate-180" />
                           </Button>
                         </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
               <Heart className="h-16 w-16 mx-auto text-slate-200 mb-4" />
               <p className="text-slate-500">Your wishlist is empty</p>
               <Link href="/bikes"><Button className="mt-4">Browse Bikes</Button></Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {wishlist.map(item => (
                <BikeCard 
                  key={item.id} 
                  bike={item.bike} 
                  showMoveToCart={true} 
                  onMoveToCart={handleMoveToCart}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-900">My Saved Addresses</h2>
             <Button className="bike-gradient-alt text-white border-0 gap-2" onClick={() => setShowAddAddressModal(true)}>
                <Plus className="h-4 w-4" />
                Add New Address
             </Button>
          </div>

          {showAddAddressModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <Card className="w-full max-w-lg border-0 shadow-2xl animate-in fade-in zoom-in duration-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between border-b">
                     <CardTitle>Add New Shipping Address</CardTitle>
                     <Button variant="ghost" size="sm" onClick={() => setShowAddAddressModal(false)}><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="p-6">
                     <form onSubmit={handleAddAddress} className="space-y-4">
                        <Input placeholder="Full Name" required value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                        <Input placeholder="Street Address" required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                           <Input placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                           <Input placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <Input placeholder="Zip Code" required value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} />
                           <Input placeholder="Country" required value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                        </div>
                        <div className="flex gap-3 pt-4">
                           <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddAddressModal(false)}>Cancel</Button>
                           <Button type="submit" className="flex-1 bike-gradient-alt text-white border-0">Save Address</Button>
                        </div>
                     </form>
                  </CardContent>
               </Card>
            </div>
          )}
          
          {loadingAddresses ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {addresses.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed">
                  <MapPin className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-500">No saved addresses for quick checkout.</p>
                </div>
              ) : (
                addresses.map(addr => (
                  <Card key={addr.id} className="border-0 shadow-sm relative group">
                    <CardContent className="p-6">
                      <div className="font-bold text-slate-900 mb-2">{addr.fullName}</div>
                      <div className="text-sm text-slate-600 mb-4">
                        {addr.street}, {addr.city}<br />
                        {addr.state} {addr.zipCode}, {addr.country}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                         <div className="text-xs text-slate-400">Default for shipping</div>
                         <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteAddress(addr.id)}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">My Product Reviews</h2>
          {loadingReviews ? (
            <div className="text-center py-12 font-bold text-slate-500">Validating Review History...</div>
          ) : (
            <div className="space-y-4">
               {userReviews.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500">You haven&apos;t written any reviews yet.</p>
                 </div>
               ) : (
                 userReviews.map(review => (
                   <Card key={review.id} className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <div className="text-xs text-purple-600 font-bold uppercase tracking-widest mb-1">{review.bikeName}</div>
                              <div className="flex items-center gap-1 mb-2">
                                 {[...Array(5)].map((_, i) => (
                                   <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                 ))}
                              </div>
                           </div>
                           <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteReview(review.id)}>
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                        <p className="text-slate-700 italic text-sm">&quot; {review.comment} &quot;</p>
                        <div className="mt-4 text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </CardContent>
                   </Card>
                 ))
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
