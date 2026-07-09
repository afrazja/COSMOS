/* Vercel serverless proxy for NASA's Astronomy Picture of the Day.
   The response is cached at Vercel's edge for an hour (plus a day of
   stale-while-revalidate), so NASA sees ~1 request per hour per region
   no matter how many visitors the page gets — DEMO_KEY's rate limit
   stops mattering. Set NASA_API_KEY in Vercel env vars to use a real key. */

export default async function handler(req, res) {
  const key = process.env.NASA_API_KEY || 'DEMO_KEY';
  try {
    const r = await fetch(
      'https://api.nasa.gov/planetary/apod?api_key=' + key + '&thumbs=true'
    );
    if (!r.ok) {
      res.status(r.status).json({ error: 'NASA responded ' + r.status });
      return;
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Could not reach NASA' });
  }
}
