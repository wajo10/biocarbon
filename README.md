# Proyecto Biocarbón

## RaspGateway

### **main.py**

Este código se encarga de controlar las acciones que realiza el Gateway. Realiza solicitudes de humedad, activación/desactivación de relés y flujo.

```python
def flow():
```
Función que solicita datos de flujo al concentrador de datos, realiza 10 reintentos antes de dar error de comunicación. 

```python
def relays(command, identifier):
```
Función que solicita la activación/desactivación de los relés al concentrador de datos. Recibe un comando y un identificador desde el servidor. Realiza 10 reintentos antes de dar error de comunicación.

```python
def humidity(identifier):
```
Función que solicita datos de humedad a los nodos de medición. Recibe un identificador desde el servidor. 

```python
def mainLoop():
```

Función del ciclo principal, siempre está pidiendo datos de humedad a los nodos a menos que se realice una interrupción por parte del servidor para ejecutar otra función (flow o relays). Crea tres archivos .txt, uno para guardar los datos de humedad localmente, para cuantificar los errores y para guardar los parámetros de transmisión. La función además se encarga de subir los datos de humedad al servidor.

### **RFM9x.py**

```python
class RFM9X (object):
```
Esta clase representa la puesta en funcionamiento el envío y recepción de datos en el módulo RFM9X.

```python
rfm9x.tx_power = 20
``` 
Parámetro que permite cambiar la potencia de transmisión (13-20 dBm)

```python
rfm9x.signal_bandwidth = 500000
```
Parámetro que permite definir el ancho de banda (125 KHz-500 KHz)

```python
rfm9x.spreading_factor = 10
```
Parámetro que permite definir el factor de dispersión (7,8,9,10,11,12)

```python
def send(self, data, destination, with_ack=False) -> bool:
```
Función encargada de enviar datos y codificarlos

```python
def rec_ack(self) -> bool:
```
Función encargada de verificar si no hay timeout en la comunicación o desconexión del sistema.

```python
def send_ack(self, destination):
```
Función encargada de enviar la verificación del envío.

```python
def receive(self, with_ack=False):
```
Función encargada de recibir datos y decodificarlos.


## FeatherHumidity

### **FeatherCom.py**
Este código se encarga de recolectar los datos de humedad del suelo en cada nodo y enviarlos al Gateway mediante LoRa.

```python
def blink(led, delay, veces):
```
Función del LED indicador, recibe el pin, el delay entre parpadeos y las veces que
parpadea.

```python
def get_lecture(pin):
```
Función que obtiene el valor analógico leído en el pin (0 a 65535)

```python
def get_voltage(pin):
```
Función que obtiene el valor analógico leído en el Pin (0 a 65535) y lo transforma a voltaje

```python
def get_BAT(pin):
```
Función que obtiene el valor analógico de la batería leído en el pin A7 (0 a 65535) y lo transforma a tensión.

```python
def power_on(vcc1, vcc2, vcc3, vcc4, vcc5):
```
Función que enciende los pines digitales de alimentación, utiliza 1 pin para 2 sensores.

```python
def power_off(vcc1, vcc2, vcc3, vcc4, vcc5):
```
Función que apaga los pines digitales de alimentación, utiliza 1 pin para 2 sensores.

```python
def datos_humedad():
```
Función que se encarga de recolectar los datos de los sensores de humedad, se forma un paquete (string) el cual es el que se envía con los datos recolectados.

**Radio built-in Feather M0 RFM95 module configuration**

```python
rfm9x.tx_power = 20
``` 
Parámetro que permite cambiar la potencia de transmisión (13-20 dBm)

```python
rfm9x.signal_bandwidth = 500000
```
Parámetro que permite definir el ancho de banda (125 KHz-500 KHz)

```python
rfm9x.spreading_factor = 10
```
Parámetro que permite definir el factor de dispersión (7,8,9,10,11,12)

```python
def send(self, data, destination, with_ack=False) -> bool:
```
Función encargada de enviar datos y codificarlos

```python
def rec_ack(self) -> bool:
```
Función encargada de verificar si no hay timeout en la comunicación o desconexión del sistema.

```python
def send_ack(self, destination):
```
Función encargada de enviar la verificación del envío.

```python
def receive(self, with_ack=False):
```
Función encargada de recibir datos y decodificarlos.

```python
while True: 
```
Ciclo encargado de esperar paquetes y envíar el dato cuando se lo pide el Gateway. Si no se recibe un paquete durante el Timeout, se retorna None. Verifica si la dirección de destino (byte 1 del Header) del paquete recibido corresponde a este nodo.

## RaspController

### Relays.py 

```python
def update():
```
Función que actualiza los valores de flujo y volumen

```python
while True:
```
Ciclo que se encuentra esperando un comando a ejecutar, si es de "Flow" envía los datos de flujo al Gateway. Si es un comando para los relés ejecuta según lo que se solicite. 

### VolumeRead.py

```python
class FlowMeter():
```
Esta clase representa el sensor del medidor de flujo que maneja los pulsos de entrada y calcula la medición del caudal actual en L/min

```python
def __init__(self):
```
Se crean las instancias y se inicializan en 0.

```python
def pulseCallback(self, p):
```
Función que es ejecutada con cada pulso recibido por el sensor y es utilizada para calcular diferencia horaria desde el último pulso recibido, la tasa de flujo actual y restablece el tiempo del último pulso.

*Nota: self.flow_rate = hertz / 5.425  el valor de 5.425 es un valor seleccionado de funcionamiento para los sensores de flujo, esta frecuencia depende del sensor. (la sugerida es 5.5 para el sensor en uso)*

```python
def getFlowRate(self):
```
Función que se ejecuta para obtener la medida de flujo actual. Si no se ha recibido un pulso en más de un segundo, supone que el flujo se ha detenido y establece el caudal en 0.0. Retorna medida de caudal actual.

```python
def getVolume(self):
```
Función que se encarga de obtener el valor del volumen a partir del valor de flujo. Retorna el totalizador del volumen en un intervalo de tiempo




