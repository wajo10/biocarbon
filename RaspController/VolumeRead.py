import json
import time
from datetime import datetime
import RPi.GPIO as GPIO


class FlowMeter():
    """Class representing the flow meter sensor which handles input pulses
    and calculates current flow rate (L/min) measurement"""

    def __init__(self, PIN):
        self.old_flow_rate = 0.0
        self.flow_rate = 0.0
        self.volume = 0.0
        self.old_last_time = datetime.now()
        self.last_time = datetime.now()

        GPIO.setmode(GPIO.BCM)

        INPUT_PIN = PIN
        GPIO.setup(INPUT_PIN, GPIO.IN)
        GPIO.add_event_detect(INPUT_PIN,
                              GPIO.RISING,
                              callback=self.pulseCallback,
                              bouncetime=20)

    def pulseCallback(self, p):
        """Callback that is executed with each pulse" 
        received from the sensor """

        # Calculate the time difference since last pulse recieved
        current_time = datetime.now()
        diff = (current_time - self.last_time).total_seconds()

        # Calculate current flow rate
        hertz = 1. / diff
        self.old_flow_rate = self.flow_rate
        self.flow_rate = hertz / 5.425

        # Reset time of last pulse
        self.old_last_time = self.last_time
        self.last_time = current_time

    def getFlowRate(self):
        """ Return the current flow rate measurement. 
            If a pulse has not been received in more than one second, 
            assume that flow has stopped and set flow rate to 0.0
        """

        if (datetime.now() - self.last_time).total_seconds() > 1:
            self.old_flow_rate = 0.0
            self.flow_rate = 0.0

        return self.flow_rate

    def getVolume(self):
        if (self.last_time - self.old_last_time).total_seconds() <= 1:
            self.volume += (self.old_flow_rate + self.flow_rate) / 120 * (
                        self.last_time - self.old_last_time).total_seconds()
        return self.volume


# def main():
#     """ Main function for repeatedly collecting flow rate measurements
#         and sending them to the SORACOM API
#     """
#     # Begin infinite loop
#     while True:
#         # Get current timestamp and flow meter reading
#         timestamp = str(datetime.now())
#         flow_rate = FlowMeter.getFlowRate()
#         volume = FlowMeter.getVolume()
#         print('Timestamp: %s' % timestamp)
#         print('Flow rate: %f' % flow_rate)
#         print('Volume: %f' % volume)
#
#         # Delay
#         time.sleep(0.1)


# if __name__ == '__main__':
#     main()
