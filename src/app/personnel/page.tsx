import { getPersonnel, getFilterOptions } from "../actions";
import PersonnelClient from "@/components/personnel/PersonnelClient";

export default async function PersonnelPage() {
  const personnel = await getPersonnel();
  const { units, operations } = await getFilterOptions();

  return <PersonnelClient 
    personnel={personnel} 
    units={units}
    operations={operations}
  />;
}
