import { getUnits } from "../actions";
import UnitsClient from "@/components/units/UnitsClient";

export default async function UnitsPage() {
  const units = await getUnits();

  return <UnitsClient units={units} />;
}
