export async function prepareClaim(baseUrl, user) {
  const res = await fetch(`${baseUrl}/prepare-claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "prepare failed");
  return data;
}

export async function submitClaim(baseUrl, user) {
  const res = await fetch(`${baseUrl}/submit-claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "submit failed");
  return data;
}