import EditOperationForm from "@/components/operations/EditOperationForm";
import { getOpsLuarNegeri, getOpAssignments } from "@/app/actions";

export default async function EditLuarNegeriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const operations = await getOpsLuarNegeri();
  const operation = operations.find(op => op.id.toString() === id);
  const assignments = await getOpAssignments(Number(id), 'LUAR_NEGERI');
  
  const initialData = operation ? {
    ...operation,
    commander: assignments.find(a => a.role === 'KOMANDAN'),
    members: assignments.filter(a => a.role === 'ANGGOTA')
  } : null;

  return (
    <div className="p-8">
      <EditOperationForm id={id} type="LUAR_NEGERI" initialData={initialData} />
    </div>
  );
}
