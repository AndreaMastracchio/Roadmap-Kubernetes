const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const redisClient = require('../config/redis');

// Configurazione Twilio (opzionale)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

const generateOTP = () => {
  return otpGenerator.generate(6, { 
    upperCaseAlphabets: false, 
    specialChars: false, 
    lowerCaseAlphabets: false,
    digits: true 
  });
};

const saveOTP = async (phone, otp) => {
  const key = `otp:${phone}`;
  await redisClient.set(key, otp, 'EX', 300); // Scade in 5 minuti
};

const verifyOTP = async (phone, otp) => {
  const key = `otp:${phone}`;
  const savedOtp = await redisClient.get(key);
  if (savedOtp === otp) {
    await redisClient.del(key);
    return true;
  }
  return false;
};

const sendOTP = async (phone, otp) => {
  const message = `Il tuo codice di verifica KubeStudy è: ${otp}`;
  let isMock = false;
  
  if (client && twilioPhone) {
    try {
      await client.messages.create({
        body: message,
        from: twilioPhone,
        to: phone
      });
      console.log(`OTP inviato via Twilio a ${phone}`);
    } catch (error) {
      console.error('Errore invio SMS Twilio:', error);
      // Fallback su console in caso di errore config
      console.log(`[MOCK SMS] A: ${phone} | Messaggio: ${message}`);
      isMock = true;
    }
  } else {
    console.log(`[MOCK SMS] A: ${phone} | Messaggio: ${message}`);
    isMock = true;
  }
  return isMock;
};

module.exports = {
  generateOTP,
  saveOTP,
  verifyOTP,
  sendOTP
};
