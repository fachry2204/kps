import OperationDetailClient from "@/components/operations/OperationDetailClient";
import { getOpsLuarNegeri, getOpAssignments, getOperationAssets } from "@/app/actions";

export default async function OperationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const operations = await getOpsLuarNegeri();
  
  // Try to find in database
  const operation = operations.find(op => op.id.toString() === id);
  const assignments = await getOpAssignments(Number(id), 'LUAR_NEGERI');
  
  // Map internal fields
  const initialData = operation ? {
    operation_name: operation.name || operation.operation_name,
    location: operation.location,
    id: operation.id,
    personnel: operation.personnel,
    status: operation.status,
    type: operation.type,
    commander: assignments.find(a => a.role === 'KOMANDAN'),
    members: assignments.filter(a => a.role === 'ANGGOTA'),
    assets: await getOperationAssets(Number(id), 'LUAR_NEGERI'),
    coordinates: operation.coordinates,
    mission_objectives: operation.mission_objectives
  } : null;
  
  return (
    <div className="p-6">
      <OperationDetailClient id={id} initialData={initialData} />
    </div>
  );
}
