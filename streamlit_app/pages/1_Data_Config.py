"""Data Configuration Page for Wiggum Streamlit Application.

Handles data loading, metadata configuration, and data augmentation.
"""

import os

import numpy as np
import pandas as pd
import streamlit as st
import wiggum as wg

from loguru import logger

from streamlit_app.utils.state import (
    get_available_csv_files,
    get_available_projects,
    init_session_state,
    reset_all,
)
from streamlit_app.utils.data_helpers import (
    auto_assign_roles,
    check_trends_computable,
    get_meta_dataframe,
    update_metadata,
    validate_roles,
)


init_session_state()

st.title("Data Configuration")

# Sidebar for data loading
with st.sidebar:
    st.header("Load Data")

    load_option = st.radio(
        "Data source",
        ["Sample Datasets", "Saved Projects", "Upload CSV"],
        horizontal=False,
    )

    if load_option == "Sample Datasets":
        csv_files = get_available_csv_files()
        if csv_files:
            default_idx = csv_files.index("iris.csv") if "iris.csv" in csv_files else 0
            selected_csv = st.selectbox(
                "Select dataset",
                options=csv_files,
                index=default_idx,
            )

            if selected_csv and st.button("Load Dataset", type="primary"):
                reset_all()
                csv_path = os.path.join("data", selected_csv)
                df = pd.read_csv(csv_path)
                st.session_state.labeled_df = wg.LabeledDataFrame(df)
                st.session_state.labeled_df.infer_var_types()
                st.session_state.project_name = selected_csv.replace(".csv", "")
                logger.info(f"Loaded sample dataset: {selected_csv}")
                st.rerun()
        else:
            st.info("No CSV files found in data/ directory")

    elif load_option == "Saved Projects":
        projects = get_available_projects()
        if projects:
            selected_project = st.selectbox(
                "Select project",
                options=projects,
                index=0,
            )

            if selected_project and st.button("Load Project", type="primary"):
                reset_all()
                folder_path = os.path.join("data", selected_project)
                try:
                    st.session_state.labeled_df = wg.LabeledDataFrame(folder_path)
                    st.session_state.project_name = selected_project
                    logger.info(f"Loaded project: {selected_project}")
                    st.rerun()
                except FileNotFoundError as e:
                    if "trends.json" in str(e):
                        st.warning(
                            f"Project '{selected_project}' is missing trends.json. "
                            "Loading data without pre-computed trends."
                        )
                        df_path = os.path.join(folder_path, "df.csv")
                        meta_path = os.path.join(folder_path, "meta.csv")
                        df = pd.read_csv(df_path)
                        st.session_state.labeled_df = wg.LabeledDataFrame(
                            df, meta_path
                        )
                        st.session_state.project_name = selected_project
                        logger.info(f"Loaded project without trends: {selected_project}")
                        st.rerun()
                    else:
                        st.error(f"Error loading project: {e}")
                        logger.error(f"Failed to load project {selected_project}: {e}")
        else:
            st.info("No projects found in data/ directory")

    else:
        uploaded_file = st.file_uploader(
            "Choose a CSV file",
            type=["csv"],
            help="Upload a CSV file to analyze",
        )

        if uploaded_file is not None:
            if st.button("Load CSV", type="primary"):
                reset_all()
                df = pd.read_csv(uploaded_file)
                st.session_state.labeled_df = wg.LabeledDataFrame(df)
                st.session_state.labeled_df.infer_var_types()
                st.session_state.project_name = uploaded_file.name.replace(".csv", "")
                logger.info(f"Loaded CSV: {uploaded_file.name}")
                st.rerun()

# Main content
if st.session_state.labeled_df is None:
    st.info("Load data using the sidebar to get started.")
    st.stop()

labeled_df = st.session_state.labeled_df

st.success(f"**Project:** {st.session_state.project_name or 'Unnamed'}")
st.markdown(f"**Variables:** {len(labeled_df.meta_df)} | **Rows:** {len(labeled_df.df)}")

# Metadata configuration
st.header("Variable Metadata")

meta_df = get_meta_dataframe(labeled_df)

var_type_options = ["binary", "ordinal", "categorical", "continuous"]
role_options = list(wg.possible_roles)
weight_options = ["N/A"] + meta_df["variable"].tolist()

edited_meta = st.data_editor(
    meta_df,
    column_config={
        "variable": st.column_config.TextColumn(
            "Variable",
            disabled=True,
        ),
        "var_type": st.column_config.SelectboxColumn(
            "Type",
            options=var_type_options,
            required=True,
        ),
        "role": st.column_config.SelectboxColumn(
            "Role",
            options=role_options,
            required=True,
        ),
        "isCount": st.column_config.CheckboxColumn(
            "Is Count",
            default=False,
        ),
        "weighting_var": st.column_config.SelectboxColumn(
            "Weighting Variable",
            options=weight_options,
        ),
    },
    hide_index=True,
    width="stretch",
)

# Auto-assign roles button
if st.button("Auto-assign Roles", help="Automatically assign roles based on variable types"):
    auto_meta = auto_assign_roles(edited_meta)
    labeled_df = update_metadata(labeled_df, auto_meta)
    st.session_state.labeled_df = labeled_df
    logger.info("Auto-assigned roles based on variable types")
    st.rerun()

# Update metadata when changed
if not edited_meta.equals(meta_df):
    labeled_df = update_metadata(labeled_df, edited_meta)
    st.session_state.labeled_df = labeled_df

# Validate roles and show warnings
role_warnings = validate_roles(edited_meta)
if role_warnings:
    with st.expander("Role Warnings", expanded=True):
        for warning in role_warnings:
            st.warning(warning)

# Check if required roles are set
roles_list = edited_meta["role"].tolist()
has_independent = any("independent" in str(r) for r in roles_list)
has_dependent = any("dependent" in str(r) for r in roles_list)
has_splitby = any("splitby" in str(r) for r in roles_list)

if not (has_independent and has_dependent and has_splitby):
    missing = []
    if not has_independent:
        missing.append("independent")
    if not has_dependent:
        missing.append("dependent")
    if not has_splitby:
        missing.append("splitby")
    st.info(
        f"Missing required roles: {', '.join(missing)}. "
        "Click 'Auto-assign Roles' or manually assign roles to compute trends."
    )

# Data sample preview
with st.expander("Data Sample", expanded=False):
    st.dataframe(labeled_df.df.head(10), width="stretch")

# Data Augmentation
st.header("Data Augmentation")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Quantile Binning")

    continuous_vars = labeled_df.meta_df[
        labeled_df.meta_df["var_type"] == "continuous"
    ].index.tolist()

    if continuous_vars:
        quantile_vars = st.multiselect(
            "Variables to bin",
            options=continuous_vars,
            help="Select continuous variables to convert to quantile bins",
        )

        quantile_cutoffs = st.text_input(
            "Custom cutoffs (optional)",
            placeholder="e.g., 0.25, 0.5, 0.75",
            help="Comma-separated quantile cutoffs (0-1). Leave empty for default quartiles.",
        )

        if quantile_vars and st.button("Compute Quantiles"):
            with st.spinner("Computing quantiles..."):
                if quantile_cutoffs.strip():
                    cutoffs = [float(s.strip()) for s in quantile_cutoffs.split(",")]
                    cutoffs.extend([1])
                    cutoffs.insert(0, 0)
                    labels = [
                        f"{np.round(a*100, 2)}to{np.round(b*100, 2)}%"
                        for a, b in zip(cutoffs[:-1], cutoffs[1:])
                    ]
                    quantiles_dict = dict(zip(labels, cutoffs[1:]))
                    labeled_df.add_quantile(quantile_vars, quantiles_dict)
                else:
                    labeled_df.add_quantile(quantile_vars)

                st.session_state.labeled_df = labeled_df
                logger.info(f"Added quantiles for: {quantile_vars}")
                st.rerun()
    else:
        st.info("No continuous variables available for binning")

with col2:
    st.subheader("DPGMM Clustering")

    qual_thresh = st.slider(
        "Quality threshold",
        min_value=0.0,
        max_value=1.0,
        value=0.8,
        step=0.05,
        help="Minimum clustering quality threshold",
    )

    if st.button("Apply Clustering"):
        with st.spinner("Applying DPGMM clustering..."):
            labeled_df.add_all_dpgmm(qual_thresh=qual_thresh)
            st.session_state.labeled_df = labeled_df
            logger.info(f"Applied DPGMM clustering with threshold {qual_thresh}")
            st.rerun()

st.subheader("Intersectional Variables")

categorical_vars = labeled_df.meta_df[
    labeled_df.meta_df["var_type"].isin(["categorical", "binary", "ordinal"])
].index.tolist()

if categorical_vars:
    intersection_vars = st.multiselect(
        "Variables to combine",
        options=categorical_vars,
        help="Select categorical variables to create intersectional combinations",
    )

    tuple_lens = st.text_input(
        "Tuple lengths (optional)",
        placeholder="e.g., 2, 3",
        help="Comma-separated combination sizes. Leave empty for pairs.",
    )

    if intersection_vars and st.button("Add Intersections"):
        with st.spinner("Creating intersectional variables..."):
            if tuple_lens.strip():
                lens = [int(t.strip()) for t in tuple_lens.split(",")]
                labeled_df.add_intersectional(intersection_vars, lens)
            else:
                labeled_df.add_intersectional(intersection_vars)

            st.session_state.labeled_df = labeled_df
            logger.info(f"Added intersections for: {intersection_vars}")
            st.rerun()
else:
    st.info("No categorical variables available for intersection")

# Trend Selection and Visualization
st.header("Trend Analysis")

trend_types = list(wg.all_trend_types.keys())
trend_display_names = {k: v().display_name for k, v in wg.all_trend_types.items()}

default_trends = st.session_state.selected_trends or ["pearson_corr", "lin_reg"]
selected_trends = st.multiselect(
    "Select trend types to compute",
    options=trend_types,
    format_func=lambda x: trend_display_names.get(x, x),
    default=[t for t in default_trends if t in trend_types],
    help="Select one or more trend types to analyze",
)

st.session_state.selected_trends = selected_trends

col1, col2 = st.columns([1, 3])

with col1:
    if st.button("Visualize Trends", type="primary", disabled=not selected_trends):
        computable_trends = check_trends_computable(labeled_df, selected_trends)

        if not computable_trends:
            st.error(
                "No selected trends are computable. "
                "Ensure you have set variable roles correctly: "
                "at least one 'independent', one 'dependent', and one 'splitby'."
            )
        else:
            st.session_state.trend_list = computable_trends
            st.session_state.redirect_flag = True
            st.switch_page("pages/2_Visualize.py")

with col2:
    project_name = st.text_input(
        "Project name",
        value=st.session_state.project_name,
        placeholder="Enter project name to save",
    )

    if st.button("Save Project"):
        if project_name:
            directory = os.path.join("data", project_name)
            labeled_df.to_csvs(directory)
            st.session_state.project_name = project_name
            st.success(f"Saved to {directory}")
            logger.info(f"Saved project to: {directory}")
        else:
            st.warning("Enter a project name to save")
