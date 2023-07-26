const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Çağrı Alıcılar
let callRecipients = [
  { name: 'Çağrı Alıcı 1', available: true},
  { name: 'Çağrı Alıcı 2', available: true},
  { name: 'Çağrı Alıcı 3', available: true}
];

// Çağrı geçmişi
const callLog = [];

// Bekleyen Çağrılar Listesi
const waitingCalls = [];

// Çağrı saniyesini atama
const simulateCallDuration = () => {
  return Math.floor(Math.random() * (30000 - 5000 + 1)) + 5000; // Between 5 and 30 seconds
};

//*Tarayıcıda görülecek HTML sayfasını hazırlamak için
app.get('/', (req, res) => {
  res.render('index', { callRecipients, callLog, waitingCalls });
});

// Rota indeksi
let currentRecipientIndex = 0;

// http://localhost:3000/cagri 'da olacak şeyler
app.post('/cagriYap', (req, res) => {
  const callerId = generateRandomId();

  // Round-robin ile çağrı alıcı seçimi
  let selectedRecipient = callRecipients[currentRecipientIndex];
  currentRecipientIndex = (currentRecipientIndex + 1) % callRecipients.length;

  if (selectedRecipient.available) {
    selectedRecipient.available = false;

    const callDuration = simulateCallDuration();

    setTimeout(() => {
      selectedRecipient.available = true;
    }, callDuration);

    callLog.push({
      recipient: selectedRecipient.name,
      duration: callDuration / 1000,
      timestamp: new Date().toLocaleString(),
      callerId: callerId,
    });

    res.send(`Çağrı alındı Alıcı: ${selectedRecipient.name}. Çağrının süresi: ${callDuration / 1000} saniye.`);
  } else {
    waitingCalls.push({
      timestamp: new Date().toLocaleString(),
      callerId: callerId,
    });

    res.send('Seçilen çağrı alıcı şu anda meşgul. Lütfen daha sonra tekrar deneyin.');
  }
});

// Server Başlatma
app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışmakta`);
});

// Rastgele 11 haneli id oluşturur
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
