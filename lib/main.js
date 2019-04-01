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
	updateColours: function ()
	{
		var truths =	["1",	"true",		"on",	"yes",	"enabled",	"enable",	"is"];
		var falsities = ["0",	"false",	"off",	"no",	"disabled",	"disable",	"not"];

		var table = $("#input-table");
		var rows = table[0].rows;

		i = rows.length;
		while (i > 1)
		{
			i--;
			var el = rows[i].cells[rows[i].cells.length - 1].childNodes[0];
			
			if (truths.includes(el.value))
			{
				$(el).parent().addClass("table-success");
				$(el).parent().removeClass("table-danger");
				$(el).parent().removeClass("table-warning");
			}
			else
				if (falsities.includes(el.value))
				{
					$(el).parent().addClass("table-danger");
					$(el).parent().removeClass("table-success");
					$(el).parent().removeClass("table-warning");
				}
				else
				{
					$(el).parent().addClass("table-warning");
					$(el).parent().removeClass("table-success");
					$(el).parent().removeClass("table-danger");
				}
		}
	}
}

tblEdit.updateColours();