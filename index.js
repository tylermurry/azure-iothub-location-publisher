let deviceAmqp = require('azure-iot-device-amqp');
let device = require('azure-iot-device');

require('dotenv').config();
let client = deviceAmqp.clientFromConnectionString(process.env.DEVICE_CONNECTION_STRING);

let trackingFunction;
let latitude = 36.25, longitude = -94.15;

function startTracking() {
  trackingFunction = setInterval(() => {
    const message = JSON.stringify({
      loadNumber: process.env.LOADNUMBER,
      latitude: latitude,
      longitude: longitude,
    });

    latitude += 0.1;
    longitude += 0.1;

    console.log(`Sending message for ${message.loadNumber}: ${message}`);

    client.sendEvent(new device.Message(message), (err, res) => {
      if (err) console.log(err);
    });
  }, process.env.DELAY);
}

function stopTracking() {
  clearInterval(trackingFunction);
}

client.open(err => {
    client.getTwin((err, twin) => {
      if (!err) this.twin = twin;
      else console.error(err);

      twin.on('properties.desired', desired => {
        console.log(`Twin properties changed: ${JSON.stringify(desired)}`);

        if (desired.trackingMode) {
          if (desired.trackingMode.toUpperCase() === 'REALTIME') {
            startTracking();
          }
          else if (desired.trackingMode.toUpperCase() === 'OFF') {
            stopTracking();
          }
        }
      });

      console.log('Connected to IOT Hub');

      client.on('message', msg => {
        client.complete(msg, () => console.log(`<-- cloud message received: ${JSON.stringify(msg)}`));
      });
    });
});
