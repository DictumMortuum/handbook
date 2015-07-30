(function (Handbook, $, undefined) {

	var config = undefined
	var rate   = {}

	Handbook.init = function(arg) {

		config = arg

		Tabletop.init({
			key: arg.url,
			callback: sections,
			simpleSheet: true
		})
	}

	function template(selector, data) {

		var template = $(selector).html()
		Mustache.parse(template)
		var rendered = Mustache.render(template, data)

		return $(rendered)
	}

	function format(name, type) {
		return name.replace(/[ \*\'\/]/g,'') + " " + type.replace(/[ \*\'\/]/g,'')
	}

	function ratings(tabletop) {

		$.each(tabletop.sheets("DATA").all(), function(i, data) {
			var temp = format(data.name, data.type)

			if(!(temp in rate)) {
				rate[temp] = 1
			} else {
				rate[temp]++
			}
		})
	}

	function rating(name, type) {
		return rate[format(name, type)] == null ? 0 : rate[format(name, type)]
	}

	function sections(data, tabletop) {
		ratings(tabletop)

		$.each(tabletop.sheets('info').all(), function(i, data) {
			$('#handbook').append(template(config.section, data))

			if(data.html != "") {
				items(tabletop, data.code)
			}

			$('#' + data.code).isotope({
				itemSelector: '.masonry',
				percentPosition: true,
				getSortData: {
					rating: '[data-rating] parseInt'
				},
				sortBy: 'rating',
				percentPosition: true,
				sortAscending: false,
				masonry: {
					columnWidth: '.sizer',
					gutter: '.gutter-sizer'
				}
			})
		})

		$.each(['.navy', '.black', '.blue', '.ared'], function(i, data) {
			$('h4' + data).click(function(event) {
				if(event.ctrlKey) {
					$('section').isotope({filter: data})
				} else {
					$(this).parent().parent().isotope({filter: data})
				}
			})
		})
		
		$('section > .heading').click(function(event) {
			if(event.ctrlKey) {
				$('section').isotope({filter: '*'})
			} else {
				$(this).parent().isotope({filter: '*'})
			}
		})
	}

	function items(tabletop, section) {
		$.each(tabletop.sheets(config.sheet).all(), function(i, data) {
			if(data.type === section) {
				data.description = data.description.replace(/\n/g, '</p><p>')
				data.book        = rating(data.name, data.type)
				data['ratename'] = data.name.replace(/[ \*\'\/]/g,''),
				data['ratetype'] = data.type.replace(/[ \*\'\/]/g,''),
				template(config.element, data).appendTo('#' + section)
			}
		})
	}

}(window.Handbook = window.Handbook || {}, jQuery));