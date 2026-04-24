export type Currency = "usd" | "inr";

const SESSION_KEY = "vrat_currency_v1";

export async function detectCurrency(): Promise<Currency> {
  const cached = sessionStorage.getItem(SESSION_KEY) as Currency | null;
  if (cached === "usd" || cached === "inr") return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch("https://api.country.is/", {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = (await res.json()) as { ip: string; country: string };
    const currency: Currency = data.country === "IN" ? "inr" : "usd";
    sessionStorage.setItem(SESSION_KEY, currency);
    return currency;
  } catch {
    clearTimeout(timeout);
    sessionStorage.setItem(SESSION_KEY, "usd");
    return "usd";
  }
}
