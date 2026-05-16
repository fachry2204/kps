import { getLogistics, getOperationAssetsTotal } from "../actions";
import LogisticsClient from "@/components/logistics/LogisticsClient";

export default async function LogisticsPage() {
  const items = await getLogistics();
  const opAssetsTotal = await getOperationAssetsTotal();

  return <LogisticsClient items={items} operationAssetsTotal={opAssetsTotal} />;
}
