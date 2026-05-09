import { getIntelReports } from "../actions";
import IntelClient from "@/components/intel/IntelClient";

export default async function IntelPage() {
  const reports = await getIntelReports();

  return <IntelClient reports={reports} />;
}

