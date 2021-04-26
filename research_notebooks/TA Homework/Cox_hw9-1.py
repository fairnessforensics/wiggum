# Aidan Cox
# Due Date: April 12, 2021
# Homework 9 - Operating Systems

# Given: A list of processes with execution times
# Find: A schedule of the processes using time slices

import queue


# Function to get the time slice value and the processes from the file into the queue
# Queue will contain a string with process ID and exec time separated by a comma

def getProcs(cpuQ):
    fname = input("Enter the name of the file containing the processes: ")
    infile = open(fname, 'r')

    # Get the first line in the file containing the time slice value
    line = infile.readline()

    # Strip the \n from the line and convert to an integer

    tslice = int(line.strip())

    # Loop through the file inserting processes into the queue
    for line in infile:
        proc = line.strip()
        PID, exectime = proc.split(",")

        # Duplicating the exec time so we can get percentages later
        cpuQ.put(proc + "," + exectime)

    infile.close()

    return tslice, cpuQ


# Function to print the contents of the queue

def printQueue(tslice, cpuQ):
    print("The time slice is ", tslice, " \n The contents of the queue are: ")
    for i in range(cpuQ.qsize()):
        proc = cpuQ.get()
        cpuQ.put(proc)
        print(proc)


# Function to execute the processes in the queue

def scheduleProcs(cpuQ):
    while (cpuQ.empty() == 0):
        # Get next process from queue
        proc = cpuQ.get()

        # Separate the process ID, execution time and the total execution time from the process info
        PID, exectime, totalExecTime = proc.split(",")

        # Convert exectime and totalExecTime to an integer
        exectime = int(exectime)
        totalExecTime = int(totalExecTime)

        percentageComplete = (exectime / totalExecTime) * 100

        print("Getting next process - Process ", PID, " has ", exectime, "instructions out of", totalExecTime,
              "to execute -", round(percentageComplete, 2), "%")

        # Initialize the timer
        timer = 0

        # Determine the times lice for this process
        # Processes that have more than 50% of their execution time left to compute will be allowed two time slices,
        # while processes that have 50% or less of their execution time left will be allowed one time slice.
        if percentageComplete > 50:
            tslice = 2
        else:
            tslice = 1

        # While proc still has time in slice and still has code to execute
        while (timer < tslice) and (exectime > 0):
            # Execute an instruction of process
            exectime = exectime - 1

            # Count one tick of the timer
            timer = timer + 1

            print("Executing instruction ", exectime, " of process ", PID, ".  Timer = ", timer)

        # If proc still has instructions to execute put it back in the queue
        if (exectime > 0):
            # Create string with new exec time, process ID, and total exec time
            proc = PID + "," + str(exectime) + "," + str(totalExecTime)

            # Put the process back in the queue
            cpuQ.put(proc)

            print("Put process ", PID, " back in queue with ", exectime, " instructions left to execute\n")
        else:
            print("*** Process ", PID, " Complete ***\n")
    return


# Main function

def main():
    # Create the scheduling queue
    cpuQ = queue.Queue()

    # Get the processes from the data file
    tslice, cpuQ = getProcs(cpuQ)

    # Print the queue
    # printQueue(tslice, cpuQ)

    # Schedule the processes
    scheduleProcs(cpuQ)


main()
