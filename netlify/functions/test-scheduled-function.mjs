export default async (req) => {
  const { next_run } = await req.json();

  const URL = process.env.NEXT_PUBLIC_BASE_URL;
  const fetch = async () => {
    const res = await fetch(`${URL}/api/reports/update`);
    const data = await res.json();
    console.log(data);
  };

  await fetch();

  return {
    statusCode: 200,
    body: JSON.stringify({ next_run }),
  };
};
