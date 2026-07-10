/* Vercel serverless proxy for The Space Devs launch schedule.
   Edge-cached for 30 minutes (+6h stale-while-revalidate), so the
   free tier's 15 requests/hour limit can never be hit by visitors. */

export default async function handler(req, res) {
  try {
    const r = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=6');
    if (!r.ok) {
      res.status(r.status).json({ error: 'upstream ' + r.status });
      return;
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=21600');
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Could not reach the launch API' });
  }
}
