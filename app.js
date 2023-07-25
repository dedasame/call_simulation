const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//Çağrı Alıcılar
const callRecipients = [
  { id: 1, name: 'Çağrı Alıcı 1', available: true },
  { id: 2, name: 'Çağrı Alıcı 2', available: true },
  { id: 3, name: 'Çağrı Alıcı 3', available: true }
];

//Çağrı geçmişi
const callLog = [];

//Bekleyen Çağrılar Listesi
const waitingCalls = [];

//Çağrı saniyesini atama
const simulateCallDuration = () => {
  return Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000; // Between 5 and 30 seconds
};

// Function to generate JWT for caller
function generateCallerJWT(callerId) {
  const secretKey = 'your_secret_key';
  return jwt.sign({ callerId }, secretKey, { expiresIn: '1h' });
}

// Function to extract caller ID from JWT
function getCallerIdFromJWT(token) {
  const secretKey = 'your_secret_key';
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.callerId;
  } catch (error) {
    return null;
  }
}

// Route to render the HTML page for initiating calls
app.get('/', (req, res) => {
  res.render('index', { callRecipients, callLog, waitingCalls });
});

//Çağrıyı arama ile eşleştirir
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
  const callerId = generateRandomId();

  //Çağrı alıcılar boş mu kontrol ediyor
  const availableRecipient = callRecipients.find((recipient) => recipient.available);

  if (availableRecipient) {

    //Boşta çağrı alıcı varsa çağrıyı al
    //Çağrı alıcının durumunu meşgule al
    availableRecipient.available = false;

    // Simulate the call duration
    const callDuration = simulateCallDuration();

    //Çağrıyı çağrı geçmişine ekle
    callLog.push({
      recipient: availableRecipient.name,
      duration: callDuration / 1000,
      timestamp: new Date().toLocaleString(),
      callerId: callerId, // Çağrıyı yapanın ID'sini burada ekliyoruz
    });

    //Bekleme süresi bittikten sonra çağrı alıcının durumunu boşa al
    setTimeout(() => {
      availableRecipient.available = true;

      //Bekleyen çağrıyı kontrol et varsa bağla
      if (waitingCalls.length > 0) {
        const nextCall = waitingCalls.shift();
        connectCall(nextCall);
      }
    }, callDuration);

    res.send(`Call initiated with Recipient ${availableRecipient.name}. Call duration: ${callDuration / 1000} seconds.`);
  } else {
    //Boşta çağrı alıcı yoksa bekleme listesine
      waitingCalls.push({
      recipientId: req.body.recipientId,
      recipient: callRecipients.find((recipient) => recipient.id == req.body.recipientId).name,
      timestamp: new Date().toLocaleString(),
      callerId: callerId
    });

    res.send('All recipients are busy. Your call is in the waiting list.');
  }
});

//Server Başlatma
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


