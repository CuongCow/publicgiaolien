// Vercel serverless function test
module.exports = (req, res) => {
  res.json({
    message: 'Vercel API test successful',
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
}; 