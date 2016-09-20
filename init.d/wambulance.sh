#!/bin/sh
######################################
#
# Wambulance init.d service
#
# Daniel Korel | 2016
#
# Auto Start:
# Ubuntu: /etc/update-rc.d wambulance defaults
# CentOS: chkconfig wambulance on
#
######################################

# Usage: /etc/init.d/wambulance <start|stop|status>

### BEGIN INIT INFO
# Required-Start:    $local_fs $network $syslog
# Required-Stop:     $local_fs $network $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Description:       https://github.com/dhdanno/wambulance
### END INIT INFO

NAME="wambulance"
RUNAS=root
PIDFILE=/var/run/$NAME.pid

pid_file_exists() {
    [ -f "$PIDFILE" ]
}

get_pid() {
    echo "$(cat "$PIDFILE")"
}

is_running() {
    PID=$(get_pid)
    ! [ -z "$(ps aux | awk '{print $2}' | grep "^$PID$")" ]
}

start() {
  if [ -f $PIDFILE ] ; then
    echo 'Service already running' >&2
    return 1
  fi
  echo 'Starting '$NAME >&2
  cd /opt/wambulance/
  DEBUG=wambulance-ns node bin/node_daemon.js >> /var/log/$NAME.log 2>&1 &
  # Non traditional way to get the pid of the parent process
  sleep 4; # Wait a while for the parent process forking to complete to ensure we get the correct pid.
  echo `ps aux | grep wambulance | grep Ssl | awk '{print $2}'` > $PIDFILE
  #jobs -p > $PIDFILE
  echo $NAME' started' >&2
}

stop() {
  if [ ! -f "$PIDFILE" ] || ! kill -0 $(cat "$PIDFILE"); then
    echo $NAME' not running' >&2
    return 1
  fi
  echo 'Stopping '$NAME' service...' >&2
  kill -TERM $(cat "$PIDFILE") && rm -f "$PIDFILE"
  echo $NAME' stopped' >&2
}

status() {
  if pid_file_exists
  then
  if is_running
  then
    PID=$(get_pid)
    echo "$NAME running with pid $PID"
  else
    echo "$NAME stopped, but pid file exists"
  fi
  else
    echo "$NAME stopped"
  fi
}


case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  uninstall)
    uninstall
    ;;
  restart)
    stop
    start
    ;;
  status)
    status
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart}"
esac
