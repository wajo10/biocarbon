import telebot
import requests
import datetime

BOT_TOKEN = "6125458886:AAFe6vpSlr5QAqO3z2LKWKe0RLht9TKd6cI"

bot = telebot.TeleBot(BOT_TOKEN)


@bot.message_handler(commands=['start', 'hola'])
def send_welcome(message):
    bot.reply_to(message, "¡Hola! ¿Cómo te puedo ayudar?")


@bot.message_handler(commands=['temperatura', 'temperature'])
def get_temperature(message):
    response = requests.get('http://201.207.53.225:3031/api/biocarbon/LastTemperature/')
    response = response.json()['data']
    datetime_server = str(response[0]['timeread'])
    datetime_server = datetime_server[:-1]
    # format datetime and substract 6 hours
    fecha_servidor = datetime.datetime.fromisoformat(datetime_server)
    diferencia_horaria = datetime.timedelta(hours=6)
    fecha_local = fecha_servidor - diferencia_horaria
    fecha_formateada = fecha_local.strftime('%Y-%m-%d %H:%M:%S')

    reply = "Sensor 1: {}°C \n Sensor 2: {}°C \n Sensor 3: {}°C \n Sensor 4: {}°C \n Sensor 5: {}°C \n Fecha y Hora: {}".format(
        response[0]['temperature'], response[1]['temperature'], response[2]['temperature'], response[3]['temperature'],
        response[4]['temperature'], fecha_formateada)
    bot.reply_to(message, reply)


@bot.message_handler(commands=['humedad', 'humidity'])
def get_humidity(message):
    bot.reply_to(message, "Función en construcción, pronto estará disponible.")


# set my commands
bot.set_my_commands(
    commands=[
        telebot.types.BotCommand('temperatura', 'Obtener valores de Temperatura'),
        telebot.types.BotCommand('humedad', 'Obtener valores de Humedad')
    ]
)

bot.infinity_polling()
