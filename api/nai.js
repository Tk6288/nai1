export default async (req, res) => {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const payload = req.body;
  try {
    const resp = await fetch('https://image.novelai.net/ai/generate-image', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NAI_TOKEN, // 从环境变量获取 Key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).send(errText);
    }

    const data = await resp.arrayBuffer();
    // NAI 返回的是 zip 文件
    res.setHeader('Content-Type', 'application/zip');
    res.send(Buffer.from(data));
  } catch (e) {
    res.status(500).send(e.message);
  }
};
