const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Çağrı Alıcılar
let callRecipients = [
  { callCount: 0 ,name: 'Çağrı Alıcı 1', available: true},
  { callCount: 0 ,name: 'Çağrı Alıcı 2', available: true},
  { callCount: 0 ,name: 'Çağrı Alıcı 3', available: true}
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

//*rastgele 11 haneli id oluşturur
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


// Çağrıyı arama işlemini gerçekleştiren fonksiyon
function connectCall(callerId) {
  // Tüm çağrı alıcıları meşgulse, çağrıyı bekleme listesine ekle ve çık
  if (callRecipients.every((recipient) => !recipient.available)) {
    waitingCalls.push({
      timestamp: new Date().toLocaleString(),
      callerId: callerId,
    });
    return;
  }

  // Çağrı alıcıları, çağrı sayılarına göre küçükten büyüğe sırala
  callRecipients = callRecipients.slice().sort((a, b) => a.callCount - b.callCount);

  //ilk boştaki çağrı alıcıyı seç
  let recipient = callRecipients.find((recipient) => recipient.available);

  recipient.available = false;
  recipient.callCount++; //Çağrı sayısını arttır

  callRecipients = callRecipients.slice().sort((a, b) => a.callCount - b.callCount);

  const callDuration = simulateCallDuration();

  callLog.push({
    recipient: recipient.name,
    duration: callDuration / 1000,
    timestamp: new Date().toLocaleString(),
    callerId: callerId,
  });

  setTimeout(() => {
    recipient.available = true;
    // Beklemede çağrı var mı kontrol eder
    if (waitingCalls.length > 0) {
      const nextCall = waitingCalls.shift();
      connectCall(nextCall.callerId);
    }
  }, callDuration);
}

// http://localhost:3000/cagri 'da olacak şeyler
app.post('/cagriYap', (req, res) => {
  const callerId = generateRandomId();

  callRecipients = callRecipients.slice().sort((a, b) => a.callCount - b.callCount);

  //ilk boştaki çağrı alıcıyı seç
  let availableRecipient = callRecipients.find((recipient) => recipient.available);

  // Boşta çağrı alıcı var ise
  if (availableRecipient) {

    availableRecipient.available = false;
    availableRecipient.callCount++;

    const callDuration = simulateCallDuration();

    callLog.push({
      recipient: availableRecipient.name,
      duration: callDuration / 1000,
      timestamp: new Date().toLocaleString(),
      callerId: callerId,
    });

    setTimeout(() => {
      availableRecipient.available = true;

      // Bekleyen çağrıyı kontrol et varsa bağla
      if (waitingCalls.length > 0) {
        const nextCall = waitingCalls.shift();
        connectCall(nextCall.callerId);
      }
    }, callDuration);

    res.send(`Çağrı alındı Alıcı: ${availableRecipient.name}. Çağrının süresi: ${callDuration / 1000} saniye.`);
  }
  // Boşta çağrı alıcı yok ise
  else {
    // Bekleme listesine ekler
    waitingCalls.push({
      timestamp: new Date().toLocaleString(),
      callerId: callerId,
    });

    res.send('Bütün çağrı alıcıları şu anda meşgul. Bekleme listesine alındınız.');
  }
});

// Server Başlatma
app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışmakta`);
});
