const Gpio = require('pigpio').Gpio;

class RpmReader {
    constructor(config) {
        this.config = config || {};

        this.inputPin = new Gpio(this.config.pin, {mode: Gpio.INPUT, alert: true});
        this.inputPin.pullUpDown(Gpio.PUD_UP);
        this.inputPin.on('alert', (level, tick) => {
            if (level == 1) {
              this.startTick = tick;
            } else {
              const endTick = tick;
              const diff = (endTick >> 0) - (this.startTick >> 0); // Unsigned 32 bit arithmetic

              this.value = 1000/diff;
              
              if (this.config.callback && this.isDifferent(this.lastValue, this.value)) this.config.callback(this, this.value);

              this.lastValue = this.value;
            }
        });

        if (this.config.powerPin) {
            this.powerPin = new Gpio(this.config.powerPin, {mode: Gpio.OUTPUT});
            this.powerPin.digitalWrite(1);         
        }

    }
    getValue() {
        return this.value;
    }
    isDifferent(lastValue, value) {
        return Math.abs((lastValue || 0) - value) > (this.config.sensitivity || 0);
    }
}

module.exports = {
    RpmReader
}