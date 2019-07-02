from time import sleep
from datetime import datetime
from sh import gphoto2 as gp
from sh import identify as ide
import signal, os, subprocess, sys, json

def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def killgphoto2Process():
    p = subprocess.Popen(['ps', '-A'], stdout=subprocess.PIPE)
    out, err = p.communicate()

    for line in out.splitlines():
        if b'gvfsd-gphoto2' in line:
            pid = int(line.split(None,1)[0])
            os.kill(pid, signal.SIGKILL)

shot_date = datetime.now().strftime("%Y-%m-%d")
shot_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
picID = "PiShots"

triggerAndDownbload = ["--capture-image-and-download"]
keepRaw = ["--keep-raw"]
setConfig = ["--set-config"]

lines = read_in()

def createSaveFolder():
    # Sum  of all the items in the providen array
    path = lines[0]

    try:
        os.makedirs(path)
    except:
        pass
    os.chdir(path)

def camptureImage():
    shutterSpeed = ["shutterspeed=" + lines[1]]
    iso = ["iso=" + lines[2]]
    gp(setConfig + shutterSpeed)
    gp(setConfig + iso)
    gp(triggerAndDownbload + keepRaw)

def renameFiles():
    for filename in os.listdir("."):
        if len(filename) < 13:
            if filename.endswith(".JPG"):
                os.rename(filename, (shot_time + ".JPG"))
                print(shot_time + ".JPG")
            elif filename.endswith(".NEF"):
                os.rename(filename, (shot_time + ".NEF"))


if __name__ == '__main__':
    killgphoto2Process()
    createSaveFolder()
    camptureImage()
    #sleep(5)
    renameFiles()