# Wiggum

*Simpson's Paradox Inspired Fairness Forensics*

Interactive visualization tool for detecting Simpson's Paradox and mixed effects in data.

## Getting Started

Prior version published in:
- [FLAIRS 31](http://www.flairs-31.info/program) [paper](../dsp_paper.pdf)
- [Docs available separately](https://fairnessforensics.github.io/detect_simpsons_paradox/)

### Installation

To use Wiggum, download (or clone) from the [GitHub Repo](https://github.com/fairnessforensics/wiggum) and install with uv:

```bash
cd wiggum/
uv pip install -e .
```

Or with pip:

```bash
cd wiggum/
pip install .
```

### Running the Streamlit App

The interactive visualization app is built with Streamlit. To run:

```bash
uv run python -m streamlit run streamlit_app/app.py
```

This will start the server at http://localhost:8501

The app provides:

- **Data Configuration**: Load CSV files or saved projects, configure variable metadata
- **Trend Visualization**: Compute and visualize trends with interactive heatmaps
- **Simpson's Paradox Detection**: Detect paradoxes with configurable thresholds
- **Ranking**: Rank results by various aggregation methods

### Using the Library

To use the package in Python:

```python
import wiggum as wg

# Load data
labeled_df = wg.LabeledDataFrame('data/my_project')

# Or from a DataFrame
import pandas as pd
df = pd.read_csv('my_data.csv')
labeled_df = wg.LabeledDataFrame(df)
labeled_df.infer_var_types()

# Compute trends
trends = [wg.all_trend_types['pearson_corr']()]
labeled_df.get_subgroup_trends_1lev(trends)
labeled_df.add_distance()

# View results
print(labeled_df.result_df)
```

### Sample Datasets

The `data/` directory contains sample datasets for testing:

- `iris.csv` - Classic iris dataset
- `AutoMPG.csv` - Auto MPG dataset
- `adult.csv` - Adult census dataset
- And more...

## Development

Install development dependencies:

```bash
uv sync
```

Run tests:

```bash
uv run python -m pytest tests/
```

To generate JavaScript documentation, install JSDoc using npm:

```bash
npm install -g jsdoc
```

then:

```bash
cd docs/
make html
```

### Legacy Flask App

The legacy Flask app is still available but deprecated. The Streamlit app is the recommended interface.
