export default async (req) => {
  const { next_run } = await req.json();

  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/scrape}`);

  console.log("Received event! Next invocation at:", next_run);
};
