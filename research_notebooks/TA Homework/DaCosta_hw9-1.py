# Daniel DaCosta
#April 19, 2021
#Homework 9 - Operating Systems
#This program modifies the time-slicing CPU scheduling alogrithm to implement
#specific priority to processes that are further from being finished.

#This function gets the time slice value and the processes from the file into the queue
# Queue will contain a string with process ID and exec time separated by a comma
def getProcs():
    fname = input("Enter the name of the data file: ")
    infile = open(fname, 'r')
    procList = []
    execList = []
    totalExecList = [] 
    # Loop through the file inserting processes into the list
    tSlice = int(infile.readline())
    print("The time slice is ", tSlice)
    for line in infile:                             
        line = line.strip()
        proc, eTime = line.split(',')
        procList.append(proc)
        execList.append(int(eTime))
        totalExecList.append(int(eTime))
    infile.close()
    return tSlice, procList, execList, totalExecList

#This function executes the processes in the queue
def scheduleProcs(tSlice, procList, execList, totalExecList):
    i = 0
    while (len(execList) != 0):           
	# Separate the process ID and the execution time from the process info
        PID = procList[i]
        exectime = execList[i]
        totalExec = totalExecList[i]
        procList.pop(i)
        execList.pop(i)
        totalExecList.pop(i)                 
        print("Getting next process - Process ", PID," has ", exectime," out of ",totalExec," instructions to execute")
	# Initialize the timer
        timer = 0
        currentSlice = tSlice   
        if exectime > (totalExec/2):
            currentSlice = tSlice * 2                               
	# While proc still has time in slice and still has code to execute
        while (exectime > 0 and timer < currentSlice):  
	    # Execute an instruction of process
            exectime = exectime - 1                         
	    # Count one tick of the timer
            timer = timer + 1                       
            print("Executing instruction ", exectime," of process ", PID,".  Timer = ", timer)
    # If proc still has instructions to execute put it back in the queue
        if (exectime > 0):                               
	    # Put the process back in the queue
            exectime = int(exectime)
            procList.append(PID)
            execList.append(exectime) 
            totalExecList.append(totalExec)                        
            print("Put process ", PID," back in queue with ", exectime," instructions left to execute")
        else:
            print("*** Process ", PID, " Complete ***")
    return

#Main function that runs other functions
def main():
    # Get the processes from the data file
    tSlice, procList, execList, totalExecList = getProcs()
    print("The contents of the queue are: ")
    print(procList)
    print(execList)
    print(totalExecList)
    scheduleProcs(tSlice, procList,execList, totalExecList)
main()