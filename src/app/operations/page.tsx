import { getOperations } from "../actions";
import OperationsClient from "@/components/operations/OperationsClient";

export default async function OperationsPage() {
  const operations = await getOperations();

  return <OperationsClient operations={operations} />;
}
