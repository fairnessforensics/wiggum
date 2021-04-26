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
            name of annotation column (may be existing or new) or none to be
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
    
    def delete_annotate(self,row_idx,annotate_col):
        """
        delete a comment in an annotate_col column of result_df in the
        row and annotate column specified

        Parameters
        -----------
        row_inx : integer
            row index to delete
        annotate_col : string
            name of annotation column (should be existing already) to delete from
        Returns
        -------
        row deleted from
        
        """
        self.result_df.loc[row_idx,annotate_col] = ''
        
        return self.result_df.loc[row_idx]
    
    def get_report_table(self,report_cols,report_rows):
        """
        generate a df that can be used for tables
          
        Parameters
        -----------
        report_cols : list
            list of integers representing column indexes for report
        report_rows : list
            list of integers representing row indexes for report
        Returns
        -------
        rows and columns of the report
        """
        report_df = self.result_df.iloc[report_cols,report_rows]
        return report_df

    def detect_annotate():
        
        pass

    def save_report_table(self,report_cols,report_rows,filename):
        """
        generate a csv file to save the report
          
        Parameters
        -----------
        report_cols : list
            list of integers representing column indexes for report
        report_rows : list
            list of integers representing row indexes for report
        filename : string
            .csv filename to save the report to
        Returns
        -------
        rows and columns written to the report
        """
        # call above and then save to csv
        report_df = self.get_report_table(report_cols,report_rows)
        report_df.to_csv(filename)
        return 
        
        

    def count_values_above_thres(self,column,threshold):
        """
        count all the values in a column above a certain threshold
        
        Parameters
        -----------
        column : string
            name of column to peform thresholding on
        threshold : float
            threshold that should be exceeded
        Returns
        -----------
        number of values above the threshold
        """
        valueCount = len(self.result_df[self.result_df[column] > threshold])
        return valueCount
    def result_df_stat_summary(self,filename):
        """
        generate and save to file(s) summary statistics on the results
        
        Parameters
        -----------
        filename : string
            the filename of the saved summary files
      
        Returns
        -------
        
      
        """
        
        # generate state tables and save each individually
        state_table = self.result_df
        state_table.to_csv(filename + ".csv")
    
        # generate narrative for a text file summary
        trendNum = state_table['trend_type'].value_counts()
        dataGroups = state_table['subgroup'].value_counts()
        new_df = self.result_df[((self.result_df["agg_trend"] < 0) == (self.result_df["subgroup_trend"] < 0)) == False]
        total_rows = len(new_df.index)
        # thresholds that you would like to add to the report
        valueCount = self.count_values_above_thres('distance',.5)
        valueCount2 = self.count_values_above_thres('distance',.2)
        valueCount3 = self.count_values_above_thres('distance',.3)
        outputFile = open(filename + ".txt",'w')
        outputFile.write("Summary Statistics for " + filename + "\n"  + "\n" +"Subgroups Present: \n" + dataGroups.to_string() +"\n\nTrends Detected: \n"+ trendNum.to_string() + "\n" + "\nNumber of Reversals found: " + str(total_rows) + "\n" +"\nDistance above .2 threshold: " + str(valueCount2)+"\nDistance above .3 threshold: " + str(valueCount)+ "\nDistance above .5 threshold: " + str(valueCount))
        return 
