# Proyecto Biocarbón

## RaspGateway

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



