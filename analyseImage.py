import subprocess

save_location = ""

import sys, json

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    lines = read_in()

    # Sum  of all the items in the providen array
    path = lines[0]
    #for item in lines:
    #    total_sum_inArray += item
    result = subprocess.check_output(['identify','-format','"%[mean]"',path])

    #return the sum to the output stream
    print(result)

# Start process
if __name__ == '__main__':
    main()