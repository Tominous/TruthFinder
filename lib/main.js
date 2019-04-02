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
			if (truthTable.ref[0].rows[i + 1].cells[4].innerHTML == "")
			{
				truthTable.ref[0].rows[i + 1].cells[4].innerHTML = '<button class="output-zero">0</button>';
			}
		}
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
	$(".output-select > button").click(function ()
	{
		if (this.innerHTML != "")
		{
			// Switch Classes
			if ($(this).hasClass("output-zero"))
			{
				$(this).addClass("output-one");
				$(this).removeClass("output-zero");
				console.dir(this);
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

	$(".editable-cell").dblclick(function ()
	{
		tblEdit.enable(this);
	});

	$(".editable-cell > input.tbl-input")
		.on('blur', function ()
		{
			tblEdit.disable(this);
		})
		.keydown(function ()
		{
			tblEdit.edit(this, event);
		});

	// On add column button clicked
	$("button.add-btn").click(function ()
	{
		// This is the column number on which the user clicked the + button
		var index = $(this).parent().parent().index();

		// Dont allow the user to add more than 4 variables
		if (index < 4)
		{
			// Add a column, thanks https://stackoverflow.com/a/20239146/7641587
			$("#input-table").find('tr').each(function ()
			{
				$(this).find('td').eq(index).after('<td></td>');
				$(this).find('th').eq(index).after('<th class="editable-cell"><input class="tbl-input" value="New Var" disabled><div class="addremove-buttons"><button class="add-btn">&plus;</button><button class="remove-btn">&Cross;</button></div></th>');
			});

			tblEdit.fillTable();

			setBindings();
		}
	});

	// On remove column button clicked
	$("button.remove-btn").click(function ()
	{
		var index = $(this).parent().parent().index();
		// We now have the index of the column the user wants to delete
		// So we loop through each row and remove the column at that position
		var tbl = $("#input-table")[0];

		// Dont allow the user to remove all columns
		if (tbl.rows[0].cells.length > 2)
		{
			// For each row in the table
			for (var i = 0; i < tbl.rows.length; i++)
			{
				// Remove cell at index in row
				console.dir(tbl.rows[i].cells);
				tbl.rows[i].removeChild(tbl.rows[i].cells[index]);
			}
		}

		tblEdit.fillTable();
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

	setBindings();

	$("input.var-name")
		.on('blur', function ()
		{
			truthTable.changeVar($(this).parent().index(), this.value);
		})
		.keydown(function ()
		{
			if (event.keyCode === 13)
			{
				truthTable.changeVar($(this).parent().index(), this.value);
			}
		});
});