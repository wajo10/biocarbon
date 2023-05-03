const { Telegraf } = require('telegraf');
const axios = require('axios');
const moment = require('moment-timezone');

const BOT_TOKEN = "6125458886:AAFe6vpSlr5QAqO3z2LKWKe0RLht9TKd6cI";

const bot = new Telegraf(BOT_TOKEN);

bot.command(['start', 'hola'], (ctx) => {
    ctx.reply("¡Hola! ¿Cómo te puedo ayudar?");
});

bot.command(['temperatura', 'temperature'], async (ctx) => {
    const response = await axios.get('http://201.207.53.225:3031/api/biocarbon/LastTemperature/');
    const data = response.data.data;
    const datetime_server = data[0].timeread;
    const fecha_servidor = moment(datetime_server).tz('America/Guatemala')
    const fecha_formateada = fecha_servidor.format('YYYY-MM-DD HH:mm:ss');

    const reply = `Sensor 1: ${data[0].temperature}°C \n Sensor 2: ${data[1].temperature}°C \n Sensor 3: ${data[2].temperature}°C \n Sensor 4: ${data[3].temperature}°C \n Sensor 5: ${data[4].temperature}°C \n Fecha y Hora: ${fecha_formateada}`;
    ctx.reply(reply);
});

bot.command(['humedad', 'humidity'], (ctx) => {
    ctx.reply("Función en construcción, pronto estará disponible.");
});

bot.command('help', (ctx) => {
    const commands = bot.telegram.getMyCommands().then((commands) => {
        const message = commands.reduce((msg, cmd) => {
            return msg + `/${cmd.command} - ${cmd.description}\n`
        }, "Los siguientes comandos están disponibles:\n\n");
        ctx.reply(message);
    });
});

bot.launch();
