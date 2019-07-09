from time import sleep
from datetime import datetime
from sh import gphoto2 as gp
from sh import identify as ide
import signal, os, subprocess, sys, json

def killgphoto2Process():
    p = subprocess.Popen(['ps', '-A'], stdout=subprocess.PIPE)
    out, err = p.communicate()

    for line in out.splitlines():
        if b'gvfsd-gphoto2' in line:
            pid = int(line.split(None,1)[0])
            os.kill(pid, signal.SIGKILL)

getConfig = ["--get-config"]

def getConfig():
    gp(getConfig)
    sleep(5)


if __name__ == '__main__':
    killgphoto2Process()
    getConfig()