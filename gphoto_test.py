from time import sleep
from datetime import datetime
from sh import gphoto2 as gp
from sh import identify as ide
import signal, os, subprocess

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

triggerCommand = ["--trigger-capture"]
downloadCommand = ["--get-all-files"]
triggerAndDownbload = ["--capture-image-and-download"]
keepRAW = ["--keep-raw"]

identify = ['-format "%[mean]"']

folder_name = shot_date + picID
save_location = "/root/CamSlider/imagesTaken/" + folder_name

def createSaveFolder():
    try:
        os.makedirs(save_location)
    except:
        print("FAILES dir create")
    os.chdir(save_location)

def camptureImages():
    gp(triggerAndDownbload)# + keepRAW)
    sleep(3)
    #gp(downloadCommand)

def convertImage():
    subprocess.call(['convert','-thumbnail','80x80','2019-07-01 18:45:47PiShots.JPG','2.JPG'])

def analyzeFile():
    result = subprocess.check_output(['identify','-format','"%[mean]"','2.JPG'])
    print(result)

def renameFiles(ID):
    for filename in os.listdir("."):
        if len(filename) < 13:
            if filename.endswith(".JPG"):
                os.rename(filename, (shot_time + ID + ".JPG"))
                print("Renamed the JPG")
            elif filename.endswith(".NEF"):
                os.rename(filename, (shot_time + ID + ".NEF"))
                print("Renamed the NEF")


killgphoto2Process()
createSaveFolder()
camptureImages()
sleep(5)
convertImage()
analyzeFile()
renameFiles(picID)