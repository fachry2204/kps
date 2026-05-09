import { getPersonnel } from "../../actions";
import AddUnitForm from "@/components/units/AddUnitForm";

export default async function AddUnitPage() {
  const personnel = await getPersonnel();

  return (
    <div className="max-w-4xl mx-auto">
      <AddUnitForm personnel={personnel} />
    </div>
  );
}
