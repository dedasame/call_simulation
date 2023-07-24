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
  { id: 3, name: 'Çağrı Alıcı 3', available: true },
  // Diğer alıcılar burada
];

// Simulated call log
const callLog = [];

// Simulated waiting calls list
const waitingCalls = [];

// Helper function to simulate call duration
const simulateCallDuration = () => {
  return Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000; // Between 5 and 30 seconds
};

// Route to render the HTML page for initiating calls
app.get('/', (req, res) => {
    res.render('index', { callRecipients, callLog, waitingCalls }); // waitingCalls'ı da geçiriyoruz
  });

// Function to connect the call to an available recipient
function connectCall() {
    const availableRecipient = callRecipients.find((recipient) => recipient.available);
  
    if (availableRecipient) {
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
  
        // Check if there are waiting calls, if so, connect the next call
        if (waitingCalls.length > 0) {
          const nextCall = waitingCalls.shift();
          connectCall();
        }
      }, callDuration);
    }
  }
  
// Route to handle the call simulation
app.post('/makeCall', (req, res) => {
    const callerId = generateRandomId(); // Burada çağrıyı yapanın ID'sini almanız gereken yöntemi uygulayın
  
    // Check if any recipient is available
    const availableRecipient = callRecipients.find((recipient) => recipient.available);
  
    if (availableRecipient) {
      // If an available recipient is found, make the call immediately
  
      // Mark the recipient as busy
      availableRecipient.available = false;
  
      // Simulate the call duration
      const callDuration = simulateCallDuration();
  
      // Add the call to the call log
      callLog.push({
        recipient: availableRecipient.name,
        duration: callDuration / 1000,
        timestamp: new Date().toLocaleString(),
        callerId: callerId, // Çağrıyı yapanın ID'sini burada ekliyoruz
      });
  
      // Reset the recipient status after the call duration
      setTimeout(() => {
        availableRecipient.available = true;
  
        // Check if there are waiting calls, if so, connect the next call
        if (waitingCalls.length > 0) {
          const nextCall = waitingCalls.shift();
          connectCall(nextCall);
        }
      }, callDuration);
  
      res.send(`Call initiated with Recipient ${availableRecipient.name}. Call duration: ${callDuration / 1000} seconds.`);
    } else {
      // If no available recipient is found, put the call in the waiting list
      waitingCalls.push({
        recipientId: req.body.recipientId,
        recipient: callRecipients.find((recipient) => recipient.id == req.body.recipientId).name,
        timestamp: new Date().toLocaleString(),
        callerId: callerId, // Çağrıyı yapanın ID'sini burada ekliyoruz
      });
  
      res.send('All recipients are busy. Your call is in the waiting list.');
    }
  });
  
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


function generateRandomId() {
    const length = 11;
    let id = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
      id += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    return id;
  }


  
