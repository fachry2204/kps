import LuarNegeriClient from "@/components/operations/LuarNegeriClient";
import { getOperations } from "@/app/actions";

export default async function LuarNegeriPage() {
  const operations = await getOperations();
  
  return (
    <div className="p-6">
      <LuarNegeriClient initialOperations={operations} />
    </div>
  );
}
