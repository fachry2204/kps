import { getPersonnelById } from "@/app/actions";
import EditPersonnelForm from "@/components/personnel/EditPersonnelForm";
import { notFound } from "next/navigation";

export default async function EditPersonnelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personnel = await getPersonnelById(parseInt(id));

  if (!personnel) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <EditPersonnelForm personnel={personnel} />
    </div>
  );
}
