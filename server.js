const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/welcome', (req, res) => {
  res.send('hello, world');
});

app.post('/message', (req, res) => {
  res.json(req.body);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
