import RPi.GPIO as GPIO
from RFM9X import RFM9X
import time
import requests
from datetime import datetime
from VolumeRead import FlowMeter
from threading import Thread

rfm9x = RFM9X(node=0)

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(26, GPIO.OUT)
GPIO.setup(20, GPIO.OUT)
GPIO.setup(27, GPIO.OUT)
GPIO.setup(22, GPIO.OUT)
GPIO.setup(23, GPIO.OUT)
GPIO.setup(24, GPIO.OUT)
GPIO.output(27, GPIO.LOW)
GPIO.output(22, GPIO.LOW)
GPIO.output(23, GPIO.LOW)
GPIO.output(24, GPIO.LOW)
GPIO.output(26, GPIO.LOW)
GPIO.output(20, GPIO.LOW)  # Corresponde a la bomba

flowmeter1 = FlowMeter(17)
flowmeter2 = FlowMeter(16)
flowmeter3 = FlowMeter(19)
flowmeter4 = FlowMeter(13)
flowmeter5 = FlowMeter(6)
flowList = [flowmeter1, flowmeter2, flowmeter3, flowmeter4, flowmeter5]


def update():
    for flow in flowList:
        flow.getFlowRate()
        flow.getVolume()


t1 = Thread(target=update)
t1.start()

retries = 10
while True:
    print("Esperando mensajes...")
    # Espera por un nuevo packet: solo acepta si estÃ¡ dirigido a este Nodo
    packet = rfm9x.receive(with_ack=True)
    # Si no se recibe un packet durante el Timeout, se retorna None.
    if packet is not None:
        print(packet)
        sender = rfm9x.node
        print("Hay un mensaje de parte de: {}".format(sender))

        if packet == "Flow":
            print("Solicitud de FLUJO de parte de: {}".format(sender))
            data = ""
            for flow in flowList:
                data += flow.getVolume()
                data += ","
                flow.volume = 0

            print("Datos a enviar: {}".format(data))

            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
        elif packet == "OFF1":
            print("Solicitud de APAGAR Relay 1 de parte de: {}".format(sender))
            GPIO.output(27, GPIO.LOW)
            data = "Relay1 Inactivo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
            if not (GPIO.input(27) and GPIO.input(22) and GPIO.input(23) and GPIO.input(24) and GPIO.input(26)):
                GPIO.output(20, GPIO.LOW)
        elif packet == "ON1".format(rfm9x.node):
            print("Solicitud de ENCENDER Relay 1 de parte de: {}".format(sender))
            GPIO.output(27, GPIO.HIGH)
            GPIO.output(20, GPIO.HIGH)
            data = "Relay1 Activo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1

        elif packet == "OFF2".format(rfm9x.node):
            print("Solicitud de APAGAR Relay 2 de parte de: {}".format(sender))
            GPIO.output(22, GPIO.LOW)
            data = "Relay2 Inactivo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
            if not (GPIO.input(27) and GPIO.input(22) and GPIO.input(23) and GPIO.input(24) and GPIO.input(26)):
                GPIO.output(20, GPIO.LOW)

        elif packet == "ON2".format(rfm9x.node):
            print("Solicitud de ENCENDER Relay 2 de parte de: {}".format(sender))
            GPIO.output(22, GPIO.HIGH)
            GPIO.output(20, GPIO.HIGH)
            data = "Relay2 Activo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1

        elif packet == "OFF3".format(rfm9x.node):
            print("Solicitud de APAGAR Relay 3 de parte de: {}".format(sender))
            GPIO.output(24, GPIO.LOW)
            data = "Relay3 Inactivo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
            if not (GPIO.input(27) and GPIO.input(22) and GPIO.input(23) and GPIO.input(24) and GPIO.input(26)):
                GPIO.output(20, GPIO.LOW)

        elif packet == "ON3".format(rfm9x.node):
            print("Solicitud de ENCENDER Relay 3 de parte de: {}".format(sender))
            GPIO.output(24, GPIO.HIGH)
            GPIO.output(20, GPIO.HIGH)
            data = "Relay3 Activo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1

        elif packet == "OFF4".format(rfm9x.node):
            print("Solicitud de APAGAR Relay 4 de parte de: {}".format(sender))
            GPIO.output(23, GPIO.LOW)
            data = "Relay4 Inactivo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
            if not (GPIO.input(27) and GPIO.input(22) and GPIO.input(23) and GPIO.input(24) and GPIO.input(26)):
                GPIO.output(20, GPIO.LOW)

        elif packet == "ON4".format(rfm9x.node):
            print("Solicitud de ENCENDER Relay 4 de parte de: {}".format(sender))
            GPIO.output(23, GPIO.HIGH)
            GPIO.output(20, GPIO.HIGH)
            data = "Relay4 Activo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
        elif packet == "OFF5".format(rfm9x.node):
            print("Solicitud de APAGAR Relay 5 de parte de: {}".format(sender))
            GPIO.output(26, GPIO.LOW)
            data = "Relay5 Inactivo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
            if not (GPIO.input(27) and GPIO.input(22) and GPIO.input(23) and GPIO.input(24) and GPIO.input(26)):
                GPIO.output(20, GPIO.LOW)

        elif packet == "ON5".format(rfm9x.node):
            print("Solicitud de ENCENDER Relay 5 de parte de: {}".format(sender))
            GPIO.output(26, GPIO.HIGH)
            GPIO.output(20, GPIO.HIGH)
            data = "Relay5 Activo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
        elif packet == "OFF6".format(rfm9x.node):
            print("Solicitud de APAGAR Relay 6 de parte de: {}".format(sender))
            GPIO.output(20, GPIO.LOW)
            data = "Relay6 Inactivo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1

        elif packet == "ON6".format(rfm9x.node):
            print("Solicitud de ENCENDER Relay 6 de parte de: {}".format(sender))
            GPIO.output(20, GPIO.HIGH)
            data = "Relay6 Activo"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
        elif packet == "ONAll":
            print("Solicitud de ENCENDER TODOS los Relays de parte de: {}".format(sender))
            GPIO.output(27, GPIO.HIGH)
            GPIO.output(22, GPIO.HIGH)
            GPIO.output(23, GPIO.HIGH)
            GPIO.output(24, GPIO.HIGH)
            GPIO.output(26, GPIO.HIGH)
            GPIO.output(20, GPIO.HIGH)
            data = "Relays Activos"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
        elif packet == "OFFAll":
            print("Solicitud de APAGAR TODOS los Relays de parte de: {}".format(sender))
            GPIO.output(27, GPIO.LOW)
            GPIO.output(22, GPIO.LOW)
            GPIO.output(23, GPIO.LOW)
            GPIO.output(24, GPIO.LOW)
            GPIO.output(26, GPIO.LOW)
            GPIO.output(20, GPIO.LOW)
            data = "Relays Inactivos"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1
        else:
            data = "Comando No Reconocido"
            print("Datos a enviar: {}".format(data))
            # Se envÃ­a el packet de datos al Gateway
            ack = rfm9x.send(data, sender, with_ack=True)
            cont = 0
            while not ack:
                ack = rfm9x.send(data, sender, with_ack=True)
                print("Acknowledge {}".format(ack))
                if cont > retries:
                    break
                cont += 1

GPIO.cleanup()
