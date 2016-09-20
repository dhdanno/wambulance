# Wambulance Alerting Engine
## (Node Daemon)

## Synopsis
Multi process Node.js app which queries the state_table index in ES and performs a notification based on client preferences


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
