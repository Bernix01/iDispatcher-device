export const config = {
  deviceId: process.env.DEVICE_ID || 'AS2mDog92exCWarGcUF6',
  firebase: {
    apiKey: 'AIzaSyArLwiu4xjsVGOi4QDJ-bKIc8zrK2yX9lM',
    authDomain: 'holcimiot.firebaseapp.com',
    databaseURL: 'https://holcimiot.firebaseio.com',
    projectId: 'holcimiot'
  },
  scale: {
    clockPin: 20,
    datapin: 21
  },
  faucet: 16,
  rfid: {
    sspi:{
      clock: 15,     // pin number of SCLK
      mosi: 11,      // pin number of MOSI
      miso: 13,      // pin number of MISO
      client: 12,    // pin number of CS
    },
    reset: 8
  }
}
