import EmendaForm from '../../nova/page';

export default function EditarEmenda({ params }: { params: Promise<{ id: string }> }) {
  return <EmendaForm params={params} />;
}
