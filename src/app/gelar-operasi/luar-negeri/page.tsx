import LuarNegeriClient from "../../../components/operations/LuarNegeriClient";
import { getOpsLuarNegeri } from "@/app/actions";

export default async function LuarNegeriPage() {
  const operations = await getOpsLuarNegeri();
  
  return (
    <div className="p-6">
      <LuarNegeriClient initialOperations={operations} />
    </div>
  );
}
