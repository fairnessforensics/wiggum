import wiggum as wg
import timeit
import numpy as np
import pandas as pd
import string
import wiggum as wg
import statistics
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

global date_time
date_time = datetime.now().strftime("%Y_%m_%d-%I_%M_%S_%p")

def test(labeled_df, all_pearson_obj):
    labeled_df.get_subgroup_trends_1lev([all_pearson_obj])

def add_meta(data, random_seed, n_view, num_dep_indep, num_splitby, trial):
    np.random.seed(random_seed)
    labeled_df = wg.LabeledDataFrame(data)    
    
    # set dependent and independent for some xi, ignore for the rest
    dep_indep_list = np.random.choice(n_view*2, num_dep_indep)
    #print(dep_indep_list)
    roles = {'x'+str(i+1):['ignore'] if i not in dep_indep_list else ['independent','dependent'] 
             for i in range(n_view*2)}
    
    # vars without 'x' in them are splitbys
    splitby_var_list = [cn for cn in data.columns if not('x' in cn)]
    # set splitby for some variable, ignore for the rest
    splitby_list = np.random.choice(splitby_var_list, num_splitby)
    roles.update( {c:['splitby'] if c in splitby_list else ['ignore'] for c in splitby_var_list})    
    
    count_list = []

    var_types = {'x'+str(i+1):'continuous' for i in range(n_view*2)}
    var_types.update( {c:'categorical' for c in splitby_var_list})
    weighting = {}
    
    labeled_df.set_counts(count_list)
    labeled_df.set_roles(roles)
    labeled_df.set_var_types(var_types)
    labeled_df.meta_df

    # save metadata for tracking results
    data_size = len(data) 
    
    directory = '../data/scalability_test/'+ date_time
    if not(os.path.isdir(directory)):
        os.mkdir(directory)
    
    save_directory = directory +'/meta_' + str(data_size) + '_' + str(num_dep_indep) + '_' + str(num_splitby)      
    if not(os.path.isdir(save_directory)):
        os.mkdir(save_directory)

    meta_csv = 'meta' + str(trial) + '.csv'
    meta_file = os.path.join(save_directory, meta_csv)
    labeled_df.meta_df.to_csv(meta_file)    
    
    return labeled_df

def test_scalability(data, n_view, num_dep_indep, num_splitby, num_trial):
    temp_result = pd.DataFrame(columns=['size', 'num_dep_indep', 'number_splitby', 
                                        'cluster', 'trial', 'timings','timings_mean', 'timings_std'])
    
    random_seed_list = np.random.randint(100000, size=(num_trial))

    for i in range(num_trial):
        random_seed = random_seed_list[i]
        labeled_df = add_meta(data, random_seed, n_view, num_dep_indep, num_splitby, i)
        
        all_pearson_obj = wg.All_Pearson()
        
        # timing
        #time = %timeit -or10 -n100 -q labeled_df.get_subgroup_trends_1lev([all_pearson_obj])
        t = timeit.Timer(lambda: test(labeled_df, all_pearson_obj))
        repeat, number = 10, 100
        times = t.repeat(repeat, number) 

        m = statistics.mean(times)
        stdev = statistics.stdev(times)
        timeings_round = [round(time, 6) for time in times]

        row = {'size':len(data), 'num_dep_indep':num_dep_indep, 'number_splitby':num_splitby, 'cluster': 0,
                   'trial':i, 'timings': timeings_round,'timings_mean':m, 'timings_std': stdev}

        temp_result = temp_result.append(row, ignore_index=True)

    return temp_result

if __name__ == '__main__':
    result = pd.DataFrame(columns=['size', 'num_dep_indep', 'number_splitby', 
                                'cluster', 'trial', 'timings', 'timings_mean', 'timings_std'])

    data_size_list = [1000, 10000, 100000]
    cluster_list = [2, 4, 8, 16, 32]
    num_dep_indep_list = [4, 8, 16]
    num_splitby_list = [4, 8, 16]
    num_trial = 10

    #data_size_list = [1000]
    #cluster_list = [2]
    #num_dep_indep_list = [3]
    #num_splitby_list = [3]
    #num_trial = 2

    for data_size in data_size_list:
        for cluster in cluster_list:      
            file = '../data/scalability_test/synthetic_scalability_' + str(data_size) + \
                        '_cluster' + str(cluster) + '.csv'
            data = pd.read_csv(file)
            
            n_view = int(len(data.columns) / 3)

            for num_dep_indep in num_dep_indep_list:
                for num_splitby in num_splitby_list:  
                    
                    temp_result = test_scalability(data, n_view, num_dep_indep, num_splitby, num_trial)
                    temp_result["cluster"] = cluster
                    
                    result = result.append(temp_result)

    file = '../data/scalability_test/'+ date_time +'/result.csv'
    result.to_csv(file ,index=False)

