export async function sendWhatsAppMessage(
  evolutionUrl: string,
  evolutionApiKey: string,
  instanceId: string,
  phone: string,
  text: string
): Promise<boolean> {
  try {
    const base = evolutionUrl.replace(/\/$/, "");
    const url = `${base}/message/sendText/${instanceId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evolutionApiKey,
      },
      body: JSON.stringify({ number: phone, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
