import { getPersonnel } from "../actions";
import PersonnelClient from "@/components/personnel/PersonnelClient";

export default async function PersonnelPage() {
  const personnel = await getPersonnel();

  return <PersonnelClient personnel={personnel} />;
}
