import { getUnitById, getPersonnel, getUnitMembers } from "@/app/actions";
import EditUnitForm from "@/components/units/EditUnitForm";
import { notFound } from "next/navigation";

export default async function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unitId = parseInt(id);
  const [unit, personnel, existingMembers] = await Promise.all([
    getUnitById(unitId),
    getPersonnel(),
    getUnitMembers(unitId)
  ]);

  if (!unit) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <EditUnitForm unit={unit} personnel={personnel} existingMembers={existingMembers} />
    </div>
  );
}
