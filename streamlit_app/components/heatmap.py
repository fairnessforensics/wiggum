"""Heatmap visualization components for Wiggum."""

import plotly.graph_objects as go

from loguru import logger


# Color scales matching original D3.js implementation
BINARY_COLORSCALE = [[0, "#fee0d2"], [1, "#de2d26"]]

CONTINUOUS_COLORSCALE = [
    [0.0, "#ffffe0"],
    [0.1, "#caefdf"],
    [0.2, "#abdad9"],
    [0.3, "#93c4d2"],
    [0.4, "#7daeca"],
    [0.5, "#6997c2"],
    [0.6, "#5681b9"],
    [0.7, "#426cb0"],
    [0.8, "#2b57a7"],
    [1.0, "#00429d"],
]

NA_COLOR = "#cccccc"


def create_distance_heatmap(
    heatmap_df,
    title,
    legend_type="continuous",
    show_colorbar=True,
    height=300,
    width=300,
):
    """Create a Plotly heatmap for distance visualization.

    Args:
        heatmap_df: DataFrame with dependent as index, independent as columns.
        title: Chart title.
        legend_type: 'binary' or 'continuous' for color scale selection.
        show_colorbar: Whether to show the color bar.
        height: Chart height in pixels.
        width: Chart width in pixels.

    Returns:
        Plotly Figure object.
    """
    z_values = heatmap_df.values.copy()

    mask = z_values == 99
    z_display = z_values.copy()
    z_display[mask] = None

    if legend_type == "binary":
        colorscale = BINARY_COLORSCALE
        zmin, zmax = 0, 1
    else:
        colorscale = CONTINUOUS_COLORSCALE
        zmin, zmax = 0, 1

    row_labels = heatmap_df.index.tolist()
    col_labels = heatmap_df.columns.tolist()

    hover_text = []
    for i, row in enumerate(row_labels):
        row_text = []
        for j, col in enumerate(col_labels):
            val = z_values[i, j]
            if val == 99:
                row_text.append(f"Dependent: {row}<br>Independent: {col}<br>Distance: N/A")
            else:
                row_text.append(f"Dependent: {row}<br>Independent: {col}<br>Distance: {val:.3f}")
        hover_text.append(row_text)

    fig = go.Figure(
        data=go.Heatmap(
            z=z_display,
            x=col_labels,
            y=row_labels,
            colorscale=colorscale,
            zmin=zmin,
            zmax=zmax,
            hoverinfo="text",
            text=hover_text,
            showscale=show_colorbar,
            colorbar=dict(
                title="Distance",
                thickness=15,
                len=0.8,
            ),
        )
    )

    fig.update_layout(
        title=dict(
            text=title,
            font=dict(size=12),
        ),
        xaxis=dict(
            title="Independent",
            tickangle=-45,
            tickfont=dict(size=10),
        ),
        yaxis=dict(
            title="Dependent",
            tickfont=dict(size=10),
        ),
        height=height,
        width=width,
        margin=dict(l=60, r=20, t=40, b=60),
    )

    logger.debug(f"Created heatmap: {title}")
    return fig


def create_heatmap_grid(heatmap_dict_list, cols_per_row=3):
    """Create a grid of heatmaps from the heatmap dictionary list.

    Args:
        heatmap_dict_list: List of heatmap dictionaries from get_distance_heatmap_dict.
        cols_per_row: Number of columns per row in the grid.

    Returns:
        List of tuples (title, figure) for each heatmap.
    """
    heatmaps = []

    for hd in heatmap_dict_list:
        title = f"{hd['trend_display_name']}<br>Split: {hd['splitby']} = {hd['subgroup']}"

        fig = create_distance_heatmap(
            heatmap_df=hd["heatmap"],
            title=title,
            legend_type=hd["overview_legend_type"],
            show_colorbar=False,
            height=250,
            width=250,
        )

        heatmaps.append({
            "figure": fig,
            "title": title,
            "trend_type": hd["trend_type"],
            "splitby": hd["splitby"],
            "subgroup": hd["subgroup"],
            "detail_view_type": hd["detail_view_type"],
        })

    logger.debug(f"Created grid of {len(heatmaps)} heatmaps")
    return heatmaps
