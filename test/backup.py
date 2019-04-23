import os
cmd = "./backup.sh"
#os.system(cmd)
data = os.popen(cmd)
print (data.read())