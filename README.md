# Proyecto Biocarbón
Este proyecto está enfocado en un sistema que mide el estado de cambio de la humedad del suelo tratado con biocarbón para la activación/desactivación de líneas de riego por medio de un control ON/OFF. Para esto se utiliza tecnología IoT, sensores de humedad, sensores de flujo y tecnología LoRa, esta última permite comunicar los nodos de medición de humedad, por medio de radiofrecuencia, a un Gateway que se encarga de subir los datos a un servidor. Además, se tiene un concentrador de datos (controller) encargado de la activación/desactivación de las líneas de riego, este también utiliza LoRa para comunicarse con el Gateway.

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

# Control ON-OFF según parámetros para riego dependiendo del tratamiento de suelo

## 1. Programa control_con_outliers.py

Se crearon funciones para la recolección de los datos dependiendo del tratamiento para el control del riego:

- Activar_linea
- Desactivar_linea
- Manejo_outliers
- Lectura_0F_con_promedios
- Lectura_1F_con_promedios
- Lectura_2F_con_promedios
- Lectura_bc_con_promedios  
- Lectura_bccom_con_promedios
- Analisis_de_condiciones

### Parámetros

- url: es la dirección por la cual se realizan las operaciones por medio del API.
- valores: lista para guardado de valores operado en distintas secciones del programa.
- valores1: lista para guardado de valores operado en distintas secciones del programa.
- baja_humedad: representa el límite inferior de valor de humedad, si se encuentra por debajo de este valor se activará la línea.
- alta_humedad: representa el límite superior de valor de humedad, si se encuentra por encima de este valor se desactivará la línea.
- sleep_time: representa el tiempo que se esperará para volver a revisar los datos y decidir si se activan o no ciertas líneas.
- delay_time: es un retardo después del encendido de una línea.


### 1.1 Activar_linea

- Esta función se encarga de encender una línea de riego, a través de una solicitud a la base de datos.


##### Encabezado de la función.

```Python
def activar_linea(numero_linea):
```

##### Entradas

- `numero_linea`: representa el número de línea que se activará.

##### Salidas

- `requests.get(url+command)`: ejecuta la solicitud al servidor de encendido del número de línea establecido.

### 1.2 Desactivar_linea

- Esta función se encarga de apagar una línea de riego, a través de una solicitud a la base de datos.


##### Encabezado de la función.

```Python
def desactivar_linea(numero_linea):
```

##### Entradas

- `numero_linea`: representa el número de línea que se desactivará.

##### Salidas

- `requests.get(url+command)`: ejecuta la solicitud al servidor de apagado del número de línea establecido.

### 1.3 Manejo_outliers

- Esta función se encarga de detectar un valor outlier para no ser considerado al momento de promediar los datos y decidir si se debe o no encender una línea de tratameinto. Tome en cuenta que son necesarios tres valores diferentes de "None" para poder identificar un outlier.


##### Encabezado de la función.

```Python
 def manejo_outliers(x,y,z,cm1,cm2,cm3):
```

##### Entradas

- `x`: representa el primer valor de una maceta.
- `y`: representa el segundo valor de una maceta.
- `z`: representa el tercer valor de una maceta.
- `cm1`: representa el número de la primera maceta.
- `cm2`: representa el número de la segunda maceta.
- `cm3`: representa el número de la tercera maceta.


##### Salidas

- `lista`: devuelve los valores que entraron si alguno representaba un outlier se regresa ese valor como un "None".


### 1.4 Lectura_0F_con_promedios

- Esta función se encarga de recolectar los datos de las macetas con tratamiento 0F y promediarlos.


##### Encabezado de la función.

```Python
 def lectura_0F_con_promedios():
```

##### Entradas

- Últimos datos de humedad de las macetas 23,24,25 Caja I sensor(es) ABC(1,2,3).
- Últimos datos de humedad de las macetas 33,34,35 Caja K sensor(es) CBA(3,2,1).
- Últimos datos de humedad de las macetas 45,46,47 Caja M sensor(es) A(1) y Caja N sensor(es) ED(5,4).


##### Salidas

- `prom_prom`: devuelve el valor del promedio de los promedios de los 3 grupos de 3 macetas.

### 1.5 Lectura_1F_con_promedios

- Esta función se encarga de recolectar los datos de las macetas con tratamiento 1F y promediarlos.

##### Encabezado de la función.

```Python
 def lectura_1F_con_promedios():
```

##### Entradas

- Últimos datos de humedad de las macetas 26,27,28 Caja I sensor(es) E(5) y Caja J sensor(es) ED(5,4).
- Últimos datos de humedad de las macetas 41,42,43 Caja L sensor(es) CBA(3,2,1).
- Últimos datos de humedad de las macetas 53,54,55 Caja O sensor(es) CBA(3,2,1).

##### Salidas

- `prom_prom`: devuelve el valor del promedio de los promedios de los 3 grupos de 3 macetas.

### 1.6 Lectura_2F_con_promedios

- Esta función se encarga de recolectar los datos de las macetas con tratamiento 2F y promediarlos.

##### Encabezado de la función.

```Python
 def lectura_2F_con_promedios():
```

##### Entradas

- Últimos datos de humedad de las macetas 37,38,39 Caja M sensor(es) DE(4,5) y Caja J sensor(es) C(3).
- Últimos datos de humedad de las macetas 50,51,52 Caja N sensor(es) A(1) y Caja O sensor(es) ED(5,4).

##### Salidas

- `prom_prom`: devuelve el valor del promedio de los promedios de los 2 grupos de 3 macetas.

### 1.7 Lectura_bc_con_promedios

- Esta función se encarga de recolectar los datos de las macetas con tratamiento BC y promediarlos.

##### Encabezado de la función.

```Python
def lectura_bc_con_promedios():
```

##### Entradas

- Últimos datos de humedad de las macetas 17,22,36,40,49 Caja I sensor(es) D(4), Caja K sensor(es) E(5), Caja M sensor(es) C(3), Caja L sensor(es) D(4) y Caja N sensor(es) B(2).

##### Salidas

- `prom_prom`: devuelve el valor del promedio de las 5 macetas.

### 1.8 Lectura_bccom_con_promedios

- Esta función se encarga de recolectar los datos de las macetas con tratamiento BC+COM y promediarlos.

##### Encabezado de la función.

```Python
def lectura_bccom_con_promedios():
```

##### Entradas

- Últimos datos de humedad de las macetas 32,44,48 Caja K sensor(es) D(4), Caja M sensor(es) B(2) y Caja N sensor(es) C(3).

##### Salidas

- `prom_prom`: devuelve el valor del promedio de las 3 macetas.

### 1.9 Analisis_de_condiciones

- Esta función se encarga de recolectar los datos y compararlos con los parámetros para tomar las deciones sobre si se encienden las líneas o no.


##### Encabezado de la función.

```Python
 def analisis_de_condiciones():
```

##### Entradas

- `baja humedad`: representa el límite inferior de valor de humedad, si se encuentra por debajo de este valor se activará la línea.
- `alta humedad`: representa el límite superior de valor de humedad, si se encuentra por encima de este valor se desactivará la línea.


##### Salidas

- `numero_linea`: representa la línea a encender.




