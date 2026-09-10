import RelatoriaForm from '@/components/forms/RelatoriaForm';

export default async function EditarRelatoria({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RelatoriaForm id={id} />;
}