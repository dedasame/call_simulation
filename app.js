// app.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Set the view engine to use EJS
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Simulated call recipients
const callRecipients = [
  { id: 1, name: 'Çağrı Alıcı 1', available: true },
  { id: 2, name: 'Çağrı Alıcı 2', available: true },
  { id: 2, name: 'Çağrı Alıcı 3', available: true },
  { id: 2, name: 'Çağrı Alıcı 4', available: true },
  { id: 2, name: 'Çağrı Alıcı 5', available: true }
  // Diğer alıcılar burada
];

// Simulated call log
const callLog = [];

// Helper function to simulate call duration
const simulateCallDuration = () => {
  return Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000; // Between 5 and 30 seconds
};

// Route to render the HTML page for initiating calls
app.get('/', (req, res) => {
  res.render('index', { callRecipients, callLog });
});

// Route to handle the call simulation
app.post('/makeCall', (req, res) => {
  // Check if any recipient is available
  const availableRecipient = callRecipients.find((recipient) => recipient.available);

  if (!availableRecipient) {
    return res.send('All recipients are busy. Please try again later.');
  }

  // Mark the recipient as busy
  availableRecipient.available = false;

  // Simulate the call duration
  const callDuration = simulateCallDuration();

  // Add the call to the call log
  callLog.push({
    recipient: availableRecipient.name,
    duration: callDuration / 1000,
    timestamp: new Date().toLocaleString(),
  });

  // Reset the recipient status after the call duration
  setTimeout(() => {
    availableRecipient.available = true;
  }, callDuration);

  res.send(`Call initiated with Recipient ${availableRecipient.name}. Call duration: ${callDuration / 1000} seconds.`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
