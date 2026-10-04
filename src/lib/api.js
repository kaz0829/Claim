function trimBase(baseUrl) {
  return String(baseUrl || "").replace(/\/+$/, "");
}

async function postJson(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("NETWORK");
  }

  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  const errorText =
    (typeof payload?.error === "string" && payload.error) ||
    (payload?.error && typeof payload.error.message === "string" && payload.error.message) ||
    "";
  const failed = !response.ok || payload?.success === false || (errorText && payload?.success !== true);

  if (failed) {
    const message =
      errorText ||
      (typeof payload?.message === "string" && payload.message) ||
      "REQUEST_FAILED";
    throw new Error(message);
  }

  return payload;
}

export function prepareClaim(baseUrl, token, user) {
  return postJson(`${trimBase(baseUrl)}/prepare-claim`, { token, user });
}

export function submitClaim(baseUrl, { token, user, signature }) {
  return postJson(`${trimBase(baseUrl)}/submit-claim`, {
    token,
    user,
    signature,
    amount: "max",
  });
}
