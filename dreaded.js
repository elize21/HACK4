```
const wppconnect = require('wppconnect');
const figlet = require('figlet');
const chalk = require('chalk');
const spinnies = new (require('spinnies'))();

async function main() {
  console.log(
    chalk.red(
      figlet.textSync('DREADED BOT', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        whitespaceBreak: false,
      })
    )
  );

  const sock = new wppconnect.WAConnection();

  sock.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
  });

  sock.on('connection_update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === 'connecting') {
      spinnies.add('start', { text: 'Connecting Now...' });
    } else if (connection === 'open') {
      spinnies.succeed('start', { text: `Successfully Connected. You have logged in as ${sock.user.name}` });
    } else if (connection === 'close') {
      if (lastDisconnect.error.output.statusCode === DisconnectReason.loggedOut) {
        spinnies.fail('start', { text: `Can't connect!` });
        process.exit(0);
      } else {
        main().catch(() => main());
      }
    }
  });

  sock.on('message', async (message) => {
    const m = message;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.sender = sock.decodeJid((m.fromMe && sock.user.id) || m.participant || m.key.participant || m.chat);
    const groupMetadata = m.isGroup ? await sock.groupMetadata(m.chat).catch((e) => {}) : '';
    const groupName = m.isGroup ? groupMetadata.subject : '';

    if (!m.message) return;
    if (m.chat.endsWith('@s.whatsapp.net')) {
      sock.sendPresenceUpdate('recording', m.chat);
    }
    if (m.chat.endsWith('broadcast')) {
      sock.readMessages([m.key]);
      const status = '📅 Tuesday, October 26, 2016 ⌚ 8:20:59 🎖️ ᴳᵉⁿᵉʳᵃᵗᵉᵈ ᴮʸ Maͭsͪtͤers';
      await sock.updateProfileStatus(status);
    }
  });
}

main();
```
