// Thank you https://stackoverflow.com/a/36105304/7641587
function arrayToTable(tableData)
{
	var table = $('<table id="input-table></table>');
	$(tableData).each(function (i, rowData)
	{
		var row = $('<tr></tr>');
		$(rowData).each(function (j, cellData)
		{
			row.append($('<td>' + cellData + '</td>'));
		});
		table.append(row);
	});
	$("#input-table-area").innerHTML = "";
	$("#input-table-area").append(table);
	return table;
}

truthTable = {
	ref: $("#variable-table"),
	variables: function ()
	{
		var headers = truthTable.ref[0].rows[0].cells;
		var vars = [];

		for (var i = 0; i < headers.length - 1; i++)
		{
			if (headers[i].innerHTML)
			{
				vars.push(headers[i].innerHTML);
			}
		}
		return vars;
	},
	clearTable: function (numVars)
	{
		var rows = truthTable.ref[0].rows;

		// Start at the second entry so we dont overwrite the table header
		for (var i = 1; i < rows.length; i++)
		{
			var cells = rows[i].cells;
			for (var x = 0; x <= cells.length - 1; x++)
			{
				if (x < cells.length - 1 || i > numVars)
				{
					cells[x].innerHTML = "";
				}
			}
		}
	},
	fillTable: function ()
	{
		// Fills the table with possible values for the given variables
		var vars = truthTable.variables().length;

		/* Formula to get truth table decimals, thx https://stackoverflow.com/a/19564761/7641587 */
		var bins = [];

		for (var i = 0; i < vars; i++)
		{
			var rows = 1 << vars;
			var max = (1 << rows) - 1;
			var diff = (1 << ((rows) / (2 << i))) - 1;
			var output = max - diff;

			var iterations = (1 << i);
			var step = 1 << (vars - i);
			for (var j = 1; j < iterations; j++)
			{
				output -= (diff << (step * j));
			}

			bins[i] = output.toString(2).split("");
		}

		// Transposes (rotates) the 2d array (thx https://stackoverflow.com/a/17428705/7641587), it is still, however, upside down, so we will reverse it
		bins = bins[0].map((col, i) => bins.map(row => row[i]));
		bins = bins.reverse();

		// Reverses a multi-dimensional array (thank you http://rishivharsun.blogspot.com/2017/04/multidimensional-array-reverse-in.html)
		bins = bins.map(function reverse(item)
		{
			return Array.isArray(item) && Array.isArray(item[0])
				? item.map(reverse)
				: item.reverse();
		});

		// First clear the table
		truthTable.clearTable(vars);

		// Then add bins to the table
		for (var i = 0; i < bins.length; i++)
		{
			for (var x = 0; x < bins[i].length; x++)
			{
				if (bins[i][x] === "1")
				{
					truthTable.ref[0].rows[i + 1].cells[x].innerHTML = "1";
					$(truthTable.ref[0].rows[i + 1].cells[x]).addClass("output-one");
					$(truthTable.ref[0].rows[i + 1].cells[x]).removeClass("output-zero");
				}
				else
				{
					truthTable.ref[0].rows[i + 1].cells[x].innerHTML = "0";
					$(truthTable.ref[0].rows[i + 1].cells[x]).addClass("output-zero");
					$(truthTable.ref[0].rows[i + 1].cells[x]).removeClass("output-one");
				}
			}
			if (truthTable.ref[0].rows[i + 1].cells[4].innerHTML == "" && i + 1 == 4)
			{
				truthTable.ref[0].rows[i + 1].cells[4].innerHTML = '<button class="output-zero">0</button>';
			}
		}

		// Now we need to make sure that there is the right ammount of changable 0/1 on the output column
		// To find the ammount we need we get 2 ^ num vars
		var numOutputs = Math.pow(2, vars) + 1;

		for (var i = 0; i < numOutputs; i++)
		{
			// i is now = a row number which should have a changeable 0/1

			// Get the final cell on this row
			var finalCell = truthTable.ref[0].rows[i].cells[truthTable.ref[0].rows[i].cells.length - 1];

			if (!finalCell.innerHTML)
			{
				// If it is empty then let's fill it, default value 0
				finalCell.innerHTML = '<button class="output-zero">0</button>';
			}
		}
		
		setBindings();
	},
	changeVar: function (index, newName)
	{
		truthTable.ref[0].rows[0].cells[index].innerHTML = newName;
	},
	translate: function ()
	{
		var rows = truthTable.ref[0].rows;
		var vars = truthTable.variables();

		var conds = [];

		for (var i = 1; i < rows.length; i++)
		{
			console.log("I " + i);
			// For each row in the table
			// If the value is set to one
			console.log("Inner " + rows[i].cells[rows[i].cells.length - 1].children[0].innerHTML);
			if (rows[i].cells[rows[i].cells.length - 1].children[0].innerHTML == 1)
			{
				// Then collect the conditions for that row
				var these = [];
				for (var x = 0; x < rows[i].cells.length - 1; x++)
				{
					if (rows[i].cells[x].innerHTML == 1)
					{
						these.push(vars[x]);
					}
				}
				conds = conds.concat(these);
			}
		}

		// Now turn the data we just gathered into their chosen programming language
		var selectedLang = $('#out-lang').select2('data')[0].id;

		switch (selectedLang)
		{
			case "C++":
				break;
			case "javascript":
				break;
		}
	}
}

// Thanks https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
const copyToClipboard = ele =>
{
	const el = document.createElement('textarea');
	el.value = ele.val();
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
};

function setBindings()
{
	$(".output-select > button").click(function ()
	{
		if (this.innerHTML != "")
		{
			// Switch Classes
			if ($(this).hasClass("output-zero"))
			{
				$(this).addClass("output-one");
				$(this).removeClass("output-zero");
				this.innerHTML = "1";
			}
			else
			{
				$(this).addClass("output-zero");
				$(this).removeClass("output-one");
				this.innerHTML = "0";
			}
		}
	});
}

$(document).ready(function ()
{
	$("#out-lang").select2({
		width: "100%"
	});

	$("#out-lang").on("select2:select", function (e)
	{
		tblEdit.convert();
	});

	truthTable.fillTable();

	$("input.var-name")
		.on('blur', function ()
		{
			// If this is the final variable in the list
			if (
				(
					this.value == ""
					&&
					!(
						$(this).parent().index() == 3
						||
						(
							$(this).parent().parent()[0].children[$(this).parent().index() + 1]
							&&
							$(this).parent().parent()[0].children[$(this).parent().index() + 1].children[0].value == ""
						)
					)
				)
				||
				(
					$(this).parent().index() <= 0
					&&
					this.value == ""
				)
				||
				// If this value is already occupied by any of the other variables
				Object.values($(this).parent().siblings().map(a => $(this).parent().siblings()[a].children[0].value)).includes(this.value)
			)
			{
				this.value = "var" + ($(this).parent().index() + 1);
			}
			truthTable.changeVar($(this).parent().index(), this.value);
			truthTable.fillTable();
		})
		.keydown(function ()
		{
			if (event.keyCode === 13)
			{
				this.blur();
			}
		});
});