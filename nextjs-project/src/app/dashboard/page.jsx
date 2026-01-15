"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";
import DealerDashboard from "@/components/dashboard/DealerDashboard";
import MerchandiserDashboard from "@/components/dashboard/MerchandiserDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const role = session.user.role || "customer";

  switch (role) {
    case "dealer":
      return <DealerDashboard user={session.user} />;
    case "merchandiser":
      return <MerchandiserDashboard user={session.user} />;
    case "admin":
      return <AdminDashboard user={session.user} />;
    default:
      return <CustomerDashboard user={session.user} />;
  }
}
