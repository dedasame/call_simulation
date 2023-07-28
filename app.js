const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Çağrı Alıcılar
let callRecipients = [
  { callCount: 2, callDuration: 20, name: 'Çağrı Alıcı 1', available: true },
  { callCount: 1, callDuration: 25, name: 'Çağrı Alıcı 2', available: true },
  { callCount: 1, callDuration: 10, name: 'Çağrı Alıcı 3', available: true },
  { callCount: 2, callDuration: 20, name: 'Çağrı Alıcı 4', available: true },
  { callCount: 2, callDuration: 15, name: 'Çağrı Alıcı 5', available: true }
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

  // En az yoğun çağrı alıcıyı bul
  let leastUtilizedRecipient = callRecipients.reduce((prev, curr) => {
    const prevUtilization = prev.callCount * prev.callDuration;
    const currUtilization = curr.callCount * curr.callDuration;
    return prevUtilization <= currUtilization ? prev : curr;
  });

  leastUtilizedRecipient.available = false;
  leastUtilizedRecipient.callCount++;
  const callDuration = simulateCallDuration();
  leastUtilizedRecipient.callDuration += callDuration;

  callLog.push({
    recipient: leastUtilizedRecipient.name,
    duration: callDuration / 1000,
    timestamp: new Date().toLocaleString(),
    callerId: callerId,
  });

  setTimeout(() => {
    leastUtilizedRecipient.available = true;
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

  // En az yoğun çağrı alıcıyı bul
  let leastUtilizedRecipient = callRecipients.reduce((prev, curr) => {
    const prevUtilization = prev.callCount * prev.callDuration;
    const currUtilization = curr.callCount * curr.callDuration;
    return prevUtilization <= currUtilization ? prev : curr;
  });

  // En az yoğun çağrı alıcıya yönlendir
  if (leastUtilizedRecipient.available) {
    leastUtilizedRecipient.available = false;
    leastUtilizedRecipient.callCount++;

    const callDuration = simulateCallDuration();
    leastUtilizedRecipient.callDuration += callDuration;

    callLog.push({
      recipient: leastUtilizedRecipient.name,
      duration: callDuration / 1000,
      timestamp: new Date().toLocaleString(),
      callerId: callerId,
    });

    setTimeout(() => {
      leastUtilizedRecipient.available = true;
      // Beklemede çağrı var mı kontrol eder
      if (waitingCalls.length > 0) {
        const nextCall = waitingCalls.shift();
        connectCall(nextCall.callerId);
      }
    }, callDuration);

    res.send(`Çağrı alındı Alıcı: ${leastUtilizedRecipient.name}. Çağrının süresi: ${callDuration / 1000} saniye.`);
  } else {
    // En az yoğun çağrı alıcı meşgul ise, beklemeye alın
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

