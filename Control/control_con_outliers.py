#Captura de datos
import statistics
from statistics import mean
import time
import requests
import json
def control_con_outliers():
    url = "http://201.207.53.225:3031/api/biocarbon/"
    valores=['','','']
    valores1=['','',''] 
    baja_humedad=15.00
    alta_humedad=20.00
    sleep_time=300 #15 minutos
    delay_time=20
    def activar_linea(numero_linea):
        #numero_linea
        try:
            #y = requests.get(url+"Relay/"+numero_linea) #Estado de linea de agua
            #if( y == 'OFF'):
            command = "Relays/ON/"+numero_linea
            requests.get(url+command)
            print('Se activo la linea '+numero_linea)
            time.sleep(delay_time)
            return
            #else :
                #print('La linea '+numero_linea+' ya estaba activa se mantiene asi')
                #return
        except:
            print('No se pudo activar la linea'+numero_linea)
            return
    
    def desactivar_linea(numero_linea):
        try:
            #numero_linea
            #y = requests.get(url+"Relay/"+numero_linea) #Estado de linea de agua
            #if( y == 'ON'):
            command = "Relays/OFF/"+numero_linea
            requests.get(url+command)
            print('Se desactivo la linea '+numero_linea)
            time.sleep(delay_time)
            return
            #else :
                #print('La linea '+numero_linea+' ya estaba desactivada se mantiene asi')
                #return
        except:
            print('No se pudo desactivar la linea'+numero_linea)
            return
    
    def manejo_outliers(x,y,z,cm1,cm2,cm3):
        lista = [x,y,z]
        if((lista[0]!=None) and (lista[1]!=None) and (lista[2]!=None)):
            if(lista[0]-lista[1]>10 or lista[0]-lista[1]<-10):
                if(lista[0]>100):
                    lista[0]=None
                    print('La maseta '+cm1+' no tiene dato porcentual.')
                    return lista
                if(lista[1]>100):
                    lista[1]=None
                    print('La maseta '+cm2+' no tiene dato porcentual.')
                    return lista
                if(lista[2]>100):
                    lista[2]=None
                    print('La maseta '+cm3+' no tiene dato porcentual.')
                    return lista
                if(lista[0]-lista[2]>10 or lista[0]-lista[2]<-10):
                    lista[0]=None
                    print('La(s) maceta(s) '+cm1+' se comporta de forma no esperada.')
                    return lista
                else:
                    return lista
            elif(lista[1]-lista[0]>10 or lista[1]-lista[0]<-10):
                if(lista[1]-lista[2]>10 or lista[1]-lista[2]<-10):
                    lista[1]=None
                    print('La(s) maceta(s) '+cm2+' se comporta de forma no esperada.')
                    return lista
                else:
                    return lista
            elif(lista[2]-lista[0]>10 or lista[2]-lista[0]<-10):
                if(lista[2]-lista[1]>10 or lista[2]-lista[1]<-10):
                    lista[2]=None
                    print('La(s) maceta(s) '+cm3+' se comporta de forma no esperada.')
                    return lista
                else:
                    return lista
            else:
                return lista
        else:
            if(lista[0]==None):
                print('La maceta '+cm1+' no esta enviando datos válidos.')
                return lista
            if(lista[1]==None):
                print('La maceta '+cm2+' no esta enviando datos válidos.')
                return lista
            if(lista[2]==None):
                print('La maceta '+cm3+' no esta enviando datos válidos.')
                return lista  
    
    
    
    def lectura_0F_con_promedios():
        #Tratamiento 0F biocarbono 
            #macetas 23,24,25 Caja I sensor(es) ABC(1,2,3)
            #macetas 33,34,35 Caja K sensor(es) CBA(3,2,1)
            #macetas 45,46,47 Caja M sensor(es) A(1) y Caja N sensor(es) ED(5,4)
        
        #########################################################################
            valores=['','','']
            #macetas 23,24,25
            try:
                x = requests.get(url+"LastHumidity/I")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensora"])
                except:
                    valores[0]=None
                try:
                    valores[1]=float(x["data"]["sensorb"])
                except:
                    valores[1]=None
                try:
                    valores[2]=float(x["data"]["sensorc"])
                except:
                    valores[2]=None
            except:
                valores[0]=None
                valores[1]=None
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'23','24','25')
                prom_1=mean(d for d in valores if d is not None)
                print('Promedio macetas 23, 24 y 25: ',prom_1)
            except:
                prom_1=None
            
    
            #macetas 33,34,35
            try:
                x = requests.get(url+"LastHumidity/K")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensorc"])
                except:
                    valores[0]=None
                try:
                    valores[1]=float(x["data"]["sensorb"])
                except:
                    valores[1]=None
                try:        
                    valores[2]=float(x["data"]["sensora"])
                except:
                    valores[2]=None
            except:
                valores[0]=None
                valores[1]=None
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'33','34','35')
                prom_2=mean(d for d in valores if d is not None)
                print('Promedio macetas 33, 34 y 35: ',prom_2)
            except:
                prom_2=None
                
            #macetas 45, 46, 47
            try:
                x = requests.get(url+"LastHumidity/M")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensora"])
                except:
                    valores[0]=None
            except:
                valores[0]=None            
            try:
                x = requests.get(url+"LastHumidity/N")
                x = json.loads(x.text)
                try:
                    valores[1]=float(x["data"]["sensore"])
                except:
                    valores[1]=None
                try:
                    valores[2]=float(x["data"]["sensord"])
                except:
                    valores[2]=None
            except:
                valores[1]=None
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'45','46','47')
                prom_3=mean(d for d in valores if d is not None)
                print('Promedio macetas 45, 46 y 47: ',prom_3)
            except:
                prom_3=None
    
    
            #Promedio de promedios y condiciones
            try:
                valores=[prom_1,prom_2,prom_3]
                valores = manejo_outliers(valores[0],valores[1],valores[2],'23, 24 y 25','33, 34 y 35','45, 46 y 47')
                prom_prom=mean(d for d in valores if d is not None)
                print('Promedio de promedios tratamiento 0F: ',prom_prom)
                return prom_prom
            except:
                return 'La red de lectura 0F tiene problemas'
    
    def lectura_1F_con_promedios():
        #Tratamiento 1F biocarbono 
            #macetas 26,27,28 Caja I sensor(es) E(5) y Caja J sensor(es) ED(5,4)
            #macetas 41,42,43 Caja L sensor(es) CBA(3,2,1)
            #macetas 53,54,55 Caja O sensor(es) CBA(3,2,1)
    
        #########################################################################
            valores=['','','']
            #macetas 26,27,28
            try:
                x = requests.get(url+"LastHumidity/I")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensore"])
                except:
                    valores[0]=None
            except:
                valores[0]=None
            try:
                x = requests.get(url+"LastHumidity/J")
                x = json.loads(x.text)
                try:
                    valores[1]=float(x["data"]["sensore"])
                except:
                    valores[1]=None
                try:
                    valores[2]=float(x["data"]["sensord"])
                except:
                    valores[2]=None
            except:
                valores[1]=None
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'26','27','28')
                prom_1=mean(d for d in valores if d is not None)
                print('Promedio macetas 26, 27 y 28: ',prom_1)
            except:
                prom_1=None
    
            #macetas 41,42,43
            try:
                x = requests.get(url+"LastHumidity/L")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensorc"])
                except:
                    valores[0]=None
                try:
                    valores[1]=float(x["data"]["sensorb"])
                except:
                    valores[1]=None
                try:
                    valores[2]=float(x["data"]["sensora"])
                except:
                    valores[2]=None
            except:
                valores[0]=None
                valores[1]=None
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'41','42','43')
                prom_2=mean(d for d in valores if d is not None)
                print('Promedio macetas 41, 42 y 43: ',prom_2)
            except:
                prom_2=None
                
            #macetas 53,54,55
            try:
                x = requests.get(url+"LastHumidity/O")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensorc"])
                except:
                    valores[0]=None
                try:
                    valores[1]=float(x["data"]["sensorb"])
                except:
                    valores[1]=None
                try:
                    valores[2]=float(x["data"]["sensora"])
                except:
                    valores[2]=None
            except:
                valores[0]=None
                valores[1]=None
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'53','54','55')
                prom_3=mean(d for d in valores if d is not None)
                print('Promedio macetas 53, 54 y 55: ',prom_3)
            except:
                prom_3=None
    
            #Promedio de promedios y condiciones
            try:    
                valores=[prom_1,prom_2,prom_3]
                valores = manejo_outliers(valores[0],valores[1],valores[2],'26, 27 y 28','41, 42 y 43','53, 54 y 55')
                prom_prom=mean(d for d in valores if d is not None)
                print('Promedio de promedios tratamiento 1F: ',prom_prom)
                return prom_prom
            except:
                return 'La red de lectura 1F tiene problemas'
    
    def lectura_2F_con_promedios():
        #Tratamiento 2F biocarbono 
            #macetas 37,38,39 Caja M sensor(es) DE(4,5) y Caja J sensor(es) C(3)
            #macetas 50,51,52 Caja N sensor(es) A(1) y Caja O sensor(es) ED(5,4)
    
        #########################################################################
            valores=['','','']
            #macetas 37,38,39
            try:
                x = requests.get(url+"LastHumidity/M")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensord"])  
                except:
                    valores[0]=None
                try:
                    valores[1]=float(x["data"]["sensore"])
                except:
                    valores[1]=None
            except:
                valores[0]=None
                valores[1]=None
            try:
                x = requests.get(url+"LastHumidity/J")
                x = json.loads(x.text)
                try:
                    valores[2]=float(x["data"]["sensorc"])
                except:
                    valores[2]=None
            except:
                valores[2]=None
            
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'37','38','39')
                prom_1=mean(d for d in valores if d is not None)
                print('Promedio macetas 37, 38 y 39: ',prom_1)
            except:
                prom_1=None
    
            #macetas 50,51,52
            try:
                x = requests.get(url+"LastHumidity/N")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensora"])
                except:
                    valores[0]=None
            except:
                valores[0]=None
            try:
                x = requests.get(url+"LastHumidity/O")
                x = json.loads(x.text)
                try:
                    valores[1]=float(x["data"]["sensore"])
                except:
                    valores[1]=None
                try:
                    valores[2]=float(x["data"]["sensord"])
                except:
                    valores[2]=None
            except:
                valores[1]=None
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'50','51','52')
                prom_2=mean(d for d in valores if d is not None)
                print('Promedio macetas 50, 51 y 52: ',prom_2)
            except:
                prom_2=None
                
            #macetas 53,54,55
            #x = requests.get(url+"LastHumidity/O")
            #x = json.loads(x.text)
            #valores[0]=float(x["data"]["sensorc"])
            #valores[1]=float(x["data"]["sensorb"])
            #valores[2]=float(x["data"]["sensora"])
            #prom_3=statistics.mean(valores)
            #print(prom_3)
    
            #Promedio de promedios y condiciones
            try: 
                valores=[prom_1,prom_2]
                prom_prom=mean(d for d in valores if d is not None)        #,prom_3])
                if((valores[0]!=None) and (valores[1]!=None)):
                    if(valores[0]-valores[1]>10 or valores[0]-valores[1]<-10):
                        print('Las macetas 37, 38 y 39 y las macetas 50, 51 y 52 están mostrando datos muy diferentes.')
                        if(valores[0]>100):
                            print('Las masetas 37, 38 y 39 no tiene dato porcentual.')
                            print('Promedio de promedios 2F: ',valores[1])
                            return valores[1]
                        elif(valores[1]>100):
                            print('Las masetas 50, 51 y 52 no tiene dato porcentual.')
                            print('Promedio de promedios 2F: ',valores[0])
                            return valores[0]
                        else:
                            print('Promedio de promedios 2F: ',prom_prom)
                            return prom_prom
                    else:
                        print('Promedio de promedios tratamiento 2F: ',prom_prom)
                        return prom_prom
                else:
                    print('Promedio de promedios tratamiento 2F: ',prom_prom)
                    return prom_prom
            except:
                return 'La red de lectura 2F tiene problemas'
    
    def lectura_bc_con_promedios():
        #Tratamiento BC biocarbono
            #macetas 17,22,36,40,49 Caja I sensor(es) D(4), Caja K sensor(es) E(5), Caja M sensor(es) C(3), Caja L sensor(es) D(4) y Caja N sensor(es) B(2)
        
        #########################################################################
            valores=['','','']
            #macetas 17,22,36
            try:
                x = requests.get(url+"LastHumidity/I")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensord"])
                except:
                    valores[0]=None
            except:
                    valores[0]=None
            try:        
                x = requests.get(url+"LastHumidity/K")
                x = json.loads(x.text)
                try:
                    valores[1]=float(x["data"]["sensore"])
                except:
                    valores[1]=None
            except:
                valores[1]=None
            try:
                x = requests.get(url+"LastHumidity/M")
                x = json.loads(x.text)
                try:
                    valores[2]=float(x["data"]["sensorc"]) 
                except:
                    valores[2]=None
            except:
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'17','22','36')
                prom_1=mean(d for d in valores if d is not None)
                print('Promedio macetas 17, 22 y 36: ',prom_1)
            except:
                prom_1=None
    
            #macetas 40,49
            try:
                x = requests.get(url+"LastHumidity/L")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensord"])
                except:
                    valores[0]=None
            except:
                valores[0]=None
            try:
                x = requests.get(url+"LastHumidity/N")
                x = json.loads(x.text)
                try:
                    valores[1]=float(x["data"]["sensorb"])
                except:
                    valores[1]=None
            except:
                valores[1]=None
            try:
                valores[2]=None
                if((valores[0]!=None) and (valores[1]!=None)):
                    if(valores[0]-valores[1]>10 or valores[0]-valores[1]<-10):
                        print('Las maceta 40 y 49 se comporta de forma no esperada.')
                prom_2=mean(d for d in valores if d is not None)
                print('Promedio macetas 40 y 49: ',prom_2)
            except:
                prom_2=None
                
            #Promedio de promedios y condiciones
            try: 
                valores=[prom_1,prom_2]
                if((valores[0]!=None) and (valores[1]!=None)):
                    if(valores[0]-valores[1]>10 or valores[0]-valores[1]<-10):
                        print('Las macetas 17, 22 y 36 y las macetas 40 y 49 están mostrando datos muy diferentes.')
                prom_prom=mean(d for d in valores if d is not None)        #,prom_3])
                print('Promedio de promedios tratamiento BCCON: ',prom_prom)
                return prom_prom
            except:
                return 'La red de lectura BCCON tiene problemas'
            
    def lectura_bccom_con_promedios():
        #Tratamiento BC+COM biocarbono
            #macetas 32,44,48 Caja K sensor(es) D(4), Caja M sensor(es) B(2) y Caja N sensor(es) C(3)
        
        #########################################################################
            valores=['','','']
            #macetas 32,44,48
            try:
                x = requests.get(url+"LastHumidity/K")
                x = json.loads(x.text)
                try:
                    valores[0]=float(x["data"]["sensord"])
                except:
                    valores[0]=None
            except:
                valores[0]=None
            try:
                x = requests.get(url+"LastHumidity/M")
                x = json.loads(x.text)
                valores[1]=float(x["data"]["sensorb"])
            except:
                valores[1]=None
            try:
                x = requests.get(url+"LastHumidity/N")
                x = json.loads(x.text)
                try:
                    valores[2]=float(x["data"]["sensorc"]) 
                except:
                    valores[2]=None
            except:
                valores[2]=None
            try:
                valores = manejo_outliers(valores[0],valores[1],valores[2],'32','44','48')
                print("BCCOM")
                print(valores)
                prom_1=mean(d for d in valores if d is not None)
                print('Promedio de promedios tratamiento BCCOMCON: ',prom_1)
                return prom_1
            except:
                return 'La red de lectura BCCOMCON CON tiene problemas'
            
    def analisis_de_condiciones():
        try:
            try:
                x = lectura_0F_con_promedios()
                if(   x < baja_humedad      ):
                         activar_linea('1')
                elif( x > alta_humedad      ):
                        desactivar_linea('1')
            except:
                print('Todas las cajas del tratamiento 0F no estan funcionando')
            try:
                x = lectura_1F_con_promedios()
                if(   x < baja_humedad       ):
                         activar_linea('2')
                elif( x > alta_humedad       ):
                        desactivar_linea('2')
            except:
                print('Todas las cajas del tratamiento 1F no estan funcionando')
            try:
                x = lectura_2F_con_promedios()
                print(x)
                if(  x < baja_humedad       ):
                         activar_linea('3')
                elif( x > alta_humedad      ):
                        desactivar_linea('3')
            except:
                print('Todas las cajas del tratamiento 2F no estan funcionando')
            try:
                x = lectura_bc_con_promedios()
                if( x < baja_humedad):
                         activar_linea('4')
                elif( x > alta_humedad ):
                        desactivar_linea('4')
            except:
                print('Todas las cajas del tratamiento BC no estan funcionando')
            try:
                x = lectura_bccom_con_promedios()
                if( x < baja_humedad):
                         activar_linea('5')
                elif( x > alta_humedad ):
                        desactivar_linea('5')
            except:
                print('Todas las cajas del tratamiento BC+COM no estan funcionando')
        except:
            print('Error en analisis')
        return
    
    analisis_de_condiciones()
    control_con_outliers()
    return
control_con_outliers()
