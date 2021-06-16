import modin.pandas as pd
import numpy as np
import itertools
import scipy.stats as stats
import warnings
import itertools as itert



stat_comp = {
    'acc': lambda c: (c['TP'] + c['TN'])/sum(c),
    'err': lambda c: (c['FP'] + c['FN'])/sum(c),
    'ppv': lambda c: c['TP']/(c['TP'] + c['FP']),
    'tpr': lambda c: c['TP']/(c['TP'] + c['FN']),
    'tnr': lambda c: c['TN']/(c['TN'] + c['FP']),
    'fdr': lambda c: c['FP']/(c['TP'] + c['FP']),
    'fpr': lambda c: c['FP']/(c['TN'] + c['FP']),
    'fnr': lambda c: c['FN']/(c['TP'] + c['FN']),
    'f1': lambda c: 2*c['TP']/(2*c['TP']+c['FP']+c['FN'])}

class BinClassStats():
    '''
    class of trend for computing classification statistics from confusion matrix compoents
    based on teh comparison of values from two columns of the data
    '''
    overview_legend = 'continuous'

    def is_computable(self,labeled_df=None):
        """
        check if this trend can be computed based on data and metadata available

        Parameters
        ----------
        self : Trend
            a trend object with a set_vars Parameters
        labeled_df : LabeledDataFrame {None} (optional)
            data to use if trend is not already configured


        Returns
        -------
        computable : bool
            True if requirements of get_trends are filled

        See also:
        get_trends() for description of how this trend computes and
        """
        if not( self.set_vars):
            self.get_trend_vars(labeled_df)

        vart_test_list = [bool(self.groundtruth),
                        bool(self.prediction),
                        self.my_stat in stat_comp.keys()]

        return np.product([vartest for vartest in vart_test_list])

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a trend between two variables that are prediction and ground
        truth, requires a precompute step to augment the data with row-wise
        labels for speed



        Parameters
        ----------
        data_df : DataFrame or DataFrameGroupBy
            data to compute trends on, may be a whole, unmodified DataFrame or
        a grouped DataFrame as passed by LabeledDataFrame get trend functions. for each
        groundtruth and prediction pair there must be an accuracy column named like
        groundtruthvar_predictionvar_acc.
        trend_col_name : {'subgroup_trend','agg_trend'}
            which type of trend is to be computed

        Required properties
        --------------------
        name : string
            used in the trend_type column of result_df and by viz
        groundtruth : string or list of strings
            variable(s) to be used as ground truth in precomputing the confusion matrix and
        prediction :  string or list of strings
        my_stat : string
            must be one of the keys of wg.trend_components.stat_comp


        Returns
        -------
        reg_df : DataFrame
            returns result df with rows for accuracy (acc), true positive
            rate (tpr), positive predictive value (ppr), and true negative
            rate (tnr)
        """
        # look for columns named as pairs with _acc


        if not(type(data_df) is pd.groupby.DataFrameGroupBy):

            # make it tupe-like so that the loop can work
            data_df = [('',data_df)]

        classification_stats = []
        for groupby_lev,df in data_df:

            # var_pairs must be list of tuples or iterator
            for g,p in itert.product(self.groundtruth,self.prediction):
                cur_col = '_'.join([g,p,'acc'])
                # compute each stat
                confusion = df[cur_col].value_counts()

                trend_name = '_'.join([self.name,trend_col_name,
                                                    str(groupby_lev),g,p])
                self.trend_precompute[trend_name] = confusion

                # add values that are not there
                req_keys = ['TP','TN','FP','FN']
                for k in req_keys:
                    if not(k in confusion.keys()):
                        confusion[k] = 0

                # 0 if N <=10
                # appraoches 1 as N->inf
                N = sum(confusion)
                strength = 1-1/np.log10(max(N,10))

                cur_stat = stat_comp[self.my_stat](confusion)


                classification_stats.append([g,p,cur_stat,
                                            groupby_lev, strength])

        #save as df
        if type(data_df) is pd.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = classification_stats,
                                                columns = ['independent','dependent',
                                                trend_col_name,'subgroup',
                                                trend_col_name+'_strength'])
            #same for all
            reg_df['splitby'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = classification_stats,
                                            columns = ['independent','dependent',
                                                    trend_col_name,'empty',
                                                    trend_col_name+'_strength'])
            reg_df.drop('empty',axis=1,inplace=True)

        reg_df['trend_type'] = self.name
        return reg_df

    def get_distance(self,row,col_a='subgroup_trend',col_b='agg_trend'):
        """
        distance for confusion matrix stats is

        """

        # use np.divide to catch divide by 0 error
        # ratio = np.divide(row[col_a]/row[col_b],where =row[col_b]>0)
        return np.abs(row[col_a] - row[col_b])
