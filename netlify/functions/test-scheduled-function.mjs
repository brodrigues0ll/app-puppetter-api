export default async (req) => {
  const { next_run } = await req.json();

  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reports/update`);

  return {
    statusCode: 200,
    body: JSON.stringify({ next_run }),
  };
};
