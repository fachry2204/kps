import { getLogistics } from "../actions";
import LogisticsClient from "@/components/logistics/LogisticsClient";

export default async function LogisticsPage() {
  const items = await getLogistics();

  return <LogisticsClient items={items} />;
}
