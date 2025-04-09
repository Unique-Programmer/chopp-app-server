#!/bin/bash

LOG_FILE="/var/log/memory-usage.log"

while true; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')]" >> $LOG_FILE
  free -h >> $LOG_FILE
  echo "------------------------" >> $LOG_FILE
  sleep 30
done
