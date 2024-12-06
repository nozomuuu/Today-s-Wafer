const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

const PORT = 5005;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is listening on http://127.0.0.1:${PORT}`);
});
