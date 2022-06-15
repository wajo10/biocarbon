import socketio
import engineio
from RFM9X import RFM9X
import time
from datetime import datetime
import requests
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
    print('Message: ', data)

    if data == "Flow":
        sio.emit("Result", "105")
    elif "relay" in data:
        command = data.split(",")[1]
        id = data.split(",")[2]
        sio.emit("RelayResult", relays(command, id))
    elif "humidity" in data:
        id = data.split(",")[1]
        humValues = humidity(int(id))
        if humValues != None:
            sio.emit("HumidityResult", humValues)
        else:
            sio.emit("HumidityResult", "Error")

def flow():
    message = "Flow"
    ack = rfm9x.send(message, 0, with_ack=True)  # Send to Node 0
    print("Acknowledge? {}".format(ack))
    rec = rfm9x.receive(with_ack=True)
    cont = 0
    while rec is None:
        ack = rfm9x.send(message, 0, with_ack=True)  # Send to Node 0
        print("Acknowledge? {}".format(ack))
        rec = rfm9x.receive(with_ack=True)
        if cont > 5:
            return "Error de comunicación"
        cont += 1

    print(rec)
    return rec


def relays(command, identifier):
    message = command + identifier
    ack = rfm9x.send(message, 0, with_ack=True)  # Send to Node 0
    print("Acknowledge? {}".format(ack))
    rec = rfm9x.receive(with_ack=True)
    cont = 0
    while rec is None:
        ack = rfm9x.send(message, 0, with_ack=True)  # Send to Node 0
        print("Acknowledge? {}".format(ack))
        rec = rfm9x.receive(with_ack=True)
        if cont > 5:
            return "Error de comunicación"
        cont += 1

    print(rec)
    return "Comando {} se ha enviado correctamente al relay #{}".format(command, identifier)


def humidity(identifier):
    dic = {1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G", 8: "H", 9: "I", 10: "J", 11: "K", 12: "L", 13: "M",
           14: "N", 15: "O"}
    message = "Data!{0}".format(identifier)
    now = datetime.now()
    dt_string = now.strftime("%Y-%m-%d %H:%M:%S")
    ack = rfm9x.send(message, identifier, with_ack=True)
    print(ack)
    try:
        rec = rfm9x.receive(with_ack=True).split("/")
        print(rec)
        sendurl = {"id_box": dic[identifier], "created_at": dt_string, "sensorA": rec[0], "sensorB": rec[1],
                   "sensorC": rec[2], "sensorD": rec[3], "sensorE": rec[4], "isCalibration": False}
        url = "http://201.207.53.225:3031/api/biocarbon/HumidityReport"
        x = requests.post(url, data=sendurl)
        print(x.text)
        return rec
    except:
        print("Error Lectura Caja {}".format(dic[identifier]))
        return


while True:
    try:
        sio.connect('http://201.207.53.225:3031/', transports=['websocket'])
        sio.wait()
        break
    except:
        print("Connection failed. Retrying...")
