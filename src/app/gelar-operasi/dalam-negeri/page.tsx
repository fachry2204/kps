import DalamNegeriClient from "@/components/operations/DalamNegeriClient";
import { getOpsDalamNegeri } from "@/app/actions";

export default async function DalamNegeriPage() {
  const operations = await getOpsDalamNegeri();
  
  return (
    <div className="p-6">
      <DalamNegeriClient initialOperations={operations} />
    </div>
  );
}
