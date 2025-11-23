/* =========== Global variable ========== */
// Initiate the first level virtual layer
var globalFirstLevelWidth = 0;
var globalFirstLevelView = 'list';
var globalFirstLevelParentVLWidth = 0;
var globalFirstLevelChildrenVLWidth = 0;
var globalFirstLevelViewVLWidth = 0;
var globalFirstLevelViewVLHeight = 0;

// Initiate second level virtual layer
var globalSecondLevelWidth = 0;
var globalSecondLevelView = 'list';
var globalSecondLevelParentVLWidth = 0;
var globalSecondLevelChildrenVLWidth = 0;
var globalSecondLevelViewVLWidth = 0;
var globalSecondLevelViewVLHeight = 0;

// Initiate third level virtual layer
var globalThirdLevelParentVLWidth = 0;
var globalThirdLevelView = 'list';

const interactiveLevelButton = (selection, props) => {
	const {
		viewLabels,
		parentIdentityLabels,
		childrenIdentityLabels,
		levelG,
		level,
		charts,
		addHeightArray,
		treeHeight,
		matrix_data,
		rowLabels,
		colLabels,	
		matrixHeight,
		trendType
	} = props;

	// Interact with view button
	selection.call(interact_view_button, {
		viewLabels: viewLabels,
		charts: charts,
		matrix_data: matrix_data,
		rowLabels : rowLabels,
		colLabels : colLabels,	
		matrixHeight: matrixHeight,
		level: level
	});

	// Interact with parent identity button
	selection.call(interact_parent_button, {
		parentIdentityLabels: parentIdentityLabels,
		levelG: levelG,
		level: level
	});

	// Interact with children identity button
	selection.call(interact_children_button, {
		childrenIdentityLabels: childrenIdentityLabels,
		levelG: levelG,
		level: level
	});

}

function updateButtonColors(button, parent) {

	var defaultColor= "#797979";
	var pressedColor= "#0076BA";

	parent.selectAll("rect")
			.attr("fill",defaultColor)

	button.select("rect")
			.attr("fill",pressedColor)
}