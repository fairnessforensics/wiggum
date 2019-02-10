function rankingView(rankingArray) {

	var label_array = rankingArray.map(obj =>{ 
		var rObj = obj.feat1 + ' : ' + obj.feat2 + ' : ' + obj.group_feat;
		return rObj;
	});

	var menu = d3.selectAll("#ranking");
	menu.selectAll("option").remove();

	menu.selectAll("option")
		.data(label_array)
		.enter()
		.append("option")
		.attr("value", function(d) { return d; })
		.text(function(d) { return d; }); 

	var select_values = [];
	var selections = [];
	menu.on("change",function(event) {
		selections = d3.select(this)
						.selectAll("option")
						.filter(function (d, i) { 
							return this.selected;
						});

		select_values = [];

		for (var i = 0; i < selections[0].length; i++) {
			var optionText = selections[0][i].value;
			select_values.push(optionText);
		}

		if (selectTypeValue == "Regression") {
			updateContainerForRanking(select_values);
		} else {
			//updateRateSPContainerForRanking(select_values);
		}				
	});	
}

function updateContainerForRanking(selections) {

	var temp = selections[0].split(" : ");
	ranking.feat1 = temp[0];
	ranking.feat2 = temp[1];
	ranking.group_feat = temp[2];

	if (selectTypeValue == "Regression") {
		updateContainer();

		// Update Scatterplot
		var vars = { x: ranking.feat1, y: ranking.feat2, 
			categoryAttr: ranking.group_feat, category: 'all'};
	
		updateScatterplot(csvData, vars);

	} else {
		updateRateSPContainer();
	}
}

