"""Bar chart visualization components for Wiggum."""

import plotly.express as px
import plotly.graph_objects as go

from loguru import logger


def create_grouped_barchart(
    df,
    x_col,
    y_col,
    color_col,
    title=None,
    height=400,
):
    """Create a grouped bar chart for rank trend visualization.

    Args:
        df: DataFrame with the data.
        x_col: Column name for x-axis categories.
        y_col: Column name for y-axis values.
        color_col: Column name for grouping bars.
        title: Chart title.
        height: Chart height in pixels.

    Returns:
        Plotly Figure object.
    """
    fig = px.bar(
        df,
        x=x_col,
        y=y_col,
        color=color_col,
        barmode="group",
        title=title,
        labels={x_col: x_col, y_col: y_col, color_col: color_col},
    )

    fig.update_layout(
        height=height,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.3,
            xanchor="center",
            x=0.5,
        ),
        margin=dict(l=60, r=20, t=40, b=100),
    )

    logger.debug(f"Created grouped bar chart: {title}")
    return fig


def create_rank_comparison_chart(
    detail_df,
    count_df,
    title=None,
    height=400,
):
    """Create comparison charts for rank trend detail view.

    Shows both the statistic values and counts for aggregate vs subgroups.

    Args:
        detail_df: DataFrame with statistic values (columns are groups).
        count_df: DataFrame with count values (columns are groups).
        title: Chart title.
        height: Chart height in pixels.

    Returns:
        Tuple of (stats_figure, counts_figure).
    """
    stats_df = detail_df.reset_index()
    stats_df = stats_df.melt(
        id_vars=["index"],
        var_name="Group",
        value_name="Statistic",
    )
    stats_df = stats_df.rename(columns={"index": "Category"})

    stats_fig = px.bar(
        stats_df,
        x="Category",
        y="Statistic",
        color="Group",
        barmode="group",
        title=f"{title} - Statistics" if title else "Statistics",
    )

    stats_fig.update_layout(
        height=height,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.3,
            xanchor="center",
            x=0.5,
        ),
    )

    counts_fig = None
    if not count_df.empty:
        counts_long = count_df.reset_index()
        counts_long = counts_long.melt(
            id_vars=["subgroup"],
            var_name="Category",
            value_name="Count",
        )

        counts_fig = px.bar(
            counts_long,
            x="Category",
            y="Count",
            color="subgroup",
            barmode="group",
            title=f"{title} - Counts" if title else "Counts",
        )

        counts_fig.update_layout(
            height=height,
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=-0.3,
                xanchor="center",
                x=0.5,
            ),
        )

    logger.debug(f"Created rank comparison charts: {title}")
    return stats_fig, counts_fig
