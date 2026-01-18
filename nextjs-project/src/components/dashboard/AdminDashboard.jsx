"use client";

import { API_URL } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Settings, 
  DollarSign, 
  Briefcase, 
  ShieldCheck, 
  TrendingUp, 
  BarChart, 
  Activity,
  Award,
  UserPlus,
  Trash2,
  Eye,
  X,
  Edit
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalInventory: 0
  });
  const [users, setUsers] = useState([]);
  const [promos, setPromos] = useState([]);
  const [settings, setSettings] = useState({ maintenanceMode: false, dealerAutoApproval: false });
  const [pendingDealers, setPendingDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [updating, setUpdating] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', discount: '', type: 'percentage', description: '' });
  const [inventory, setInventory] = useState([]);
  const [editingBike, setEditingBike] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState(null);

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, usersRes, settingsRes, inventoryRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${user.email}` }
        }),
        fetch(`${API_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${user.email}` }
        }),
        fetch(`${API_URL}/api/admin/settings`, {
          headers: { 'Authorization': `Bearer ${user.email}` }
        }),
        fetch(`${API_URL}/api/bikes`)
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const settingsData = await settingsRes.json();
      const inventoryData = await inventoryRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (usersData.success) {
        setUsers(usersData.users);
        // Filter pending dealers
        const pending = usersData.users.filter(u => u.role === 'dealer' && u.verificationStatus === 'pending');
        setPendingDealers(pending);
      }
      if (settingsData.success) setSettings(settingsData.settings);
      if (inventoryData.success) setInventory(inventoryData.bikes);

      // Fetch promos
      const promoRes = await fetch(`${API_URL}/api/promos`);
      const promoData = await promoRes.json();
      if (promoData.success) setPromos(promoData.promos);

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  async function handleRoleChange(email, newRole) {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify({ email, role: newRole })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`User role updated to ${newRole}`);
        setUsers(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDealerApproval(email, status) {
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
        toast.success(status === 'verified' ? 'Dealer approved' : 'Dealer rejected');
        // Refresh data
        fetchAdminData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update dealer status");
    } finally {
      setUpdating(false);
    }
  }

  async function handleToggleSetting(key) {
    setUpdating(true);
    try {
      const newValue = !settings[key];
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify({ [key]: newValue })
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        toast.success('Setting updated');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update setting");
    } finally {
      setUpdating(false);
    }
  }



  
  async function handleDeleteBike() {
    if (!bikeToDelete) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/bikes/${bikeToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Bike deleted successfully');
        setInventory(inventory.filter(b => b.id !== bikeToDelete.id));
        setShowDeleteConfirm(false);
        setBikeToDelete(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete bike');
    } finally {
      setUpdating(false);
    }
  }

  async function handleUpdateBike(e) {
    e.preventDefault();
    if (!editingBike) return;
    
    setUpdating(true);
    try {
      // Create a copy of the bike data and remove the immutable _id field
      const bikeUpdateData = { ...editingBike };
      delete bikeUpdateData._id;

      const res = await fetch(`${API_URL}/api/bikes/${editingBike.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify(bikeUpdateData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Bike updated successfully');
        setInventory(inventory.map(b => b.id === editingBike.id ? data.bike : b));
        setShowEditModal(false);
        setEditingBike(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update bike');
    } finally {
      setUpdating(false);
    }
  }

  // Dealer Details Modal
  const DealerDetailsModal = ({ dealer, onClose }) => {
    if (!dealer) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dealer Application Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Business Information */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-purple-600">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Business Name</p>
                  <p className="font-medium">{dealer.dealerInfo?.businessName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tax ID</p>
                  <p className="font-medium">{dealer.dealerInfo?.taxId || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Business Address</p>
                  <p className="font-medium">{dealer.dealerInfo?.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-purple-600">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contact Name</p>
                  <p className="font-medium">{dealer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-medium">{dealer.dealerInfo?.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                  <p className="font-medium">{dealer.email}</p>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-purple-600">Application Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">
                    {dealer.verificationStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submitted On</p>
                  <p className="font-medium">
                    {dealer.dealerInfo?.submittedAt 
                      ? new Date(dealer.dealerInfo.submittedAt).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">User ID</p>
                  <p className="font-medium">{dealer.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Account Created</p>
                  <p className="font-medium">
                    {dealer.createdAt 
                      ? new Date(dealer.createdAt).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  handleDealerApproval(dealer.email, 'verified');
                  onClose();
                }}
                disabled={updating}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Approve Dealer
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  handleDealerApproval(dealer.email, 'rejected');
                  onClose();
                }}
                disabled={updating}
              >
                <X className="h-4 w-4 mr-2" />
                Reject Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 break-words">Platform Administration</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Governance hub for MotruBi e-commerce platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 md:gap-6 mb-8">
         {[
           { label: "Total Revenue", value: `$${stats.totalSales.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
           { label: "User Base", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
           { label: "Total Orders", value: stats.totalOrders, icon: TrendingUp, color: "text-purple-600" },
           { label: "Global Stock", value: stats.totalInventory, icon: Briefcase, color: "text-orange-600" },
         ].map((stat, i) => (
           <Card key={i}>
             <CardContent className="p-6">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                   </div>
                   <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 relative">
        <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto scrollbar-hide snap-x snap-mandatory">
         {['users', 'approvals', 'inventory', 'offers', 'finance', 'settings'].map(tab => (
            <button  
              key={tab}
              className={`pb-2 px-3 sm:px-4 font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-purple-600 text-purple-600' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'approvals' && pendingDealers.length > 0 && (
                <span className="ml-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingDealers.length}</span>
              )}
              {tab}
            </button>
         ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white pointer-events-none md:hidden" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {activeTab === 'approvals' && (
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Dealer Approvals</CardTitle>
                    <div className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">{pendingDealers.length} PENDING</div>
                 </CardHeader>
                 <CardContent>
                    {pendingDealers.length === 0 ? (
                       <div className="text-center py-12 text-muted-foreground">
                          <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>No pending dealer applications</p>
                       </div>
                    ) : (
                       <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[640px]">
                             <thead>
                                <tr className="border-b">
                                   <th className="text-left py-3">Business Info</th>
                                   <th className="text-left py-3">Contact</th>
                                   <th className="text-left py-3">Submitted</th>
                                   <th className="text-right py-3">Actions</th>
                                </tr>
                             </thead>
                             <tbody>
                                {pendingDealers.map(dealer => (
                                   <tr key={dealer.email} className="border-b last:border-0 hover:bg-slate-50">
                                      <td className="py-4">
                                         <div className="font-bold">{dealer.dealerInfo?.businessName || 'N/A'}</div>
                                         <div className="text-xs text-muted-foreground">Tax ID: {dealer.dealerInfo?.taxId || 'N/A'}</div>
                                      </td>
                                      <td className="py-4">
                                         <div className="font-medium">{dealer.name}</div>
                                         <div className="text-xs text-muted-foreground">{dealer.email}</div>
                                         <div className="text-xs text-muted-foreground">{dealer.dealerInfo?.phone || 'N/A'}</div>
                                      </td>
                                      <td className="py-4 text-xs text-muted-foreground">
                                         {dealer.dealerInfo?.submittedAt ? new Date(dealer.dealerInfo.submittedAt).toLocaleDateString() : 'N/A'}
                                      </td>
                                                                            <td className="py-4 text-right">
                                         <div className="flex gap-2 justify-end">
                                            <Button
                                               size="sm"
                                               variant="outline"
                                               className="text-blue-700 border-blue-300 hover:bg-blue-50"
                                               onClick={() => {
                                                 setSelectedDealer(dealer);
                                                 setShowDetailsModal(true);
                                               }}
                                            >
                                               <Eye className="h-4 w-4 mr-1" />
                                               View
                                            </Button>
                                            <Button
                                               size="sm"
                                               variant="outline"
                                               className="text-green-700 border-green-300 hover:bg-green-50"
                                               onClick={() => handleDealerApproval(dealer.email, 'verified')}
                                               disabled={updating}
                                            >
                                               Approve
                                            </Button>
                                            <Button
                                               size="sm"
                                               variant="outline"
                                               className="text-red-700 border-red-300 hover:bg-red-50"
                                               onClick={() => handleDealerApproval(dealer.email, 'rejected')}
                                               disabled={updating}
                                            >
                                               Reject
                                            </Button>
                                         </div>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    )}
                 </CardContent>
               </Card>
            )}

            {activeTab === 'users' && (
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Identity Management</CardTitle>
                    <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">RBAC ACTIVE</div>
                 </CardHeader>
                 <CardContent>
                    <div className="overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch">
                       <table className="w-full text-sm min-w-[500px]">
                          <thead>
                             <tr className="border-b">
                                <th className="text-left py-3">User</th>
                                <th className="text-left py-3">Current Role</th>
                                <th className="text-right py-3">Actions</th>
                             </tr>
                          </thead>
                          <tbody>
                             {users.map(u => (
                                <tr key={u.email} className="border-b last:border-0 hover:bg-slate-50">
                                   <td className="py-4">
                                      <div className="font-bold">{u.name}</div>
                                      <div className="text-xs text-muted-foreground">{u.email}</div>
                                   </td>
                                   <td className="py-4">
                                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block uppercase ${
                                         u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                         u.role === 'merchandiser' ? 'bg-purple-100 text-purple-700' :
                                         u.role === 'dealer' ? 'bg-blue-100 text-blue-700' :
                                         'bg-slate-100 text-slate-700'
                                      }`}>
                                         {u.role}
                                      </div>
                                   </td>
                                   <td className="py-4 text-right">
                                      <select 
                                        className="text-xs border rounded p-1 outline-none"
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.email, e.target.value)}
                                        disabled={u.email === user.email || updating}
                                      >
                                         <option value="user">Customer</option>
                                         <option value="dealer">Dealer</option>
                                         <option value="merchandiser">Merchandiser</option>
                                         <option value="admin">Administrator</option>
                                      </select>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </CardContent>
               </Card>
            )}

            {activeTab === 'offers' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Promotional Offers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Promo Form */}
                  <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
                    <h3 className="font-bold text-sm">Create New Offer</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="Code (e.g., SUMMER50)" 
                        value={newPromo.code}
                        onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                      />
                      <Input 
                        type="number" 
                        placeholder="Discount Amount" 
                        value={newPromo.discount}
                        onChange={e => setNewPromo({...newPromo, discount: Number(e.target.value)})}
                      />
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={newPromo.type}
                        onChange={e => setNewPromo({...newPromo, type: e.target.value})}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                      <Input 
                        placeholder="Description" 
                        value={newPromo.description}
                        onChange={e => setNewPromo({...newPromo, description: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={async () => {
                        setUpdating(true);
                        try {
                          const res = await fetch(`${API_URL}/api/admin/promos`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.email}` },
                            body: JSON.stringify(newPromo)
                          });
                          const data = await res.json();
                          if (data.success) {
                            toast.success("Promo created");
                            setPromos([...promos, data.promo]);
                            setNewPromo({ code: '', discount: '', type: 'percentage', description: '' });
                          } else {
                            toast.error(data.message);
                          }
                        } finally {
                          setUpdating(false);
                        }
                      }}
                      disabled={updating}
                    >
                      Create Promo Code
                    </Button>
                  </div>

                  {/* Promo List */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm">Active Promotions</h3>
                    {promos.map(promo => (
                      <div key={promo.code} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-bold text-purple-600 tracking-wider">{promo.code}</div>
                          <div className="text-sm text-slate-500">{promo.description}</div>
                          <div className="text-xs bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                            {promo.type === 'percentage' ? `${promo.discount}% OFF` : `$${promo.discount} OFF`}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (!confirm('Are you sure?')) return;
                            setUpdating(true);
                            try {
                              const res = await fetch(`${API_URL}/api/admin/promos/${promo.code}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${user.email}` }
                              });
                              if (res.ok) {
                                toast.success("Promo deleted");
                                setPromos(promos.filter(p => p.code !== promo.code));
                              }
                            } finally {
                              setUpdating(false);
                            }
                          }}
                          disabled={updating}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'finance' && (
               <Card>
                 <CardHeader><CardTitle>Platform Revenue Analytics</CardTitle></CardHeader>
                 <CardContent className="h-64 flex items-center justify-center bg-slate-50 border border-dashed rounded-xl m-4">
                    <div className="text-center">
                       <BarChart className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                       <p className="text-sm text-slate-400">Financial charting module active in Phase 13</p>
                       <p className="text-[10px] font-bold text-purple-600 mt-1 uppercase tracking-widest">Aggregate Sales: ${stats.totalSales.toLocaleString()}</p>
                    </div>
                 </CardContent>
               </Card>
            )}


            {activeTab === 'inventory' && (
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Product Inventory</CardTitle>
                    <div className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">{inventory.length} BIKES</div>
                 </CardHeader>
                 <CardContent>
                    <div className="overflow-x-auto">
                       <table className="w-full text-sm">
                          <thead>
                             <tr className="border-b">
                                <th className="text-left py-3">Bike</th>
                                <th className="text-left py-3">Category</th>
                                <th className="text-left py-3">Price</th>
                                <th className="text-left py-3">Stock</th>
                                <th className="text-right py-3">Actions</th>
                             </tr>
                          </thead>
                          <tbody>
                             {inventory.map(bike => (
                                <tr key={bike.id} className="border-b last:border-0 hover:bg-slate-50">
                                   <td className="py-4">
                                      <div className="flex items-center gap-3">
                                         <img src={bike.image} alt={bike.name} className="w-16 h-16 object-cover rounded" />
                                         <div>
                                            <div className="font-bold">{bike.name}</div>
                                            <div className="text-xs text-muted-foreground">ID: {bike.id}</div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="py-4">{bike.category}</td>
                                   <td className="py-4 font-bold text-purple-600">${bike.price.toLocaleString()}</td>
                                   <td className="py-4">{bike.stock}</td>
                                   <td className="py-4 text-right">
                                      <div className="flex gap-2 justify-end">
                                         <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-700 border-blue-300 hover:bg-blue-50"
                                            onClick={() => {
                                               setEditingBike(bike);
                                               setShowEditModal(true);
                                            }}
                                         >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                         </Button>
                                         <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-700 border-red-300 hover:bg-red-50"
                                            onClick={() => {
                                               setBikeToDelete(bike);
                                               setShowDeleteConfirm(true);
                                            }}
                                         >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
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
            )}

            {activeTab === 'settings' && (
               <div className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle>Global Platform Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                          <div>
                             <p className="font-bold">Maintenance Mode</p>
                             <p className="text-xs text-muted-foreground">Toggles platform visibility for public users</p>
                          </div>
                          <button
                              onClick={() => handleToggleSetting('maintenanceMode')}
                              disabled={updating}
                              className={`relative h-6 w-11 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-purple-600' : 'bg-slate-200'} ${updating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                           >
                              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-5' : ''}`}></div>
                           </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                           <div>
                              <p className="font-bold">Dealer Auto-Approval</p>
                              <p className="text-xs text-muted-foreground">Skip manual vetting for specific documentation</p>
                           </div>
                           <button
                              onClick={() => handleToggleSetting('dealerAutoApproval')}
                              disabled={updating}
                              className={`relative h-6 w-11 rounded-full transition-colors ${settings.dealerAutoApproval ? 'bg-purple-600' : 'bg-slate-200'} ${updating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                           >
                              <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.dealerAutoApproval ? 'translate-x-5' : ''}`}></div>
                           </button>
                        </div>
                     </CardContent>
                   </Card>
                </div>
             )}
          </div>

          <div className="space-y-6">
             <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
                <CardContent className="p-6">
                   <ShieldCheck className="h-10 w-10 text-emerald-400 mb-4" />
                   <h4 className="text-lg font-bold mb-2">Security Perimeter</h4>
                   <p className="text-xs text-slate-400 mb-6">SSL Encryption active with 256-bit hashing on all PII data. RBAC policies verified.</p>
                   <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10 uppercase text-[10px] font-bold tracking-widest">Auditing Logs</Button>
                </CardContent>
             </Card>

             <Card>
                <CardHeader><CardTitle className="text-sm">Platform Health</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                   <div className="flex items-center gap-3 text-xs">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="font-medium">Core API Layer: OPERATIONAL</span>
                   </div>
                   <div className="flex items-center gap-3 text-xs">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="font-medium">Database Persistence: NOMINAL</span>
                   </div>
                   <div className="flex items-center gap-3 text-xs">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      <span className="font-medium">Email Mock Server: ACTIVE</span>
                   </div>
                </CardContent>
             </Card>
          </div>
       </div>


      {/* Edit Bike Modal */}
      {showEditModal && editingBike && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Bike</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateBike} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bike Name</label>
                  <Input value={editingBike.name} onChange={(e) => setEditingBike({...editingBike, name: e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input value={editingBike.category} onChange={(e) => setEditingBike({...editingBike, category: e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input type="number" value={editingBike.price} onChange={(e) => setEditingBike({...editingBike, price: parseFloat(e.target.value)})} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input type="number" value={editingBike.stock} onChange={(e) => setEditingBike({...editingBike, stock: parseInt(e.target.value)})} required />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input value={editingBike.description} onChange={(e) => setEditingBike({...editingBike, description: e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Engine</label>
                  <Input value={editingBike.engine} onChange={(e) => setEditingBike({...editingBike, engine: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Power</label>
                  <Input value={editingBike.power} onChange={(e) => setEditingBike({...editingBike, power: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Top Speed</label>
                  <Input value={editingBike.topSpeed} onChange={(e) => setEditingBike({...editingBike, topSpeed: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Weight</label>
                  <Input value={editingBike.weight} onChange={(e) => setEditingBike({...editingBike, weight: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && bikeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Delete Bike</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-bold">{bikeToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {setShowDeleteConfirm(false); setBikeToDelete(null);}}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDeleteBike} disabled={updating}>
                {updating ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dealer Details Modal */}
      {showDetailsModal && (
        <DealerDetailsModal 
          dealer={selectedDealer} 
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDealer(null);
          }}
        />
      )}
    </div>
  );
}