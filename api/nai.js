export default async function handler(req, res) {
  // 1. 处理跨域 (CORS) - 允许任何网站访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. 如果是浏览器预检请求 (OPTIONS)，直接返回成功
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. 简单的测试：如果是浏览器直接访问 (GET)，返回一段文字证明接口活着
  if (req.method === 'GET') {
    return res.status(200).send('NovelAI Proxy is Active! Please use POST method.');
  }

  // 4. 正式转发逻辑
  try {
    const naiResponse = await fetch('https://image.novelai.net/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ('Bearer ' + process.env.NAI_TOKEN)
      },
      body: JSON.stringify(req.body)
    });

    // 获取 NAI 返回的二进制图片数据
    const data = await naiResponse.arrayBuffer();

    // 原样返回状态码和数据
    res.status(naiResponse.status);
    res.setHeader('Content-Type', 'application/zip');
    res.send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
