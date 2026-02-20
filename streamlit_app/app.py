"""Wiggum Streamlit Application Entry Point.

Interactive visualization tool for detecting Simpson's Paradox and mixed effects in data.
Run with: uv run streamlit run streamlit_app/app.py
"""

import streamlit as st

from loguru import logger

from streamlit_app.utils.state import init_session_state


def main():
    """Main entry point for the Streamlit application."""
    st.set_page_config(
        page_title="Wiggum - Simpson's Paradox Detection",
        page_icon="🔍",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    init_session_state()

    st.title("Wiggum")
    st.markdown("Interactive visualization tool for detecting Simpson's Paradox and mixed effects in data.")

    st.markdown("---")
    st.markdown("### Getting Started")
    st.markdown("""
    1. Go to **Data Configuration** to load your data and configure metadata
    2. Select trend types and click **Visualize Trends**
    3. Explore the visualizations on the **Visualize** page
    """)

    if st.session_state.labeled_df is not None:
        st.success(f"Data loaded: {st.session_state.project_name or 'Unnamed project'}")
        st.markdown(f"**Variables:** {len(st.session_state.labeled_df.meta_df)}")
        st.markdown(f"**Rows:** {len(st.session_state.labeled_df.df)}")
    else:
        st.info("No data loaded. Go to **Data Configuration** to get started.")

    logger.debug("Wiggum app initialized")


if __name__ == "__main__":
    main()
