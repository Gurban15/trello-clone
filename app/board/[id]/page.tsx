import BoardContent from "./BoardContent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BoardPage({ params }: PageProps) {
  // In Next 16, params is a Promise – we must await it
  const { id } = await params;

  return <BoardContent boardId={id} />;
}