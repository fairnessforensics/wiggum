"""Visualization Page for Wiggum Streamlit Application.

Handles trend visualization, filtering, detection, and ranking.
"""

import os

import pandas as pd
import streamlit as st
import wiggum as wg

from loguru import logger

from streamlit_app.utils.state import init_session_state, reset_filters
from streamlit_app.utils.data_helpers import (
    get_distance_heatmap_dict,
    get_overview_legend_types,
    replace_trend_display_name,
    get_rank_trend_detail,
)
from streamlit_app.components.heatmap import create_distance_heatmap, create_heatmap_grid
from streamlit_app.components.scatterplot import create_regression_scatterplot
from streamlit_app.components.barchart import create_rank_comparison_chart


init_session_state()

st.title("Trend Visualization")

if st.session_state.labeled_df is None:
    st.warning("No data loaded. Please go to Data Configuration first.")
    if st.button("Go to Data Configuration"):
        st.switch_page("pages/1_Data_Config.py")
    st.stop()

labeled_df = st.session_state.labeled_df

# Compute trends if redirected from config page
if st.session_state.redirect_flag and st.session_state.trend_list:
    with st.spinner("Computing trends..."):
        if len(st.session_state.filter_trend_list) > 0:
            labeled_df.get_trend_rows(
                trend_type=st.session_state.filter_trend_list,
                inplace=True
            )

        labeled_df.get_subgroup_trends_1lev(st.session_state.trend_list)

        if labeled_df.result_df.empty:
            st.error("No results computed. Check your data configuration.")
            st.stop()

        labeled_df.add_distance()
        st.session_state.labeled_df = labeled_df
        st.session_state.redirect_flag = False
        logger.info("Trends computed successfully")

if labeled_df.result_df.empty:
    st.warning("No trend results available. Please compute trends from Data Configuration.")
    if st.button("Go to Data Configuration"):
        st.switch_page("pages/1_Data_Config.py")
    st.stop()

# Sidebar controls
with st.sidebar:
    st.header("Filters")

    result_df = labeled_df.result_df

    independent_options = result_df["independent"].unique().tolist()
    dependent_options = result_df["dependent"].unique().tolist()
    splitby_options = result_df["splitby"].unique().tolist()
    subgroup_options = result_df["subgroup"].unique().tolist()
    trend_type_options = result_df["trend_type"].unique().tolist()

    filter_independent = st.multiselect(
        "Independent Variable",
        options=independent_options,
        default=st.session_state.filter_object.get("independent", []),
    )

    filter_dependent = st.multiselect(
        "Dependent Variable",
        options=dependent_options,
        default=st.session_state.filter_object.get("dependent", []),
    )

    filter_splitby = st.multiselect(
        "Split By",
        options=splitby_options,
        default=st.session_state.filter_object.get("splitby", []),
    )

    filter_subgroup = st.multiselect(
        "Subgroup",
        options=subgroup_options,
        default=st.session_state.filter_object.get("subgroup", []),
    )

    filter_trend_type = st.multiselect(
        "Trend Type",
        options=trend_type_options,
        default=st.session_state.filter_object.get("trend_type", []),
    )

    col1, col2 = st.columns(2)
    with col1:
        if st.button("Apply Filter", type="primary"):
            st.session_state.filter_flag = True
            st.session_state.filter_object = {
                "independent": filter_independent or None,
                "dependent": filter_dependent or None,
                "splitby": filter_splitby or None,
                "subgroup": filter_subgroup or None,
                "trend_type": filter_trend_type or None,
            }
            st.rerun()

    with col2:
        if st.button("Reset"):
            reset_filters()
            st.rerun()

    st.divider()
    st.header("Detection")

    distance_threshold = st.slider(
        "Distance Threshold",
        min_value=0.0,
        max_value=1.0,
        value=st.session_state.detection_thresholds["distance"],
        step=0.05,
        help="Minimum distance for Simpson's Paradox detection",
    )

    agg_strength = st.slider(
        "Aggregate Strength",
        min_value=0.0,
        max_value=1.0,
        value=st.session_state.detection_thresholds["agg_strength"],
        step=0.05,
        help="Minimum aggregate trend strength",
    )

    sg_strength = st.slider(
        "Subgroup Strength",
        min_value=0.0,
        max_value=1.0,
        value=st.session_state.detection_thresholds["sg_strength"],
        step=0.05,
        help="Minimum subgroup trend strength",
    )

    if st.button("Detect Simpson's Paradox", type="primary"):
        st.session_state.detection_thresholds = {
            "distance": distance_threshold,
            "agg_strength": agg_strength,
            "sg_strength": sg_strength,
        }

        trend_filter = filter_trend_type or list(
            pd.unique(labeled_df.result_df["trend_type"])
        )

        sp_filter = {
            "name": "SP",
            "distance": distance_threshold,
            "agg_trend_strength": agg_strength,
            "subgroup_trend_strength": sg_strength,
            "trend_type": trend_filter,
        }

        if st.session_state.filter_flag:
            st.session_state.current_result_df = labeled_df.get_SP_rows(
                sp_filter,
                independent=st.session_state.filter_object.get("independent"),
                dependent=st.session_state.filter_object.get("dependent"),
                splitby=st.session_state.filter_object.get("splitby"),
                subgroup=st.session_state.filter_object.get("subgroup"),
                trend_type=st.session_state.filter_object.get("trend_type"),
                replace=True,
            )
        else:
            st.session_state.current_result_df = labeled_df.get_SP_rows(
                sp_filter, replace=True
            )

        logger.info("Simpson's Paradox detection applied")
        st.rerun()

    st.divider()
    st.header("Ranking")

    agg_type = st.selectbox(
        "Aggregation Type",
        options=["mean", "min", "max", "sum"],
        index=0,
    )

    score_col = st.selectbox(
        "Score Column",
        options=["distance"],
        index=0,
    )

    if st.button("Rank Results"):
        view_score = f"{agg_type}_view_{score_col}"

        if view_score not in labeled_df.result_df.columns:
            labeled_df.add_view_score(score_col, agg_type=agg_type, colored=False)

        rank_result = labeled_df.rank_occurences_by_view(view_score, score_col)

        if st.session_state.filter_flag:
            rank_result = labeled_df.get_trend_rows(
                independent=st.session_state.filter_object.get("independent"),
                dependent=st.session_state.filter_object.get("dependent"),
                splitby=st.session_state.filter_object.get("splitby"),
                subgroup=st.session_state.filter_object.get("subgroup"),
                trend_type=st.session_state.filter_object.get("trend_type"),
            )

        st.session_state.current_result_df = rank_result
        st.session_state.labeled_df = labeled_df
        logger.info(f"Ranked by {view_score}")
        st.rerun()

    st.divider()
    st.header("Save")

    project_name = st.text_input(
        "Project name",
        value=st.session_state.project_name,
    )

    if st.button("Save Results"):
        if project_name:
            directory = os.path.join("data", project_name)
            labeled_df.save_all(directory)
            st.session_state.project_name = project_name
            st.success(f"Saved to {directory}")
            logger.info(f"Saved results to: {directory}")
        else:
            st.warning("Enter a project name")

# Main visualization area
# Determine which result_df to use
if st.session_state.filter_flag:
    current_df = labeled_df.get_trend_rows(
        independent=st.session_state.filter_object.get("independent"),
        dependent=st.session_state.filter_object.get("dependent"),
        splitby=st.session_state.filter_object.get("splitby"),
        subgroup=st.session_state.filter_object.get("subgroup"),
        trend_type=st.session_state.filter_object.get("trend_type"),
    )
elif st.session_state.current_result_df is not None:
    current_df = st.session_state.current_result_df
else:
    current_df = labeled_df.result_df

if current_df.empty:
    st.warning("No results match the current filters.")
    st.stop()

# Generate heatmaps
heatmap_dict_list = get_distance_heatmap_dict(labeled_df, current_df)
legend_types = get_overview_legend_types(heatmap_dict_list)

st.header("Distance Overview")

if "continuous" in legend_types:
    st.caption("Color scale: Yellow (0) to Blue (1) for continuous distances")
if "binary" in legend_types:
    st.caption("Color scale: Light red (0) to Dark red (1) for binary distances")

# Display heatmaps in a grid
heatmaps = create_heatmap_grid(heatmap_dict_list)

cols_per_row = 4
rows = [heatmaps[i:i + cols_per_row] for i in range(0, len(heatmaps), cols_per_row)]

for row in rows:
    cols = st.columns(len(row))
    for col, hm in zip(cols, row):
        with col:
            selected = st.plotly_chart(
                hm["figure"],
                key=f"hm_{hm['trend_type']}_{hm['splitby']}_{hm['subgroup']}",
                on_select="rerun",
            )

            if selected and selected.get("selection", {}).get("points"):
                point = selected["selection"]["points"][0]
                st.session_state.selected_cell = {
                    "trend_type": hm["trend_type"],
                    "splitby": hm["splitby"],
                    "subgroup": hm["subgroup"],
                    "independent": point.get("x"),
                    "dependent": point.get("y"),
                    "detail_view_type": hm["detail_view_type"],
                }

# Detail view
st.header("Detail View")

if st.session_state.selected_cell:
    cell = st.session_state.selected_cell

    st.markdown(
        f"**Selected:** {cell['dependent']} vs {cell['independent']} "
        f"(Split by {cell['splitby']} = {cell['subgroup']})"
    )

    detail_type = cell.get("detail_view_type", "scatter")

    if detail_type == "scatter" or detail_type is None:
        fig = create_regression_scatterplot(
            df=labeled_df.df,
            x_col=cell["independent"],
            y_col=cell["dependent"],
            color_col=cell["splitby"],
            title=f"{cell['dependent']} vs {cell['independent']}",
        )
        st.plotly_chart(fig)

    elif detail_type == "rank":
        detail_df, count_df = get_rank_trend_detail(
            labeled_df,
            cell["dependent"],
            cell["independent"],
            cell["splitby"],
        )

        if not detail_df.empty:
            stats_fig, counts_fig = create_rank_comparison_chart(
                detail_df,
                count_df,
                title=f"{cell['dependent']} vs {cell['independent']}",
            )
            st.plotly_chart(stats_fig)
            if counts_fig:
                st.plotly_chart(counts_fig)
        else:
            st.info("No rank trend detail available for this selection.")
else:
    st.info("Click on a heatmap cell to see the detail view.")

# Results table
st.header("Results Table")

display_df = replace_trend_display_name(current_df.copy())

columns_to_show = [
    "trend_type",
    "independent",
    "dependent",
    "splitby",
    "subgroup",
    "distance",
]

available_cols = [c for c in columns_to_show if c in display_df.columns]

if "agg_trend" in display_df.columns:
    available_cols.append("agg_trend")
if "subgroup_trend" in display_df.columns:
    available_cols.append("subgroup_trend")

st.dataframe(
    display_df[available_cols],
    width="stretch",
    hide_index=True,
)

st.caption(f"Showing {len(display_df)} results")
