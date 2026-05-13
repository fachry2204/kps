import { getDashboardStats } from "../actions";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { unstable_noStore as noStore } from 'next/cache';

export default async function Dashboard() {
  noStore();
  const stats = await getDashboardStats();

  return <DashboardClient stats={stats} />;
}
