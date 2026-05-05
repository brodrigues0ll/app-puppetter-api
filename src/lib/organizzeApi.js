"use server";

const BASE_URL = "https://api.organizze.com.br/rest/v2";

function getHeaders() {
  const email = process.env.ORGANIZZE_EMAIL;
  const token = process.env.ORGANIZZE_API_TOKEN;
  const userAgent =
    process.env.ORGANIZZE_USER_AGENT ||
    "ControleGastos (sullivan9909@gmail.com)";

  if (!email || !token) {
    throw new Error(
      "ORGANIZZE_EMAIL e ORGANIZZE_API_TOKEN são obrigatórios no .env"
    );
  }

  const credentials = Buffer.from(`${email}:${token}`).toString("base64");

  return {
    Authorization: `Basic ${credentials}`,
    "User-Agent": userAgent,
    "Content-Type": "application/json",
  };
}

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: getHeaders() });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Organizze API ${res.status}: ${text}`);
  }

  return res.json();
}

export async function fetchTransactions(startDate, endDate) {
  return apiFetch(`/transactions?start_date=${startDate}&end_date=${endDate}`);
}

export async function fetchAccounts() {
  return apiFetch("/accounts");
}
