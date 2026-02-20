"""Session state management for Wiggum Streamlit application."""

import streamlit as st

from loguru import logger


def init_session_state():
    """Initialize all session state variables with defaults."""
    defaults = {
        "labeled_df": None,
        "filter_flag": False,
        "filter_object": {},
        "project_name": "",
        "trend_list": [],
        "selected_trends": [],
        "detection_thresholds": {
            "distance": 0.5,
            "agg_strength": 0.1,
            "sg_strength": 0.1,
        },
        "selected_cell": None,
        "current_result_df": None,
        "redirect_flag": False,
        "filter_trend_list": [],
    }

    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value
            logger.debug(f"Initialized session state: {key}")


def reset_filters():
    """Reset filter state to defaults."""
    st.session_state.filter_flag = False
    st.session_state.filter_object = {}
    st.session_state.selected_cell = None
    logger.debug("Filters reset")


def reset_all():
    """Reset all state to defaults (for new data load)."""
    st.session_state.labeled_df = None
    st.session_state.project_name = ""
    st.session_state.trend_list = []
    st.session_state.selected_trends = []
    st.session_state.current_result_df = None
    st.session_state.redirect_flag = False
    st.session_state.filter_trend_list = []
    reset_filters()
    logger.debug("All state reset")


def get_available_projects():
    """List available projects in data/ directory.

    Returns:
        list: List of project folder names.
    """
    import os

    data_dir = "data"
    if not os.path.exists(data_dir):
        return []

    return sorted([
        d for d in os.listdir(data_dir)
        if os.path.isdir(os.path.join(data_dir, d))
    ])


def get_available_csv_files():
    """List available CSV files in data/ directory.

    Returns:
        list: List of CSV file names (without path).
    """
    import os

    data_dir = "data"
    if not os.path.exists(data_dir):
        return []

    return sorted([
        f for f in os.listdir(data_dir)
        if f.endswith(".csv") and os.path.isfile(os.path.join(data_dir, f))
    ])
