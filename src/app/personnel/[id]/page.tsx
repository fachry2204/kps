import { 
  getPersonnelById, 
  getPersonnelUnitHistory, 
  getPersonnelOperationHistory,
  getPersonnelEducation,
  getPersonnelMilEducation,
  getPersonnelAwards,
  getPersonnelLanguages,
  getPersonnelAssignments
} from "@/app/actions";
import PersonnelProfile from "@/components/personnel/PersonnelProfile";
import { notFound } from "next/navigation";

export default async function PersonnelProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personnelId = parseInt(id);
  
  const [
    personnel, 
    unitHistory, 
    operationHistory,
    education,
    milEducation,
    awards,
    languages,
    assignments
  ] = await Promise.all([
    getPersonnelById(personnelId),
    getPersonnelUnitHistory(personnelId),
    getPersonnelOperationHistory(personnelId),
    getPersonnelEducation(personnelId),
    getPersonnelMilEducation(personnelId),
    getPersonnelAwards(personnelId),
    getPersonnelLanguages(personnelId),
    getPersonnelAssignments(personnelId)
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
        education={education}
        milEducation={milEducation}
        awards={awards}
        languages={languages}
        assignments={assignments}
      />
    </div>
  );
}
