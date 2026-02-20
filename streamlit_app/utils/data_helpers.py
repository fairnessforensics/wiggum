"""Data helper functions for Wiggum Streamlit application.

Migrated from wiggum_app/models.py for Streamlit compatibility.
"""

import json

import numpy as np
import pandas as pd
import wiggum as wg

from loguru import logger


def update_metadata(labeled_df, meta_df):
    """Update LabeledDataFrame metadata from user-edited DataFrame.

    Args:
        labeled_df: LabeledDataFrame instance.
        meta_df: DataFrame with columns: variable, var_type, role, isCount, weighting_var.

    Returns:
        Updated LabeledDataFrame.
    """
    var_types = meta_df["var_type"].tolist()
    labeled_df.set_var_types(var_types)

    roles = [_string_to_role(r) for r in meta_df["role"].tolist()]
    labeled_df.set_roles(roles)

    counts = meta_df["isCount"].tolist()
    labeled_df.set_counts(counts)

    weighting_vars = meta_df["weighting_var"].replace("N/A", np.nan).tolist()
    labeled_df.set_weighting_vars(weighting_vars)

    logger.debug("Metadata updated")
    return labeled_df


def get_meta_dict(labeled_df):
    """Get metadata dictionary for display.

    Args:
        labeled_df: LabeledDataFrame instance.

    Returns:
        dict with var_names, var_types, isCounts, roles, weighting_vars, samples.
    """
    meta_df = labeled_df.meta_df

    return {
        "var_names": meta_df.index.tolist(),
        "var_types": meta_df["var_type"].tolist(),
        "isCounts": meta_df["isCount"].tolist(),
        "roles": meta_df["role"].tolist(),
        "weighting_vars": meta_df["weighting_var"].fillna("N/A").tolist(),
        "samples": labeled_df.get_data_sample(),
    }


def _role_to_string(role):
    """Convert role value to string for display."""
    if role is None or (isinstance(role, float) and pd.isna(role)):
        return "ignore"
    if isinstance(role, list):
        return ", ".join(str(r) for r in role) if role else "ignore"
    return str(role)


def _string_to_role(role_str):
    """Convert string back to role format."""
    if not role_str or role_str == "ignore":
        return "ignore"
    if ", " in role_str:
        return [r.strip() for r in role_str.split(",")]
    return role_str


def get_meta_dataframe(labeled_df):
    """Get metadata as an editable DataFrame for st.data_editor.

    Args:
        labeled_df: LabeledDataFrame instance.

    Returns:
        DataFrame with columns for editing.
    """
    meta_df = labeled_df.meta_df.copy()
    meta_df = meta_df.reset_index()
    meta_df = meta_df.rename(columns={"index": "variable"})

    meta_df["weighting_var"] = meta_df["weighting_var"].fillna("N/A")

    if "role" in meta_df.columns:
        meta_df["role"] = meta_df["role"].apply(_role_to_string)

    columns_to_keep = ["variable", "var_type", "role", "isCount", "weighting_var"]
    available_columns = [c for c in columns_to_keep if c in meta_df.columns]

    return meta_df[available_columns]


def get_distance_heatmap_dict(labeled_df, cur_result_df):
    """Generate Distance Heatmap Dictionary List for overview visualization.

    Groups results by trend type and splitby variable, extracting distances.

    Args:
        labeled_df: LabeledDataFrame from which cur_result_df was computed.
        cur_result_df: Result DataFrame after filtering/detecting/ranking.

    Returns:
        list of dicts with heatmap data for each trend/subgroup combination.
    """
    distance_heatmap_dict_list = []

    for trend_type, trend_df in cur_result_df.groupby("trend_type", sort=False):
        for gby, gby_trend_df in trend_df.groupby("splitby"):
            cgby = gby_trend_df.groupby("subgroup")

            for gby_lev, df in cgby:
                heatmap = df.pivot(
                    index="dependent",
                    columns="independent",
                    values="distance"
                )
                heatmap.fillna(99, inplace=True)

                trend_display_name = labeled_df.get_trend_display_name(trend_type)
                detail_view_type = labeled_df.get_detail_view_type(trend_type)
                overview_legend_type = labeled_df.get_overview_legend_type(trend_type)

                distance_heatmap_dict_list.append({
                    "trend_type": trend_type,
                    "trend_display_name": trend_display_name,
                    "detail_view_type": detail_view_type,
                    "overview_legend_type": overview_legend_type,
                    "splitby": gby,
                    "subgroup": gby_lev,
                    "heatmap": heatmap,
                })

    logger.debug(f"Generated {len(distance_heatmap_dict_list)} heatmap dicts")
    return distance_heatmap_dict_list


def get_overview_legend_types(distance_heatmap_dict):
    """Get unique overview legend types from heatmap dict.

    Args:
        distance_heatmap_dict: List of heatmap dictionaries.

    Returns:
        list of unique legend type strings.
    """
    legend_types = {hd["overview_legend_type"] for hd in distance_heatmap_dict}
    return list(legend_types)


def replace_trend_display_name(cur_result_df):
    """Add trend display name column, preserving original trend_type.

    Args:
        cur_result_df: Result DataFrame.

    Returns:
        DataFrame with trend_name column (original) and trend_type (display name).
    """
    result_df = cur_result_df.copy()

    name_mapper = {k: v().display_name for k, v in wg.all_trend_types.items()}

    result_df["trend_name"] = result_df["trend_type"]
    result_df["trend_type"] = result_df["trend_type"].replace(name_mapper)

    return result_df


def get_rank_trend_detail(labeled_df, dependent, independent, splitby):
    """Extract stats for rank trend detail view.

    Args:
        labeled_df: LabeledDataFrame instance.
        dependent: Dependent variable name.
        independent: Independent variable name.
        splitby: Splitby variable name.

    Returns:
        Tuple of (detail_df, count_df) DataFrames.
    """
    trend_idx_dict = {
        cur_trend.name: i for i, cur_trend in enumerate(labeled_df.trend_list)
    }
    rank_trend_idx = trend_idx_dict.get("rank_trend")

    if rank_trend_idx is None:
        logger.warning("rank_trend not found in trend_list")
        return pd.DataFrame(), pd.DataFrame()

    trend_precompute = labeled_df.trend_list[rank_trend_idx].trend_precompute

    sel_agg_trend = "_".join(["rank_trend", "agg_trend", dependent, independent])

    detail_df = pd.DataFrame()
    count_df = pd.DataFrame()

    if sel_agg_trend in trend_precompute:
        detail_df["aggregate"] = trend_precompute[sel_agg_trend].stat
        count_df["aggregate"] = trend_precompute[sel_agg_trend]["count"]

    sel_subgroup_trend = "_".join([
        "rank_trend", "subgroup_trend", dependent, independent, splitby
    ])

    for key in trend_precompute:
        if key.startswith(sel_subgroup_trend):
            subgroup = key.split("_")[-1]
            detail_df[subgroup] = trend_precompute[key].stat
            count_df[subgroup] = trend_precompute[key]["count"]

    if not count_df.empty:
        count_df = count_df.stack().unstack(0)
        count_df.index.name = "subgroup"

    detail_df.fillna(0, inplace=True)
    count_df.fillna(0, inplace=True)

    return detail_df, count_df


def validate_roles(meta_df):
    """Validate role assignments and return warnings.

    Rules:
    - Continuous variables should be independent or dependent
    - Categorical/binary/ordinal variables should be splitby

    Args:
        meta_df: DataFrame with var_type and role columns.

    Returns:
        List of warning messages.
    """
    warnings = []

    for _, row in meta_df.iterrows():
        var_name = row["variable"]
        var_type = row["var_type"]
        role = row["role"]

        if role == "ignore":
            continue

        is_continuous = var_type == "continuous"
        is_categorical = var_type in ["categorical", "binary", "ordinal"]

        if is_continuous and "splitby" in role:
            warnings.append(
                f"'{var_name}' is continuous but assigned as splitby. "
                "Consider using categorical variables for splitby."
            )

        if is_categorical and role in ["independent", "dependent"]:
            warnings.append(
                f"'{var_name}' is {var_type} but assigned as {role}. "
                "Categorical variables are typically used as splitby."
            )

    return warnings


def auto_assign_roles(meta_df):
    """Auto-assign roles based on variable types.

    Ensures at least one of each required role (independent, dependent, splitby).

    Algorithm:
    - Categorical/binary/ordinal variables -> splitby (first one)
    - Continuous variables -> independent (first), dependent (second)
    - If no categorical for splitby, use third continuous variable
    - Remaining -> ignore

    Args:
        meta_df: DataFrame with variable and var_type columns.

    Returns:
        DataFrame with updated role column.
    """
    result_df = meta_df.copy()
    result_df["role"] = "ignore"

    categorical_vars = result_df[
        result_df["var_type"].isin(["categorical", "binary", "ordinal"])
    ]["variable"].tolist()

    continuous_vars = result_df[
        result_df["var_type"] == "continuous"
    ]["variable"].tolist()

    all_vars = result_df["variable"].tolist()

    assigned_splitby = False
    assigned_independent = False
    assigned_dependent = False

    if categorical_vars:
        result_df.loc[result_df["variable"] == categorical_vars[0], "role"] = "splitby"
        assigned_splitby = True
        logger.debug(f"Auto-assigned splitby: {categorical_vars[0]}")

    if len(continuous_vars) >= 2:
        result_df.loc[result_df["variable"] == continuous_vars[0], "role"] = "independent"
        result_df.loc[result_df["variable"] == continuous_vars[1], "role"] = "dependent"
        assigned_independent = True
        assigned_dependent = True
        logger.debug(f"Auto-assigned independent: {continuous_vars[0]}, dependent: {continuous_vars[1]}")
    elif len(continuous_vars) == 1:
        result_df.loc[result_df["variable"] == continuous_vars[0], "role"] = "dependent"
        assigned_dependent = True
        logger.debug(f"Auto-assigned dependent: {continuous_vars[0]}")

    if not assigned_splitby:
        if len(continuous_vars) >= 3:
            result_df.loc[result_df["variable"] == continuous_vars[2], "role"] = "splitby"
            assigned_splitby = True
            logger.debug(f"Auto-assigned splitby (from continuous): {continuous_vars[2]}")
        elif len(all_vars) > 2:
            for var in all_vars:
                current_role = result_df.loc[result_df["variable"] == var, "role"].values[0]
                if current_role == "ignore":
                    result_df.loc[result_df["variable"] == var, "role"] = "splitby"
                    assigned_splitby = True
                    logger.debug(f"Auto-assigned splitby (fallback): {var}")
                    break

    if not assigned_independent and len(all_vars) >= 1:
        for var in all_vars:
            current_role = result_df.loc[result_df["variable"] == var, "role"].values[0]
            if current_role == "ignore":
                result_df.loc[result_df["variable"] == var, "role"] = "independent"
                assigned_independent = True
                logger.debug(f"Auto-assigned independent (fallback): {var}")
                break

    if not assigned_dependent and len(all_vars) >= 2:
        for var in all_vars:
            current_role = result_df.loc[result_df["variable"] == var, "role"].values[0]
            if current_role == "ignore":
                result_df.loc[result_df["variable"] == var, "role"] = "dependent"
                assigned_dependent = True
                logger.debug(f"Auto-assigned dependent (fallback): {var}")
                break

    logger.info(
        f"Auto-assign complete: independent={assigned_independent}, "
        f"dependent={assigned_dependent}, splitby={assigned_splitby}"
    )

    return result_df


def check_trends_computable(labeled_df, trend_names):
    """Check which trends are computable for the given data.

    Args:
        labeled_df: LabeledDataFrame instance.
        trend_names: List of trend type names.

    Returns:
        List of computable trend instances.
    """
    trend_list = [wg.all_trend_types[name]() for name in trend_names]

    computable = []
    for trend in trend_list:
        try:
            if trend.is_computable(labeled_df):
                computable.append(trend)
            else:
                logger.warning(f"Trend {trend.name} is not computable for this data")
        except (IndexError, KeyError, AttributeError) as e:
            logger.warning(f"Trend {trend.name} check failed: {e}")

    return computable
