# Este código se encarga de recolectar los datos de humedad del suelo en cada nodo y enviarlos al Gateway mediante LoRa.
# Preparado por: Frander Hernández
# 14/02/2021

####################################################################################
# Declaración de librerías
####################################################################################
import time
import board
import busio
import digitalio
from analogio import AnalogIn
import adafruit_rfm9x
import sys

####################################################################################
# Declaración de pines
####################################################################################
# Declara el uso del LED built-in (integrado) en el Feather M0
# Pin #13
led = digitalio.DigitalInOut(board.D13)
led.direction = digitalio.Direction.OUTPUT

# Pines digitales (ON/OFF) para utilizarlos como alimentación(Vcc de los sensores)
power1 = digitalio.DigitalInOut(board.D12)
power1.direction = digitalio.Direction.OUTPUT

power2 = digitalio.DigitalInOut(board.D11)
power2.direction = digitalio.Direction.OUTPUT

power3 = digitalio.DigitalInOut(board.D10)
power3.direction = digitalio.Direction.OUTPUT

power4 = digitalio.DigitalInOut(board.D6)
power4.direction = digitalio.Direction.OUTPUT

power5 = digitalio.DigitalInOut(board.D5)
power5.direction = digitalio.Direction.OUTPUT


# Pines para lectura analógica (valores de 0 a 65535)
analog_in1 = AnalogIn(board.A1)
analog_in2 = AnalogIn(board.A2)
analog_in3 = AnalogIn(board.A3)
analog_in4 = AnalogIn(board.A4)
analog_in5 = AnalogIn(board.A5)
analog_BAT = AnalogIn(board.VOLTAGE_MONITOR)

####################################################################################
# Funciones
####################################################################################
# Función para el LED indicador de estatus: recibe el pin, el delay entre parpadeos
# y las veces que parpadea.
def blink(led, delay, veces):
    for i in range(0, veces):
        led.value = True
        time.sleep(delay)
        led.value = False
        time.sleep(delay)


# Colecta el valor analógico leído en el Pin (0 a 65535)
def get_lecture(pin):
    return pin.value


# Colecta el valor analógico leído en el Pin (0 a 65535) y lo transforma a voltaje
def get_voltage(pin):
    return (pin.value * 3.3) / 65536


# Colecta el valor analógico de la batería leído en el Pin A7 (0 a 65535) y lo transforma a voltaje
def get_BAT(pin):
    return round((pin.value * 2 * 3.3) / 65536, 2)


def power_on(vcc1, vcc2, vcc3, vcc4, vcc5):
    # Se encienden los pines digitales de alimentación, 1 pin para 2 sensores
    vcc1.value = True
    vcc2.value = True
    vcc3.value = True
    vcc4.value = True
    vcc5.value = True


def power_off(vcc1, vcc2, vcc3, vcc4, vcc5):
    # Se apagan los pines digitales de alimentación, 1 pin para 2 sensores
    vcc1.value = False
    vcc2.value = False
    vcc3.value = False
    vcc4.value = False
    vcc5.value = False


# Recolecta los datos de los 4 sensores y retorna un paquete (string) separado por "/"
def datos_humedad():
    # Se captura la lectura de los sensores
    # Acá se puede aplicar la ecuación de calibración a las lecturas
    lectura1 = get_lecture(analog_in1)
    lectura2 = get_lecture(analog_in1)
    lectura3 = get_lecture(analog_in1)
    lectura4 = get_lecture(analog_in1)
    lectura5 = get_lecture(analog_in1)
    lecturaBAT = get_BAT(analog_BAT)
    # Se forma el paquete a enviar. Se empaquetan los datos separados por un "/" para distinguirlos
    data = (
        str(lectura1)
        + "/"
        + str(lectura2)
        + "/"
        + str(lectura3)
        + "/"
        + str(lectura4)
        + "/"
        + str(lectura5)
        + "/"
        + str(lecturaBAT)
    )
    return data


####################################################################################
# Configuración del módulo de radio built-in Feather M0 RFM95
####################################################################################

# Define radio parameters.
RADIO_FREQ_MHZ = 915.0  # Frequency of the radio in Mhz. Must match your
# module! Can be a value like 915.0, 433.0, etc.

# Define pins connected to the chip.
# set GPIO pins as necessary - this example is for Feather M0 RFM9x
# CircuitPython build:
CS = digitalio.DigitalInOut(board.RFM9X_CS)
RESET = digitalio.DigitalInOut(board.RFM9X_RST)

# Initialize SPI bus.
spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)
# Initialze RFM radio
rfm9x = adafruit_rfm9x.RFM9x(spi, CS, RESET, RADIO_FREQ_MHZ)

# You can however adjust the transmit power (in dB).  The default is 13 dB but
# high power radios like the RFM95 can go up to 23 dB:
rfm9x.tx_power = 20

# Enable CRC checking
rfm9x.enable_crc = True
# Reintentos de envío del paquete antes de reportar un fallo
rfm9x.ack_retries = 10
# Delay entre el envío de cada ACK
rfm9x.ack_delay = 0.2
# Tiempo de espera del ack cuando se envía un mensaje
rfm9x.ack_wait = 1
rfm9x.xmit_timeout = 0.2
# Dirección del nodo
# 1 byte (0 a 255)
# Cambiar según el número de nodo de la red
rfm9x.node = 6
# Dirección del Gateway o destino
# 1 byte (0 a 255)
rfm9x.destination = 100

####################################################################################
# Ciclo infinito
###################################################################################
def send_ack(destination):
    rfm9x.destination = destination
    rfm9x.send(b"ok")


def rec_ack():
    packet = rfm9x.receive(
        with_ack=False, with_header=True, timeout=10.0, keep_listening=True
    )
    if packet is not None:
        if packet[4:] == b"ok":
            return True
        else:
            return False
    else:
        return False


# Siempre espera paquetes y envía el dato cuando se lo pide el Gateway, a menos que lo manden a dormir!
while True:
    print("Esperando mensajes...")
    power_on(power1, power2, power3, power4, power5)
    # Espera por un nuevo paquete: solo acepta si está dirigido a este Nodo
    packet = rfm9x.receive(
        with_ack=False, with_header=True, timeout=100.0, keep_listening=True
    )
    # Si no se recibe un paquete durante el Timeout, se retorna None.
    if packet is not None:
        x = [hex(x) for x in packet[0:4]]
        print("Hay un mensaje de parte de: {}".format(packet[1]))

        # Verifica si la dirección de destino (byte 1 del Header) del paquete recibido corresponde a este nodo
        if x[0] != hex(rfm9x.node):
            continue
        # Si la dirección corresponde, retorna el paquete y responde según la acción
        else:
            # Se ha recibido un paquete: debería ser la solicitud del Gateway de los datos de humedad
            # Intenta decodificar el paquete en "ascii", si ocurre un error retorna al while mediante el continue
            try:
                paquete = str(packet[4:], "ascii")
            except:
                continue
            print("Received (raw header):", x)
            # print("Received (raw payload): {0}".format(packet[4:]))
            print("Received (payload): {0}".format(paquete))
            print("RSSI: {0}".format(rfm9x.last_rssi))
            # Se recibe la solicitud explícita Data!{Gateway Address} de parte del Gateway
            if paquete == "Data!{0}".format(rfm9x.node):
                print("Solicitud de humedad de parte de: {}".format(x[1]))
                send_ack(int(packet[1]))
                # Colecta los datos de los sensores
                # Se indican los pines digitales de alimentación
                data = datos_humedad()
                print("Datos a enviar: {}".format(data))
                # Se envía el paquete de datos (lectura de los 4 sensores) al Gateway
                rfm9x.send(bytes(data, "UTF-8"))
                ack = rec_ack()
                print("Acknowledge {}".format(ack))
                blink(led, 0.1, 1)
                power_off(power1, power2, power3, power4, power5)
