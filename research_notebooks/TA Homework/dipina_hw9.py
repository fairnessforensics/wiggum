# Jake DiPina CSC110 HW 9 Due 4/19/21

# Given: A list of processes with execution times
# Find: A schedule of the processes using time slices

import queue
import random

# Function to get the time slice value and the processes from the file into the queue
# Queue will contain a string with process ID and exec time separated by a comma

def getProcs(cpuQ):
    fname = input("Enter the name of the file containing the processes: ")
    infile = open(fname, "r")
    # Get the first line in the file containing the time slice value
    line = infile.readline()
    # Strip the \n from the line and convert to an integer
    tslice = int(line.strip())
    # Get the next line in the file containing the given percentage value
    line = infile.readline()
    # Loop through the file inserting processes into the queue
    for line in infile:
        proc = line.strip()
        cpuQ.put(proc)
    infile.close()
    return tslice, cpuQ

# Function to print the contents of the queue

def printQueue(tslice, cpuQ):
    print("The time slice is", tslice, " \nThe contents of the queue are: ",)
    for i in range(cpuQ.qsize()):
        proc = cpuQ.get()
        cpuQ.put(proc)
        print(proc)

# Function to execute the processes in the queue

def scheduleProcs(tslice, cpuQ):
    while (cpuQ.empty() == 0):
        # Get next process from queue
        proc = cpuQ.get()
        # Separate the process ID and the execution time from the process info
        PID, exectime = proc.split(",")
        # Convert exectime to an integer
        exectime = int(exectime)
        print("Getting next process - Process ", PID, " has ", exectime, " instructions to execute",)
        # If execution time less than or equal to 50%
        if exectime <= tslice // 2:
            # Initialize the timer
            timer = 0
            # While Proc still has time in slice and still has code to execute
            while (timer < tslice) and (exectime > 0):
                # Execute an instruction of process
                exectime = exectime - 1
                # Count one tick of the timer
                timer = timer + 1
                print("Executing instruction ", exectime, " of process ", PID, ". Timer = ", timer,)
        # Else if execution time is greater than 50%
        elif exectime > tslice * 2:
            # Initialize the timer
            timer = 0
            # New timeSlice calculated as remaining percentage times execution time
            new_tslice = int(tslice* exectime)
            # While proc still has time in slice and still has code to execute
            while (timer < new_tslice) and (exectime > 0):
                # Execute an instruction of process
                exectime = exectime - 1
                # Count one tick of the timer
                timer = timer + 1
                print("Executing instruction ", exectime, " of process ", PID, ". Timer = ", timer,)

        # If proc still has instructions to execute put it back in the queue
        if exectime > 0:
            # Create string with new exec time and process ID
            proc = str(PID) + ", " + str(exectime)
            # Put the process back in the queue
            cpuQ.put(proc)
            print("Put process ", PID, " back in queue with ", exectime, " instructions left to execute",)
        else:
            print("*** Process ", PID, " Complete ***")
    return

# Main function

def main():
    # Create the scheduling queue
    cpuQ = queue.Queue()
    # Get the processes from the data file
    tslice, cpuQ = getProcs(cpuQ)
    # Print the queue
    printQueue(tslice, cpuQ)
    # Schedule the processes
    scheduleProcs(tslice, cpuQ)
