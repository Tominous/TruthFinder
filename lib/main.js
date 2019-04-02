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

tblEdit = {
	variables: [
		"Var 1",
		"Var 2"
	],
	outputs: [
		"0",
		"1",
		"1",
		"0"
	],
	bins: [
	],

	addVar: function ()
	{
		tblEdit.variables.push("Var " + (tblEdit.variables.length + 1));

		var newOutputLength = Math.pow(2, tblEdit.variables.length);

		while (outputs < newOutputLength)
		{
			outputs.push("0");
		}
	},

	drawTable: function ()
	{
		var vars = [];
		tblEdit.variables.forEach(function (value, index)
		{
			vars.push("")
		})

		tblEdit.bins = tblEdit.fillTable();

		var tblBody = [];
		var i = 0;
		while (tblBody.length < Math.pow(2, tblEdit.variables.length))
		{
			tblBody.push(tblEdit.bins[i]);
			i++;
		}

		arrayToTable(tblEdit.variables.concat(tblBody));
	},

	// Thank you https://stackoverflow.com/a/50382316/7641587 ! (Modified by Cyrus)
	enable: function (el)
	{
		// If statement added by Cyrus, allows double clicking while in edit mode
		if (el.childNodes[0].disabled)
		{
			el.childNodes[0].removeAttribute("disabled");
			document.getSelection().removeAllRanges();
			el.childNodes[0].focus();
		}
	},
	disable: function (el)
	{
		el.setAttribute("disabled", "");
		document.getSelection().removeAllRanges();
	},
	edit: function (el, event)
	{
		if (event.keyCode === 13)
		{
			tblEdit.disable(el);
		}
	},
	getVariables: function ()
	{
		var tbl = $("#input-table");
		var headers = tbl[0].rows[0].cells;
		var vars = [];

		for (var i = 0; i < headers.length - 1; i++)
		{
			vars.push(headers[i].childNodes[0].value);
		}
		return vars;
	},
	convert: function ()
	{
		var selectedLang = $('#out-lang').select2('data')[0].id;

		switch (selectedLang)
		{
			case "C++":
				break;
			case "javascript":
				break;
		}
	},
	fillTable: function ()
	{
		// Fills the table with possible values for the given variables
		var vars = tblEdit.getVariables();

		/* Formula to get truth table decimals, thx https://stackoverflow.com/a/19564761/7641587 */
		var bins = [];

		for (var i = 0; i < vars.length; i++)
		{
			var rows = 1 << vars.length;
			var max = (1 << rows) - 1;
			var diff = (1 << ((rows) / (2 << i))) - 1;
			var output = max - diff;

			var iterations = (1 << i);
			var step = 1 << (vars.length - i);
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

		return bins;
	}
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
	console.log("Set");
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
			)
			{
				this.value = "var";
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