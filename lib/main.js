tblEdit = {
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
		tblEdit.updateColours();
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

		var tbl = $("#input-table")[0];

		for (var i = 0; i < bins.length; i++)
		{
			// Loop through bins and add it to the table
			for (var x = 0; x < bins[i].length; x++)
			{
				tbl.rows[i + 1].cells[x].innerHTML = bins[i][x];
			}
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

$(document).ready(function ()
{
	$("#out-lang").select2({
		width: "100%"
	});

	$("#out-lang").on("select2:select", function (e)
	{
		tblEdit.convert();
	});

	tblEdit.fillTable();
});