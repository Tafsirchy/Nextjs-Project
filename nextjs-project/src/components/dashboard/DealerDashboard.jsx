import { API_URL } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  TrendingUp, 
  Award, 
  ShoppingCart, 
  ArrowRight, 
  DollarSign, 
  Calculator, 
  CreditCard, 
  LayoutDashboard, 
  CheckCircle,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Edit,
  Trash2,
  X
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/contexts/CartContext";
import jsPDF from "jspdf";

import Image from "next/image";

export default function DealerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalWholesaleOrders: 0,
    totalSpent: 0,
    totalSavings: 0,
    activeTier: "Tier 1",
    creditLimit: 50000,
    usedCredit: 12500,
    isVerified: user.isVerified || false,
    verificationStatus: user.verificationStatus || 'unverified'
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState({
    businessName: "",
    taxId: "",
    address: "",
    phone: ""
  });
  const [inventory, setInventory] = useState([]);
  const [editingBike, setEditingBike] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState(null);

  // Calculator State
  const [calcBikeId, setCalcBikeId] = useState("");
  const [calcQty, setCalcQty] = useState(1);
  
  // Bulk Order State
  const [bulkItems, setBulkItems] = useState({});
  
  // Billing Statements State
  const [statements, setStatements] = useState([]);
  const [loadingStatements, setLoadingStatements] = useState(false);

  const { addToCart } = useCart();

  const fetchDealerData = useCallback(async () => {
    try {
      const [ordersRes, bikesRes, inventoryRes] = await Promise.all([
        fetch(`${API_URL}/api/orders`, {
          headers: { 'Authorization': `Bearer ${user.email}` }
        }),
        fetch(`${API_URL}/api/bikes`),
        fetch(`${API_URL}/api/bikes/my-inventory`, {
          headers: { 'Authorization': `Bearer ${user.email}` }
        })
      ]);

      const ordersData = await ordersRes.json();
      const bikesData = await bikesRes.json();

      if (ordersData.success) {
        setRecentOrders(ordersData.orders);
        const totalWholesaleOrders = ordersData.orders.length;
        const totalSpent = ordersData.orders.reduce((sum, o) => sum + o.total, 0);
        const totalSavings = totalSpent * 0.15; 

        let activeTier = "Tier 1";
        if (totalWholesaleOrders > 20) activeTier = "Tier 4";
        else if (totalWholesaleOrders > 10) activeTier = "Tier 3";
        else if (totalWholesaleOrders > 5) activeTier = "Tier 2";

        setStats(prev => ({
          ...prev,
          totalWholesaleOrders,
          totalSpent,
          totalSavings,
          activeTier
        }));
      }

      if (bikesData.success) {
        setBikes(bikesData.bikes);
        // Initialize bulk items state
        const initialBulk = {};
        bikesData.bikes.forEach(b => { initialBulk[b.id] = 0; });
        setBulkItems(initialBulk);
      }

      const inventoryData = await inventoryRes.json();
      if (inventoryData.success) {
        setInventory(inventoryData.bikes);
      }
    } catch (error) {
      console.error("Error fetching dealer data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  const fetchStatements = useCallback(async () => {
    setLoadingStatements(true);
    try {
      const res = await fetch(`${API_URL}/api/dealer/statements`, {
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatements(data.statements || []);
      } else {
        console.error('Failed to fetch statements:', data.message);
      }
    } catch (error) {
      console.error('Error fetching statements:', error);
    } finally {
      setLoadingStatements(false);
    }
  }, [user.email]);

  useEffect(() => {
    fetchDealerData();
    fetchStatements();
  }, [fetchDealerData, fetchStatements]);


  const handleDownloadStatement = (statement) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('MotruBi', 20, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Premium Motorcycles - Dealer Billing Statement', 20, 30);
      
      // Statement Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`${statement.monthName} Statement`, 20, 55);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Statement Date: ${new Date().toLocaleDateString()}`, 20, 65);
      doc.text(`Due Date: ${new Date(statement.dueDate).toLocaleDateString()}`, 20, 72);
      doc.text(`Terms: NET-30`, 20, 79);
      
      // Dealer Info
      doc.setFont(undefined, 'bold');
      doc.text('Dealer Information', 20, 92);
      doc.setFont(undefined, 'normal');
      doc.text(`Email: ${user.email}`, 20, 99);
      doc.text(`Account: Verified Dealer`, 20, 106);
      
      // Order Summary Box
      doc.setFillColor(248, 249, 250);
      doc.rect(20, 120, 170, 40, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, 120, 170, 40, 'S');
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Order Summary', 25, 130);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Orders: ${statement.orderCount}`, 25, 140);
      doc.text(`Total Amount: $${statement.totalAmount.toLocaleString()}`, 25, 147);
      doc.text(`Wholesale Savings: $${statement.totalSavings?.toLocaleString() || '0'}`, 25, 154);
      
      // Orders Table
      doc.setFont(undefined, 'bold');
      doc.text('Order Details', 20, 175);
      
      // Table Header
      doc.setFillColor(102, 126, 234);
      doc.rect(20, 180, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('Order #', 25, 186);
      doc.text('Date', 70, 186);
      doc.text('Items', 110, 186);
      doc.text('Amount', 150, 186);
      
      // Table Rows
      doc.setTextColor(0, 0, 0);
      let yPos = 196;
      
      statement.orders.slice(0, 10).forEach((order, idx) => {
        if (yPos > 270) return; // Prevent overflow
        
        if (idx % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(20, yPos - 5, 170, 8, 'F');
        }
        
        doc.text(order.orderNumber || 'N/A', 25, yPos);
        doc.text(new Date(order.date).toLocaleDateString(), 70, yPos);
        doc.text(String(order.itemCount || 0), 110, yPos);
        doc.text(`$${order.total.toLocaleString()}`, 150, yPos);
        
        yPos += 8;
      });
      
      if (statement.orders.length > 10) {
        doc.setFont(undefined, 'italic');
        doc.setFontSize(8);
        doc.text(`... and ${statement.orders.length - 10} more orders`, 25, yPos);
        yPos += 8;
      }
      
      // Total
      yPos += 5;
      doc.setDrawColor(102, 126, 234);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Total Due:', 130, yPos);
      doc.text(`$${statement.totalAmount.toLocaleString()}`, 160, yPos);
      
      // Footer
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', 105, 285, { align: 'center' });
      doc.text('For questions, contact: support@motrubi.com', 105, 290, { align: 'center' });
      
      // Save PDF
      doc.save(`statement-${statement.month}.pdf`);
      toast.success('Statement downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/dealer/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify(verificationData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setStats(prev => ({ ...prev, verificationStatus: 'pending' }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const updateBulkQty = (id, delta) => {
    setBulkItems(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const handleBulkAddToCart = async () => {
    const itemsToAdd = Object.entries(bulkItems).filter(([_, qty]) => qty > 0);
    if (itemsToAdd.length === 0) {
      toast.error("Please select quantities first");
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    for (const [id, qty] of itemsToAdd) {
      const bike = bikes.find(b => b.id === id);
      const success = await addToCart(bike, qty);
      if (success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`Added ${successCount} types of bikes to cart`);
      // Reset bulk selections
      const resetBulk = { ...bulkItems };
      Object.keys(resetBulk).forEach(k => resetBulk[k] = 0);
      setBulkItems(resetBulk);
    }
    setSubmitting(false);
  };


  async function handleDeleteBike() {
    if (!bikeToDelete) return;
    
    setSubmitting(true);
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
      setSubmitting(false);
    }
  }

  async function handleUpdateBike(e) {
    e.preventDefault();
    if (!editingBike) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/bikes/${editingBike.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify(editingBike)
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
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  const selectedBike = bikes.find(b => b.id === calcBikeId);
  const getDiscount = (qty) => {
    if (qty >= 21) return 0.25;
    if (qty >= 11) return 0.20;
    if (qty >= 6) return 0.15;
    return 0.10;
  };
  const discountRate = getDiscount(calcQty);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'bulk', label: 'Bulk Order', icon: ShoppingCart },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'billing', label: 'Billing & Credit', icon: CreditCard },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dealer Portal</h1>
          <p className="text-muted-foreground">
            {stats.isVerified 
              ? "Manage your wholesale account and inventory" 
              : "Complete your verification to access wholesale benefits"}
          </p>
        </div>
        <div className={`flex items-center gap-3 border p-4 rounded-xl ${
          stats.isVerified ? "bg-green-50 border-green-200" : stats.verificationStatus === 'pending' ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"
        }`}>
          <Award className={`h-8 w-8 ${stats.isVerified ? "text-green-600" : stats.verificationStatus === 'pending' ? "text-yellow-600" : "text-red-600"}`} />
          <div>
            <div className={`text-xs font-bold uppercase ${stats.isVerified ? "text-green-700" : stats.verificationStatus === 'pending' ? "text-yellow-700" : "text-red-700"}`}>
              {stats.isVerified ? "Active Status" : "Verification Status"}
            </div>
            <div className={`font-bold ${stats.isVerified ? "text-green-900" : stats.verificationStatus === 'pending' ? "text-yellow-900" : "text-red-900"}`}>
              {stats.isVerified ? `${stats.activeTier} Partner` : stats.verificationStatus.charAt(0).toUpperCase() + stats.verificationStatus.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex overflow-x-auto gap-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {!stats.isVerified && stats.verificationStatus !== 'pending' && activeTab === 'overview' && (
        <Card className="mb-8 border-red-100 bg-red-50/30">
          <CardHeader><CardTitle className="text-xl text-red-900">Dealer Verification Required</CardTitle></CardHeader>
          <CardContent>
            <p className="text-red-800 mb-6 font-medium">To access wholesale pricing (10-25% off) and specialized dealer tools, please provide your business details for verification.</p>
            <form onSubmit={handleVerificationSubmit} className="grid md:grid-cols-2 gap-4">
              <Input placeholder="Business Name" required value={verificationData.businessName} onChange={(e) => setVerificationData({...verificationData, businessName: e.target.value})} />
              <Input placeholder="Tax ID / VAT Number" required value={verificationData.taxId} onChange={(e) => setVerificationData({...verificationData, taxId: e.target.value})} />
              <Input placeholder="Business Address" required value={verificationData.address} onChange={(e) => setVerificationData({...verificationData, address: e.target.value})} />
              <Input placeholder="Phone Number" required value={verificationData.phone} onChange={(e) => setVerificationData({...verificationData, phone: e.target.value})} />
              <Button type="submit" className="md:col-span-2 bike-gradient-alt text-white border-0 py-6 text-lg font-bold" disabled={submitting}>
                {submitting ? "Processing..." : "Submit for Professional Verification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {stats.verificationStatus === 'pending' && activeTab === 'overview' && (
        <Card className="mb-8 border-yellow-100 bg-yellow-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-yellow-800">
               <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center animate-pulse"><Clock className="h-6 w-6" /></div>
               <p className="font-medium">Application Received: Our underwriting team is currently reviewing your credentials. Standard verification takes 24-48 hours. Wholesale benefits will activate immediately upon approval.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 ${!stats.isVerified ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            {/* Stats Cards ... similar to before but styled better */}
            {[
              { label: "Wholesale Orders", val: stats.totalWholesaleOrders, icon: Package, color: "purple" },
              { label: "Fleet Value", val: `$${stats.totalSpent.toLocaleString()}`, icon: TrendingUp, color: "blue" },
              { label: "Wholesale Savings", val: `$${stats.totalSavings.toLocaleString()}`, icon: DollarSign, color: "green" },
              { label: "Profit realized", val: "22.4%", icon: Award, color: "orange" },
            ].map((s, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                       <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">{s.label}</p>
                       <p className="text-3xl font-bold">{s.val}</p>
                    </div>
                    <div className={`h-12 w-12 bg-${s.color}-50 rounded-xl flex items-center justify-center text-${s.color}-600`}>
                       <s.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-sm">
                   <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
                      <CardTitle className="text-lg">Fleet Management History</CardTitle>
                      <Link href="/my-orders"><Button variant="ghost" size="sm" className="text-purple-600 font-bold">Full Archive</Button></Link>
                   </CardHeader>
                   <CardContent className="p-0">
                      {recentOrders.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">No transaction history found</div>
                      ) : (
                        <div className="divide-y">
                           {recentOrders.slice(0, 5).map(order => (
                             <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                   <div className="font-bold">#ORD-{order.orderNumber}</div>
                                   <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                   <div className="font-bold text-slate-900">${order.total.toLocaleString()}</div>
                                   <div className="text-[10px] uppercase font-bold text-green-600">{order.status}</div>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </CardContent>
                </Card>
             </div>
             
             <div className="space-y-6">
                <Card className="border-0 bg-slate-900 text-white shadow-xl overflow-hidden">
                   <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Corporate Credit</p>
                            <h3 className="text-2xl font-bold mt-1 text-emerald-400">${(stats.creditLimit - stats.usedCredit).toLocaleString()}</h3>
                         </div>
                         <CreditCard className="h-10 w-10 text-slate-700" />
                      </div>
                      <div className="space-y-2 mb-6">
                         <div className="flex justify-between text-xs font-bold">
                            <span>Usage</span>
                            <span>{Math.round((stats.usedCredit / stats.creditLimit) * 100)}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(stats.usedCredit / stats.creditLimit) * 100}%` }} />
                         </div>
                      </div>
                      <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold border-0" onClick={() => setActiveTab('billing')}>
                         Request Increase
                      </Button>
                   </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                   <CardHeader><CardTitle className="text-sm uppercase tracking-[0.2em] text-slate-400">Exclusive Tools</CardTitle></CardHeader>
                   <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-between group" onClick={() => setActiveTab('bulk')}>
                         <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-purple-600" /> Bulk Order Interface</span>
                         <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                      <Button variant="outline" className="w-full justify-between group" onClick={() => setActiveTab('calculator')}>
                         <span className="flex items-center gap-2"><Calculator className="h-4 w-4 text-purple-600" /> Tier Calculator</span>
                         <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                   </CardContent>
                </Card>
             </div>
          </div>
        </div>
      )}


      {activeTab === 'inventory' && (
         <Card className="border-0 shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">My Product Inventory</CardTitle>
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
                                   <Image src={bike.image} alt={bike.name} width={64} height={64} className="w-16 h-16 object-cover rounded" />
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

      {activeTab === 'bulk' && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b">
             <div>
                <CardTitle>Bulk Inventory Replenishment</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 text-sans">Select quantities for multiple units to add them to your fleet procurement in one batch.</p>
             </div>
             <Button className="bike-gradient-alt text-white border-0 px-8" onClick={handleBulkAddToCart} disabled={submitting}>
                Add Selected to Batch Process
             </Button>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto font-sans">
                <table className="w-full text-sm">
                   <thead className="bg-slate-50 border-b">
                      <tr>
                         <th className="text-left py-4 px-6 uppercase tracking-wider text-[10px] text-slate-500 font-bold">Product Details</th>
                         <th className="text-left py-4 px-6 uppercase tracking-wider text-[10px] text-slate-500 font-bold">Base Price</th>
                         <th className="text-left py-4 px-6 uppercase tracking-wider text-[10px] text-slate-500 font-bold">Qty in Showroom</th>
                         <th className="text-center py-4 px-6 uppercase tracking-wider text-[10px] text-slate-500 font-bold">Wholesale Qty</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {bikes.map(bike => (
                        <tr key={bike.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <Image src={bike.image} alt={bike.name} width={56} height={40} className="h-10 w-14 object-cover rounded shadow-sm border" />
                                 <div>
                                    <div className="font-bold text-slate-900">{bike.name}</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{bike.category}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6">
                              <div className="font-bold">${bike.price.toLocaleString()}</div>
                              <div className="text-[10px] text-green-600 font-bold">Eligible for {stats.activeTier} Discount</div>
                           </td>
                           <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bike.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                 {bike.stock} units
                              </span>
                           </td>
                           <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-3">
                                 <button className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100" onClick={() => updateBulkQty(bike.id, -1)}><Minus className="h-3 w-3" /></button>
                                 <span className="w-8 text-center font-bold text-base">{bulkItems[bike.id] || 0}</span>
                                 <button className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-purple-600" onClick={() => updateBulkQty(bike.id, 1)}><Plus className="h-3 w-3" /></button>
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

      {activeTab === 'calculator' && (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input & Configuration Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Calculator className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Wholesale Configuration</CardTitle>
                      <p className="text-slate-400 text-xs mt-1">Configure your procurement volume and analyze discounted pricing.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        Product Selection
                      </label>
                      <div className="relative">
                        <select 
                          className="w-full h-14 pl-4 pr-10 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none appearance-none transition-all hover:border-slate-300"
                          value={calcBikeId}
                          onChange={(e) => setCalcBikeId(e.target.value)}
                        >
                          <option value="">-- Select Bike Model --</option>
                          {bikes.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronRight className="h-4 w-4 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        Unit Quantity
                      </label>
                      <div className="flex items-center gap-3 h-14 bg-slate-50/50 rounded-xl border border-slate-200 px-4">
                        <button 
                          className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 flex items-center justify-center transition-all"
                          onClick={() => setCalcQty(Math.max(1, calcQty - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <Input 
                          type="number" 
                          min="1" 
                          value={calcQty} 
                          onChange={(e) => setCalcQty(parseInt(e.target.value) || 1)} 
                          className="border-0 bg-transparent text-center font-bold text-lg focus-visible:ring-0 px-0 h-auto"
                        />
                        <button 
                          className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 flex items-center justify-center transition-all text-purple-600"
                          onClick={() => setCalcQty(calcQty + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedBike ? (
                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-6 animate-in zoom-in-95 duration-300">
                      <Image 
                        src={selectedBike.image} 
                        alt={selectedBike.name} 
                        width={120} 
                        height={80} 
                        className="rounded-xl shadow-md border bg-white object-cover aspect-[3/2]" 
                      />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">{selectedBike.category}</div>
                        <h4 className="text-xl font-bold text-slate-900">{selectedBike.name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-slate-500">MSRP: <span className="text-slate-900 font-bold">${selectedBike.price.toLocaleString()}</span></span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="text-sm font-medium text-slate-500">In Stock: <span className="text-slate-900 font-bold">{selectedBike.stock} units</span></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[120px] rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-400 text-sm italic">
                      Select a bike model to begin procurement analysis
                    </div>
                  )}

                  <div className="grid md:grid-cols-4 gap-4 pt-4">
                    {[
                      { name: "Tier 1", qty: "1-5", off: 0.10 },
                      { name: "Tier 2", qty: "6-10", off: 0.15 },
                      { name: "Tier 3", qty: "11-20", off: 0.20 },
                      { name: "Tier 4", qty: "21+", off: 0.25 },
                    ].map((t, i) => {
                      const isActive = discountRate === t.off;
                      return (
                        <div 
                          key={i} 
                          className={`relative p-4 rounded-xl border transition-all duration-300 ${
                            isActive 
                              ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-200 -translate-y-1' 
                              : 'bg-white border-slate-100'
                          }`}
                        >
                          <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>{t.name}</div>
                          <div className={`text-xl font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>{Math.round(t.off * 100)}% <span className="text-xs opacity-60">OFF</span></div>
                          <div className={`text-[10px] mt-1 ${isActive ? 'text-purple-100' : 'text-slate-500'}`}>{t.qty} units</div>
                          {isActive && (
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                              <CheckCircle className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary & Actions Section */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-slate-900 text-white overflow-hidden">
                <CardHeader className="border-b border-slate-800 p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Financial Impact</CardTitle>
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Gross Procurement (MSRP)</span>
                      <span className="font-bold font-mono">${((selectedBike?.price || 0) * calcQty).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Wholesale Savings</span>
                      <span className="font-bold font-mono text-emerald-400">-${(((selectedBike?.price || 0) * calcQty) * discountRate).toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Effective Wholesale Total</span>
                        <span className="text-3xl font-bold font-mono text-white tracking-tighter">
                          ${(((selectedBike?.price || 0) * calcQty) * (1 - discountRate)).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[10px] font-black">
                        -{Math.round(discountRate * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <Award className="h-4 w-4 text-purple-400" />
                      <span>Profit Projection (Estimate)</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-emerald-400">${(((selectedBike?.price || 0) * calcQty) * discountRate).toLocaleString()}</span>
                      <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-tighter">Projected margin realized upon retail sale at MSRP</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button 
                      className="w-full h-14 bg-white text-slate-900 hover:bg-slate-100 font-black text-sm uppercase tracking-widest border-0 flex items-center justify-center gap-2"
                      disabled={!selectedBike || submitting}
                      onClick={async () => {
                        if (!selectedBike) return;
                        setSubmitting(true);
                        const success = await addToCart(selectedBike, calcQty);
                        if (success) {
                          toast.success("Procurement order added to batch");
                        }
                        setSubmitting(false);
                      }}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {submitting ? "Initiating..." : "Initiate Batch Order"}
                    </Button>
                    <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest">
                      Price lock guaranteed for 15 minutes
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Need Custom Fleet Pricing?</h5>
                      <p className="text-xs text-slate-500 mt-1">Ordering over 50 units? Contact your regional merchandiser for hyper-wholesale quotes.</p>
                      <button className="text-blue-600 text-xs font-bold mt-2 hover:underline">Request Contact</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
           <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle>Credit Utilization Portfolio</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex flex-col md:flex-row gap-8 mb-8">
                    <div className="flex-1 p-6 bg-slate-50 rounded-2xl">
                       <p className="text-xs font-bold text-slate-400 uppercase mb-1">Approved Line of Credit</p>
                       <p className="text-3xl font-bold text-slate-900">${stats.creditLimit.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 p-6 bg-slate-50 rounded-2xl">
                       <p className="text-xs font-bold text-slate-400 uppercase mb-1">Currently Outstanding</p>
                       <p className="text-3xl font-bold text-purple-600">${stats.usedCredit.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Net Terms</p>
                       <p className="text-3xl font-bold text-emerald-700 flex items-center gap-2">NET-30 <CheckCircle className="h-5 w-5" /></p>
                    </div>
                 </div>
                 
                 <h4 className="font-bold mb-4">Upcoming Statements</h4>
                 {loadingStatements ? (
                   <div className="p-8 text-center">
                     <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                     <p className="text-sm text-muted-foreground mt-2">Loading statements...</p>
                   </div>
                 ) : statements.length === 0 ? (
                   <div className="p-8 text-center text-muted-foreground">
                     <p className="text-sm">No billing statements available yet.</p>
                     <p className="text-xs mt-1">Statements will appear here after you place orders.</p>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {statements.map((statement) => {
                       const monthAbbr = new Date(statement.month + '-01').toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                       return (
                         <div key={statement.month} className="p-4 border rounded-xl flex items-center justify-between hover:border-purple-200 transition-colors">
                           <div className="flex items-center gap-4">
                             <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                               {monthAbbr}
                             </div>
                             <div>
                               <div className="font-bold">{statement.monthName} Procurement Statement</div>
                               <div className="text-xs text-slate-400">
                                 {statement.orderCount} order{statement.orderCount !== 1 ? 's' : ''} • ${statement.totalAmount.toLocaleString()} • 
                                 {statement.isPastDue ? (
                                   <span className="text-red-600 ml-1">Past due</span>
                                 ) : (
                                   <span className="ml-1">Due in {statement.daysUntilDue} days</span>
                                 )}
                               </div>
                             </div>
                           </div>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={() => handleDownloadStatement(statement)}
                           >
                             Download PDF
                           </Button>
                         </div>
                       );
                     })}
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      )}

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
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
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
              <Button variant="destructive" className="flex-1" onClick={handleDeleteBike} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

