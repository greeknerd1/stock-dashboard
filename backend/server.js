const express = require('express');
const cors = require('cors'); // Optional, if you installed it
const bodyParser = require('body-parser'); // Optional, if you installed it

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Optional
app.use(bodyParser.json()); // Optional

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});