# Wambulance Alerting Engine
## (Node Daemon)

## Synopsis
Multi process Node.js app which maintains a state_table of client/domain up/down statuses and performs a notifications when state changes based on client preferences. Actions are triggered by messages subscribed to on a rabbit work queue from up / down detectors running elsewhere.

### Installation
```
npm install
cp wambulance.sh /etc/init.d/
chmod +x /etc/init.d/wambulance.sh
```

### Running it
```
/etc/init.d/wambulance.sh start
or
bin/node_daemon.js
```
Debug mode
```
Start with DEBUG=wambulance-ns node lib/app.js
```

## Author
Daniel Korel
Sept, 2016
