(function (Handbook, $, undefined) {

	var config = undefined
	var rate   = {}

	Handbook.init = function(arg) {

		config = arg

		config.format.section = arg.format.section || identity
		config.format.item    = arg.format.item    || identity
		config.format.page    = arg.format.page    || function() {}
		config.rating         = arg.rating         || false

		Tabletop.init({
			key: arg.url,
			callback: sections,
			simpleSheet: true
		})
	}

	function identity(data) {
		return data
	}

	function template(selector, data) {

		var template = $(selector).html()
		Mustache.parse(template)
		var rendered = Mustache.render(template, data)

		return $(rendered)
	}

	function id(name, type) {
		return name.replace(/[ \*\'\/]/g,'') + " " + type.replace(/[ \*\'\/]/g,'')
	}

	function ratings(tabletop) {

		$.each(tabletop.sheets("DATA").all(), function(i, data) {
			var temp = id(data.name, data.type)

			if(!(temp in rate)) {
				rate[temp] = 1
			} else {
				rate[temp]++
			}
		})
	}

	Handbook.rating = function(name, type) {
		return rate[id(name, type)] == null ? 0 : rate[id(name, type)]
	}

	function sections(data, tabletop) {

		if(config.rating) {
			ratings(tabletop)
		}

		$.each(tabletop.sheets('info').all(), function(i, data) {

			data = config.format.section(data)

			$('#handbook').append(template(config.section, data))

			if(data.html != "") {
				items(tabletop, data.code)
			}
		})

		config.format.page()
	}

	function items(tabletop, section) {

		$.each(tabletop.sheets(config.sheet).all(), function(i, data) {

			if(data.type === section) {

				data = config.format.item(data)

				template(config.element, data).appendTo('#' + section)
			}
		})
	}

}(window.Handbook = window.Handbook || {}, jQuery));