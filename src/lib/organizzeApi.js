const BASE_URL = "https://api.organizze.com.br/rest/v2";

function getHeaders(email, token) {
  const userAgent =
    process.env.ORGANIZZE_USER_AGENT || "ControleGastos (contato@exemplo.com)";
  const credentials = Buffer.from(`${email}:${token}`).toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
    "User-Agent": userAgent,
    "Content-Type": "application/json",
  };
}

async function apiFetch(path, email, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(email, token),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Organizze API ${res.status}: ${text}`);
  }

  return res.json();
}

export async function fetchTransactions(startDate, endDate, email, token) {
  return apiFetch(
    `/transactions?start_date=${startDate}&end_date=${endDate}`,
    email,
    token
  );
}
