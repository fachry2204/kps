import { getPersonnel, getOpsDalamNegeri, getOpsLuarNegeri, getIntelReports, getLogistics } from "../actions";
import StatistikClient from "@/components/statistik/StatistikClient";

export default async function StatistikPage() {
  const personnel = await getPersonnel();
  const opsDalamNegeri = await getOpsDalamNegeri();
  const opsLuarNegeri = await getOpsLuarNegeri();
  const intel = await getIntelReports();
  const logistics = await getLogistics();

  return (
    <StatistikClient 
      personnel={personnel}
      opsDalamNegeri={opsDalamNegeri}
      opsLuarNegeri={opsLuarNegeri}
      intel={intel}
      logistics={logistics}
    />
  );
}
