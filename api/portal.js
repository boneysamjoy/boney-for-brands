export default async function handler(req, res) {
  // Allow CORS from your own domain
  res.setHeader('Access-Control-Allow-Origin', 'https://boney-for-brands.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = 'apphhdf1ge6BqkXf9';

  if (!token) { res.status(500).json({ error: 'Token not configured' }); return; }

  const { action } = req.query;

  try {
    if (action === 'login') {
      // Verify client credentials
      const { username, password } = req.body;
      const url = `https://api.airtable.com/v0/${baseId}/Clients?filterByFormula=AND({Username}="${username}",{Password}="${password}",{Active}=1)`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      if (data.records && data.records.length > 0) {
        const rec = data.records[0].fields;
        res.status(200).json({ success: true, name: rec.Name, brand: rec.Brand || '' });
      } else {
        res.status(401).json({ success: false });
      }
    }

    else if (action === 'submit') {
      // Save onboarding answers
      const body = req.body;
      const r = await fetch(`https://api.airtable.com/v0/${baseId}/Onboarding`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: body }),
      });
      const data = await r.json();
      res.status(200).json({ success: true, id: data.id });
    }

    else {
      res.status(400).json({ error: 'Unknown action' });
    }

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
