export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).send('NAI Proxy Active');

  try {
    const token = process.env.NAI_TOKEN;
    if (!token) throw new Error('Missing NAI_TOKEN');

    // --- 关键修改：增加伪装头 ---
    const naiResponse = await fetch('https://image.novelai.net/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        // 假装自己是 Windows 电脑上的 Chrome 浏览器
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://novelai.net/',
        'Origin': 'https://novelai.net'
      },
      body: JSON.stringify(req.body)
    });
    // -------------------------

    if (!naiResponse.ok) {
      const err = await naiResponse.text();
      return res.status(naiResponse.status).send(err);
    }

    const data = await naiResponse.arrayBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.send(Buffer.from(data));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
