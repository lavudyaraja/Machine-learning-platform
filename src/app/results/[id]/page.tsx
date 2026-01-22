export default function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1>Training Results: {params.id}</h1>
    </div>
  );
}

