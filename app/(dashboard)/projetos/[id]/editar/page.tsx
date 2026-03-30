import ProjetoForm from '../../novo/page';

export default function EditarProjeto({ params }: { params: Promise<{ id: string }> }) {
  return <ProjetoForm params={params} />;
}
