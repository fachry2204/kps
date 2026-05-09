import { getPersonnelById, getPersonnelUnitHistory, getPersonnelOperationHistory } from "@/app/actions";
import PersonnelProfile from "@/components/personnel/PersonnelProfile";
import { notFound } from "next/navigation";

export default async function PersonnelProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personnelId = parseInt(id);
  
  const [personnel, unitHistory, operationHistory] = await Promise.all([
    getPersonnelById(personnelId),
    getPersonnelUnitHistory(personnelId),
    getPersonnelOperationHistory(personnelId)
  ]);

  if (!personnel) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <PersonnelProfile 
        personnel={personnel} 
        unitHistory={unitHistory} 
        operationHistory={operationHistory} 
      />
    </div>
  );
}
