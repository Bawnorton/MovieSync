#!/bin/zsh

sshpass -p "ruth*vapour8NAPKIN" scp ~/Documents/Developer/Python/MovieSync/server.py root@162.248.100.184:/home/python/MovieSyncServer
sshpass -p "ruth*vapour8NAPKIN" ssh -t root@162.248.100.184 "cd /home/python/MovieSyncServer; ./server.py"