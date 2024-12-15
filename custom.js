const cron = require('node-cron');
const axios = require("axios");

const fetchWeather = async () => {
  try {
    const response = await axios.get('https://ccexplorerapisjonell.vercel.app/api/weather');
    const { synopsis, issuedAt, temperature, humidity } = response.data;
    return `Weather Update:\n\n${synopsis}\n\nIssued at: ${issuedAt}\nMax Temperature: ${temperature.max.value} at ${temperature.max.time}\nMin Temperature: ${temperature.min.value} at ${temperature.min.time}\nMax Humidity: ${humidity.max.value} at ${humidity.max.time}\nMin Humidity: ${humidity.min.value} at ${humidity.min.time}`;
  } catch (error) {
    return 'Unable to fetch weather information at the moment.';
  }
};

module.exports = async ({ api }) => {
  const config = {
    autoRestart: {
      status: true,
      time: 40,
      note: 'To avoid problems, enable periodic bot restarts',
    },
    greetings: [
      {
        cronTime: '0 5 * * *',
        messages: [`Good morning! Mga Kupal!`],
      },
      {
        cronTime: '0 8 * * *',
        messages: [`Hello Everyone Time Check 8:00 AM Asan na yung feeling ranter?`],
      },
      {
        cronTime: '0 10 * * *',
        messages: [`Hello everyone! Pukinang inang nyo!!`],
      },
      {
        cronTime: '0 12 * * *',
        messages: [`12 na kukupal kupal parin kayo? mga hinayupak`],
      },
      {
        cronTime: '0 14 * * *',
        messages: [`This Bot Is ksjeneksjsdjejedjen 😀`],
      },
      {
        cronTime: '0 18 * * *',
        messages: [`Good evening! mga putangina`],
      },
      {
        cronTime: '0 20 * * *',
        messages: [`puyat lang kaya payan hanggang mawalan kana ng tamod sa katawan`],
      },
      {
        cronTime: '0 22 * * *',
        messages: [`Sige puyat pa tanginamo ka`],
      },
      {
        cronTime: '0 7 * * *',
        messages: async () => `Good morning! Have a great day ahead!\n\n${await fetchWeather()}`,
      },
      {
        cronTime: '0 19 * * *',
        messages: async () => `Good evening! Relax and enjoy your evening.\n\n${await fetchWeather()}`,
      }
    ]
  };

  config.greetings.forEach((greeting) => {
    cron.schedule(greeting.cronTime, async () => {
      const message = typeof greeting.messages[0] === 'function' ? await greeting.messages[0]() : greeting.messages[0];
      api.getThreadList(20, null, ['INBOX']).then((list) => {
        list.forEach((thread) => {
          if (thread.isGroup) {
            api.sendMessage(message, thread.threadID).catch((error) => {
              console.log(`Error sending message: ${error}`, 'AutoGreet');
            });
          }
        });
      }).catch((error) => {
        console.log(`Error getting thread list: ${error}`, 'AutoGreet');
      });
    }, {
      scheduled: true,
      timezone: "Asia/Manila"
    });
  });

  if (config.autoRestart.status) {
    cron.schedule(`*/${config.autoRestart.time} * * * *`, () => {
      api.getThreadList(20, null, ['INBOX']).then((list) => {
        list.forEach((thread) => {
          if (thread.isGroup) {
            api.sendMessage("🔃 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀\n━━━━━━━━━━━━━━━━━━\nBot is restarting...", thread.threadID).then(() => {
              console.log(`Restart message sent to thread`, 'Auto Restart');
            }).catch((error) => {
              console.log(`Error sending restart message to thread ${error}`, 'Auto Restart');
            });
          }
        });
        console.log('Start rebooting the system!', 'Auto Restart');
        process.exit(1);
      }).catch((error) => {
        console.log(`Error getting thread list for restart: ${error}`, 'Auto Restart');
      });
    });
  }
};
