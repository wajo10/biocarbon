import socketio
import engineio
import time
from datetime import datetime
import requests
from datetime import datetime
import threading
import os
import random

sio = socketio.Client()

serverInterrupt = False  # Variable that stops mainloop if gateway receives a message from server


@sio.event
def connect():
    sio.emit('register', {'deviceId': 'prueba'})
    print('connection established')


@sio.event
def disconnect():
    print('disconnected from server')


@sio.on('Command')
def on_message(data):
    global serverInterrupt
    print('Message: ', data)

    if data == "Flow":
        sio.emit("Result", flow())
    elif "relay" in data:
        serverInterrupt = True
        command = data.split(",")[1]
        id = data.split(",")[2]
        sio.emit("RelayResult", relays(command, id))
    elif "humidity" in data:
        serverInterrupt = True
        id = data.split(",")[1]
        humValues = humidity(int(id))
        if humValues != None:
            sio.emit("HumidityResult", humValues)
        else:
            sio.emit("HumidityResult", "Error")


def flow():
    return random.randint(0, 100)


def relays(command, identifier):
    return "Comando {} se ha enviado correctamente al relay #{}. Info ".format(command, identifier)


def humidity(identifier):
    return random.randint(0, 100)


# Wait until connection is established with server
while True:
    try:
        sio.connect('http://127.0.0.1:3031/', transports=['websocket'])
        sio.wait()
        break
    except:
        print("Connection failed. Retrying...")
