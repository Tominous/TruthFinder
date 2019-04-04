// Cookie handling tools, thank you https://www.w3schools.com/js/js_cookies.asp
cookie = {
	set: (cname, cvalue, exdays) =>
	{
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	},
	get: (cname) =>
	{
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++)
		{
			var c = ca[i];
			while (c.charAt(0) == ' ')
			{
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0)
			{
				return c.substring(name.length, c.length);
			}
		}
		return "";
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
	},
	translate: function ()
	{
		// Convert the table into a json object
		var tblJson = truthTable.ref.tableToJSON();
		var conds = [];

		// For each row in the table
		tblJson.forEach(function (value, index)
		{
			// If this row's conds evaluate to a 1
			if (value.Output == "1")
			{
				delete value.Output;
				conds.push(value);
			}
		});

		// Now turn the data we just gathered into their chosen programming language
		var selectedLang = $('#out-lang').select2('data')[0].id;

		var outCond = "";

		// Set operators
		var orOp = "ERR";
		var andOp = "ERR";
		var notOp = "ERR";
		var trueOp = "ERR";
		var falseOp = "ERR";
		switch (selectedLang)
		{
			case "C++":
			case "javascript":
			case "php":
				// C++, JS and PHP all share the same operators
				orOp = "||";
				andOp = "&&";
				notOp = "!";
				trueOp = "true";
				falseOp = "false";
				break;
			case "python":
				orOp = "or";
				andOp = "and";
				notOp = "not ";
				trueOp = "True";
				falseOp = "False";
				break;
		}



		// First we check for common expressions such as AND, NAND, OR and NOR and XOR

		console.dir(conds);

		// If there arent any conditions then just return false
		if (conds.length === 0)
		{
			outCond += falseOp;
		}
		// If everything is evaluating to true
		else if (conds.length === Math.pow(2, truthTable.variables().length))
		{
			outCond += trueOp;
		}
		// NOR   If there is only one entry                    and every variable in this entry equals 0
		else if (conds.length === 1 && Object.values(conds[0]).every(value => { return value === "0" } ))
		{
			var vars = truthTable.variables();

			outCond += `${notOp}( `;
			vars.forEach(value =>
			{
				outCond += `${value} ${orOp} `;
			});
			// Remove "|| " and add )
			outCond = `${outCond.slice(0, 0 - (orOp.length + 2))} )`;
		}
		else
		{
			outCond += "( ";
			// Get each condition
			conds.forEach((value, index) =>
			{
				// Get each variable in the condition
				Object.keys(value).forEach(key =>
				{
					// If this variable should be false add a "!"
					outCond += value[key] == "1" ? "" : notOp;
					// Now add the var name
					outCond += key + " " + andOp + " ";
				})
				// Add brackets and remove the trailing "&& "
				outCond = outCond.slice(0, 0 - (andOp.length + 1)) + ") " + orOp + " ( ";
			});
			// Remove the trailing "|| ( "
			outCond = outCond.slice(0, -(orOp.length + 3));
		}

		// Add the finished expression to the read only field at the bottom of the page
		$("#out-expression").val(outCond);
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

			// Translate
			truthTable.translate();
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
		truthTable.translate();
		cookie.set("selLang", e.params.data.id, 365);
	});

	truthTable.fillTable();

	$("input.var-name")
		.on('blur', function ()
		{

			/* For some reason this really weird evaluation fixes it, otherwise it doesnt work. Dont try to make this nicer, it'll probably just break ¯\_(ツ)_/¯ */

			// If this is the final variable in the list
			var a = (($(this).parent().next().children()[0] ? $(this).parent().next().children()[0].value : "") != "") && this.value == "";
			var b = (this.value == ""
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
			);
			var c = ($(this).parent().index() <= 0
				&&
				this.value == ""
			);
			var d = (// If this value is already occupied by any of the other variables
				this.value == "" ? false : Object.values($(this).parent().siblings().map(a => $(this).parent().siblings()[a].children[0].value)).includes(this.value)
			);
			if ((a || b) || (c || d))
			{
				this.value = "var" + ($(this).parent().index() + 1);
			}

			/* End weird stuff */

			truthTable.changeVar($(this).parent().index(), this.value);
			truthTable.fillTable();

			// Translate
			truthTable.translate();
		})
		.keydown(function ()
		{
			if (event.keyCode === 13)
			{
				this.blur();
			}
		});

	// Set the selected language to the one stored in the cookie
	var selLang = cookie.get("selLang");
	$('#out-lang').val(selLang ? selLang : "C++");
	$('#out-lang').trigger('change');

	truthTable.translate();
});