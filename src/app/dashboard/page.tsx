import { getDashboardStats, getPersonnel, getOpsDalamNegeri, getOpsLuarNegeri, getIntelReports, getLogistics } from "../actions";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { unstable_noStore as noStore } from 'next/cache';

export default async function Dashboard() {
  noStore();
  const stats = await getDashboardStats();
  const personnel = await getPersonnel();
  const opsDalamNegeri = await getOpsDalamNegeri();
  const opsLuarNegeri = await getOpsLuarNegeri();
  const intel = await getIntelReports();
  const logistics = await getLogistics();

  return (
    <DashboardClient 
      stats={stats} 
      personnel={personnel}
      opsDalamNegeri={opsDalamNegeri}
      opsLuarNegeri={opsLuarNegeri}
      intel={intel}
      logistics={logistics}
    />
  );
}
