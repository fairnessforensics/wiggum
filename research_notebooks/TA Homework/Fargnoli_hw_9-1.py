#Thomas Fargnoli
#4/19/2021
#Homework 9 - Operating Systems

#Most of this code is commented and written by the sample code. What I did was change it so that it
#uses exception handling so that there are no value errors. I also changed the code so that if the
#process has more than 50% of its origginal execution time left, the given timeslice will be doubled.
#If the process has less than 50% then it will run for the regular timeslice


# Given: A list of processes with execution times
# Find: A schedule of the processes using time slices

import queue
import random

#This function uses exception handling to ensure that the program does not end when the error IOError is thrown
#Parameters: None
#Returns: The name of a working file

def fileNameError():
    #This is an while loop with internal exception handling, if the name of the file exists and opens, the goodFile is True and the loop ends.
    #The entire loop repeats if goodFile remains false
    #If IOError is given, then a message is sent and the loop repeats.
    goodFile = False
    while goodFile == False:
        try:
            fName = input("Enter the name of the file containing the processes: ")
            inFile = open(fName, 'r')
            inFile.close()
            goodFile = True
        except IOError:
            print('Invalid file name, Please try again...')
    return fName

# Function to get the time slice value and the processes from the file into the queue
# Queue will contain a string with process ID and exec time separated by a comma

def getProcs(cpuQ):
    fname = fileNameError()
    infile = open(fname, 'r')
    # Get the first line in the file containing the time slice value
    line = infile.readline()                        
    # Strip the \n from the line and convert to an integer
    tslice = int(line.strip())                      
    # Loop through the file inserting processes into the queue
    for line in infile:                             
        proc = line.strip()
        cpuQ.put(proc)
    infile.close()
    return tslice, cpuQ

# Function to print the contents of the queue

def printQueue(tslice, cpuQ):
    print("The time slice is ",tslice, " \n The contents of the queue are: ")
    for i in range(cpuQ.qsize()):
        proc = cpuQ.get()
        cpuQ.put(proc)
        print(proc)


# Function to execute the processes in the queue

def scheduleProcs(tslice, cpuQ):
    while (cpuQ.empty() == 0):                  
	# Get next process from queue
        proc = cpuQ.get()
        
        #I use exception handing here as a way to split the list into either two or three elements. If the process has three elements, then the original code throws a ValueError.
        #If the ValueError is thrown then the program checks to see if there are three elements and runs the same process as two elements but with the three elements.
        try:
            # Separate the process ID and the execution time from the process info
            PID, exectime = proc.split(",")             
            # Convert exectime to an integer
            exectime = int(exectime)
            #Store second exectime variable
            origExectime = exectime
        except ValueError:
            # Separate the process ID and the execution time from the process info
            PID, exectime, origExectime = proc.split(",")             
            # Convert exectime to an integer
            exectime = int(exectime)
            #Store second exectime variable
            origExectime = int(origExectime)
            
        print("Getting next process - Process ", PID," has ", exectime," instructions out of", origExectime, "to execute")
	# Initialize the timer
        timer = 0

        #This if statement determines if the amount of exectime left is larger than 50% of the original value, if it is then it doubles the timeslice applied. If it is not, then it applies the original timeslice
        if exectime > (origExectime*0.5):
            # While proc still has time in slice and still has code to execute
            while (timer < (2*tslice)) and (exectime > 0):  
                # Execute an instruction of process
                exectime = exectime - 1                         
                # Count one tick of the timer
                timer = timer + 1                       
                print("Executing instruction ", exectime," of process ", PID,".  Timer = ", timer)
        else:
            # While proc still has time in slice and still has code to execute
            while (timer < tslice) and (exectime > 0):  
                # Execute an instruction of process
                exectime = exectime - 1                         
                # Count one tick of the timer
                timer = timer + 1                       
                print("Executing instruction ", exectime," of process ", PID,".  Timer = ", timer)
            

	# If proc still has instructions to execute put it back in the queue
        if (exectime > 0):                          
	    # Create string with new exec time, process ID, and original exectime
            proc = PID + "," + str(exectime) + "," + str(origExectime)        
	    # Put the process back in the queue
            cpuQ.put(proc)                          
            print("Put process ", PID," back in queue with ", exectime," instructions left to execute")
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





    

