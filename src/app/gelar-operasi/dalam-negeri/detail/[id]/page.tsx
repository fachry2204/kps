import OperationDetailClient from "@/components/operations/OperationDetailClient";
import { getOperations } from "@/app/actions";
import { SATGAS_DALAM_NEGERI } from "@/lib/constants";

export default async function OperationDetailPage({ params }: { params: { id: string } }) {
  const operations = await getOperations();
  
  // Try to find in database first, then in static constants
  let operation = operations.find(op => op.id.toString() === params.id);
  
  if (!operation) {
    operation = SATGAS_DALAM_NEGERI.find(op => op.id.toString() === params.id) as any;
  }
  
  // Map internal fields if using static data
  const initialData = operation ? {
    operation_name: (operation as any).name || (operation as any).operation_name,
    location: operation.location,
    id: operation.id
  } : null;
  
  return (
    <div className="p-6">
      <OperationDetailClient id={params.id} initialData={initialData} />
    </div>
  );
}
