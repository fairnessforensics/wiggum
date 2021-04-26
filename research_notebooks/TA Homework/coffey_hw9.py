#Caitlin Coffey
#Spring 2021
#Due Monday April 19th 2021
#Homework 9

# Given: A list of processes with execution times
# Find: A schedule of the processes using time slices

import queue
import random

# Function to get the time slice value and the processes from the file into the queue
# Queue will contain a string with process ID and exec time separated by a comma

def getProcs():
    fname = input("Enter the name of the data file")
    infile = open(fname, 'r')
    procList = []
    execList = []
    # Loop through the file inserting processes into the list
    for line in infile:                             
        line = line.strip()
        proc, eTime = line.split(',')
        procList = procList + [proc]
        execList = execList + [int(eTime)]
    infile.close()
    return procList, execList


# Function to execute the processes in the queue

def scheduleProcs(procList, execList):
    while (execList != 0):                  
        n = findShortestProcess(execList)
        PID = procList[n]
        exectime = execList[n]            
	# Convert exectime to an integer
        exectime = int(exectime)
        execList.pop(n)
        procList.pop(n)
        print("Getting next process - Process ", PID," has ", exectime," instructions to execute")
	# Initialize the timer
        timer = 0                                   
	# While proc still has time in slice and still has code to execute
        while(exectime > 1/2):  
	    # Execute an instruction of process
            exectime = exectime - 1/2                         
	    # Count one tick of the timer
            timer = timer + 1                       
            print("Executing instruction ", exectime," of process ", PID,".  Timer = ", timer)

	
            print("*** Process ", PID, " Complete ***")
    return


# Main function

def main():

    # Get the processes from the data file
    procList, execList = getProcs()
    print(procList, execList)

    # Schedule the processes
    scheduleProcs(procList, execList)
