import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats
import warnings
import itertools as itert



stat_comp = {
    'acc': lambda c: (c['TP'] + c['TN'])/sum(c),
    'ppv': lambda c: c['TP']/(c['TP'] + c['FP']),
    'tpr': lambda c: c['TP']/(c['TP'] + c['FN']),
    'tnr': lambda c: c['TN']/(c['TN'] + c['FP']),
    'fdr': lambda c: c['FP']/(c['TP'] + c['FP']),
    'f1': lambda c: 2*c['TP']/(2*c['TP']+c['FP']+c['FN'])}

class BinClassStats():

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a trend between two variables that are prediction and ground
        truth, requires a precompute step to augment the data with row-wise
        labels for speed

        returns result df with rows for accuracy (acc), true positive
        rate (tpr), positive predictive value (ppr), and true negative
        rate (tnr)
        """
        # look for columns named as pairs with _acc


        if not(type(data_df) is pd.core.groupby.DataFrameGroupBy):

            # make it tupe-like so that the loop can work
            data_df = [('',data_df)]

        classification_stats = []
        for groupby_lev,df in data_df:

            # var_pairs must be list of tuples or iterator
            for g,p in itert.product(self.groundtruth,self.prediction):
                cur_col = '_'.join([g,p,'acc'])
                # compute each stat
                confusion = df[cur_col].value_counts()

                # acc = (confusion['TP'] + confusion['TN'])/sum(confusion)
                # tpr = confusion['TP']/(confusion['TP'] + confusion['FN'])
                # ppv = confusion['TP']/(confusion['TP'] + confusion['FP'])
                # tnr = confusion['TN']/(confusion['TN'] + confusion['FN'])




                # TODO: fix this
                strength = 1

                # quality is absolute value of r_val (corelation coefficient)
                classification_stats.append([g,p,
                                stat_comp[self.my_stat](confusion),
                                            groupby_lev, strength])

        #save as df
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = classification_stats,
                                                columns = ['feat1','feat2',
                                                trend_col_name,'subgroup',
                                                trend_col_name+'_strength'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = classification_stats,
                                            columns = ['feat1','feat2',
                                                    trend_col_name,'empty',
                                                    trend_col_name+'_strength'])
            reg_df.drop('empty',axis=1,inplace=True)

        reg_df['trend_type'] = self.name
        return reg_df

    def get_distance(self,row):
        """

        """

        #
        return np.abs(1 - row['subgroup_trend']/row['agg_trend'])
