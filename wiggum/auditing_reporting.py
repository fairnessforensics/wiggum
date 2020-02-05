import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert


class _AuditReporting():
    """
    This mixin class contians methods for reproducible auditing and report generation
    """

    def annotate(self,row_idx, annotate_col, comment):
        '''
        add text of comment to the annotate_col column of result_df in the
        row_idx row

        Parameters
        -----------
        row_idx : integer
            row index to annotate
        annotate_col : string
            name of annotation column (may be existing or new)
        comment : string or number
            content to add as annotation

        Returns
        -------
        changed row
        '''

        # if new annotation column, initialize it empty
        if not(annotate_col in self.result_df.columns):
            self.result_df[annotate_col] = ''

        # add specific annotation
        self.result_df.loc[row_idx,annotate_col] = comment

        return self.result_df.loc[row_idx]


    def filter_annotate(self,feat1 = None,feat2 = None,group_feat= None,
                            subgroup= None,subgroup2= None,trend_type=None,
                            annotate_col = None, comment = 'x'):
        '''
        add text of comment to the annotate_col column of result_df in the
        rows specified by a filter using the trend related variables

        Parameters
        -----------
        feat1 : str, list, or  None
            trend variable name or None to include all
        feat2 : str, list, or  None
            trend variable name or None to include all
        group_feat : str, list, or  None
            groupoby variable name or None to include all
        subgroup : str, list, or  None
            value of groupby_feat or or None to include all
        annotate_col : string
            name of annotation column (may be existing or new) o rnone to be
        auto generated from filter
        comment : string or number
            content to add as annotation

        Returns
        -------
        changed rows
        '''
        if annotate_col is None:
            filter_vars = [feat1, feat2, group_feat, subgroup, subgroup2,
                            trend_type]
            filter_params = [var for var in filter_vars if not(var is None)]
            annotate_col = '_'.join(filter_params)

        filt_df = self.get_trend_rows(feat1, feat2, group_feat, subgroup,
                        subgroup2, trend_type)

        for row in filt_df.index:
            self.annotate(row, annotate_col,comment)

        filt_df[annotate_col] = comment

        return filt_df

    def get_report_table(self,report_col,report_values):
        """
        generate a df that can be used for tables
        """

        return self.result_df[self.result_df[report_col] in report_values]

    def detect_annotate():

        get_SP_rows

    def save_report_table(self,report_col,report_values,filename):
        # call above and then save to csv


    def result_df_stat_summary(self):
        """
        generate and save to file(s) summary statistics on the results
        """

        # generate state tables and save each individually

        # generate narrative for a text file summary
