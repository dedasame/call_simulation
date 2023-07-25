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

//*Çağrıyı arama ile eşleştirir
function connectCall(callerId) {
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
      callerId: callerId, // Çağrıyı yapanın ID'sini burada ekliyoruz
    });

    // Reset the recipient status after the call duration
    setTimeout(() => {
      availableRecipient.available = true;

      //beklemede çağrı var mı diye kontrol ediyor varsa bağlıyor
      if (waitingCalls.length > 0) {
        const nextCall = waitingCalls.shift(); //ilk elemanı alır ve diziden siler
        connectCall();
      }
    }, callDuration);
  }
}


//* http://localhost:3000/cagri 'da olacak şeyler
app.post('/cagriYap', (req, res) => {
  const callerId = generateRandomId();

  //Çağrı alıcılar boş mu kontrol ediyor
  const availableRecipient = callRecipients.find((recipient) => recipient.available);

  //Boşta çağrı alıcı var ise
  if (availableRecipient) {

    availableRecipient.available = false;
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
        connectCall(nextCall.callerId);
      }
    }, callDuration);

    res.send(`Çağrı alındı Alıcı: ${availableRecipient.name}. Çağrının süresi: ${callDuration / 1000} saniye.`);
  } 
  //Boşta çağrı alıcı yok ise
  else {
    //bekleme listesine eklenir
      waitingCalls.push({
      timestamp: new Date().toLocaleString(),
      callerId: callerId
    });

    res.send('Bütün çağrı alıcıları şu anda meşgul. Bekleme listesine alındınız.');
  }
});

//*Server Başlatma
app.listen(port, () => {
  console.log(`Server http://localhost:${port} adresinde çalışmakta`);
});


