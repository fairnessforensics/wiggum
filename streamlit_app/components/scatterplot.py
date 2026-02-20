"""Scatter plot visualization components for Wiggum."""

import plotly.express as px
import plotly.graph_objects as go
from scipy import stats

from loguru import logger


def create_regression_scatterplot(
    df,
    x_col,
    y_col,
    color_col,
    title=None,
    show_aggregate_line=True,
    show_subgroup_lines=True,
    height=400,
):
    """Create a scatter plot with regression lines for trend visualization.

    Args:
        df: DataFrame with the data.
        x_col: Column name for x-axis (independent variable).
        y_col: Column name for y-axis (dependent variable).
        color_col: Column name for coloring points (splitby variable).
        title: Chart title.
        show_aggregate_line: Whether to show aggregate regression line.
        show_subgroup_lines: Whether to show subgroup regression lines.
        height: Chart height in pixels.

    Returns:
        Plotly Figure object.
    """
    fig = px.scatter(
        df,
        x=x_col,
        y=y_col,
        color=color_col,
        opacity=0.6,
        title=title,
        labels={x_col: x_col, y_col: y_col, color_col: color_col},
    )

    x_min, x_max = df[x_col].min(), df[x_col].max()
    x_range = [x_min, x_max]

    if show_aggregate_line:
        valid_mask = df[x_col].notna() & df[y_col].notna()
        valid_df = df[valid_mask]

        if len(valid_df) > 1:
            slope, intercept, r_value, p_value, std_err = stats.linregress(
                valid_df[x_col], valid_df[y_col]
            )

            y_pred = [slope * x + intercept for x in x_range]

            fig.add_trace(
                go.Scatter(
                    x=x_range,
                    y=y_pred,
                    mode="lines",
                    line=dict(color="black", dash="dash", width=2),
                    name=f"Aggregate (r={r_value:.3f})",
                    hovertemplate=f"Aggregate<br>slope={slope:.3f}<br>r={r_value:.3f}<extra></extra>",
                )
            )

    if show_subgroup_lines:
        colors = px.colors.qualitative.Plotly
        subgroups = df[color_col].dropna().unique()

        for i, subgroup in enumerate(subgroups):
            subgroup_df = df[df[color_col] == subgroup]
            valid_mask = subgroup_df[x_col].notna() & subgroup_df[y_col].notna()
            valid_subgroup = subgroup_df[valid_mask]

            if len(valid_subgroup) > 1:
                slope, intercept, r_value, p_value, std_err = stats.linregress(
                    valid_subgroup[x_col], valid_subgroup[y_col]
                )

                y_pred = [slope * x + intercept for x in x_range]
                color = colors[i % len(colors)]

                fig.add_trace(
                    go.Scatter(
                        x=x_range,
                        y=y_pred,
                        mode="lines",
                        line=dict(color=color, width=2),
                        name=f"{subgroup} (r={r_value:.3f})",
                        hovertemplate=f"{subgroup}<br>slope={slope:.3f}<br>r={r_value:.3f}<extra></extra>",
                    )
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

    logger.debug(f"Created regression scatterplot: {title}")
    return fig
