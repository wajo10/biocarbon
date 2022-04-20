import socketio
import engineio
from RFM9X import RFM9X
import time
from datetime import datetime

rfm9x = RFM9X()

sio = socketio.Client()


@sio.event
def connect():
    print('connection established')


@sio.event
def disconnect():
    print('disconnected from server')


@sio.on('Command')
def on_message(data):
    if data == "Flow":
        sio.emit("Result", "105")
    elif "relay" in data:
        command = data.split(",")[1]
        id = data.split(",")[2]
        sio.emit("RelayResult",relays(command, id))

    print('Message: ', data)


def relays(command, identifier):
    message = command + identifier
    ack = rfm9x.send(message, 0, with_ack=True)  # Send to Node 0
    print("Acknowledge? {}".format(ack))
    rec = rfm9x.receive(with_ack=True)
    print(rec)
    return "Comando {} se ha enviado correctamente al relay #{}". format(command, identifier)


sio.connect('http://201.207.53.225:3031/', transports=['websocket'])
# sio.connect('http://localhost:3031/', transports=['websocket'])
sio.wait()
