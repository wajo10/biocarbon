from RFM9X import RFM9X
import time
rfm9x = RFM9X()
nodes = [2]
for node in nodes:
    t1 = time.time()
    message = "Data!{0}".format(node)
    ack = rfm9x.send(message, node, with_ack=True)
    print("Acknowledge? {}".format(ack))
    print(rfm9x.receive(with_ack=True))
    print("Tiempo: {}".format(time.time()-t1))
