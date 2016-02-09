(function (Handbook, $, undefined) {

	var config = undefined;
	var rate   = {};
    var url = "https://script.google.com/macros/s/AKfycby4RiiOHt6KERQ7w1u9ZQVnJ-tmAX9UK_NHU5agkFWTij3Yd0U/exec";

	Handbook.init = function(arg) {

		config = arg;

		var xhr = new XMLHttpRequest();
		xhr.open('GET', config.db, true);
		xhr.responseType = 'arraybuffer';
		xhr.send();

		xhr.onload = function() {
			var uInt8Array = new Uint8Array(this.response);
			unload_database(new SQL.Database(uInt8Array));
		};
	};

	function unload_database(db) {

		for(var i = 0; i < config.query.length; i++) {
			var cur = config.query[i];

			var content = db.exec(cur[0]);

			for(var j = 0; j < content[0].values.length; j++) {
				unload(content[0].columns, content[0].values[j], cur[1], cur[2], cur[3]);
			}
		}

		config.callback()
	}

	function unload(columns, values, format, tpl, anchor) {
		var data = {};

		for(var j = 0; j < columns.length; j++) {
			data[columns[j]] = values[j];
		}

		anchor = anchor || '#' + data.id;
		tpl    = tpl    || '#default_template';
		format = format || identity;

		$(anchor).append(template(tpl, format(data)));
	}

	function identity(data) {
		return data
	}

	function template(selector, data) {
		var template = $(selector).html();
		Mustache.parse(template);
		var rendered = Mustache.render(template, data);
		return $(rendered)
	}

	Handbook.rating = function(id) {
		return rate[id] || 0;
	};

	Handbook.utils = {
		limits: {
			size: [], spd: [], spc: [], rating: [], att: [], str: [], dex: [], con: [],	nat: [], tot: [], off: [], def: []
		},
		min: function(type, value) {
			if(Handbook.utils.limits[type][0] === undefined) {
				Handbook.utils.limits[type][0] = value
			} else {
				if(Handbook.utils.limits[type][0] > value) {
					Handbook.utils.limits[type][0] = value
				}
			}
		},
		max: function(type, value) {
			if(Handbook.utils.limits[type][1] === undefined) {
				Handbook.utils.limits[type][1] = value
			} else {
				if(Handbook.utils.limits[type][1] < value) {
					Handbook.utils.limits[type][1] = value
				}
			}
		},
		normalize: function(type, value) {
			var min = Handbook.utils.limits[type][0];
			var max = Handbook.utils.limits[type][1];
			var nml;

			if (min == 0 && max == 0) {
				nml = 0
			} else {
				nml = (value - min)/(max - min)
			}

			return nml
		},
		simple: function(item, type) {
			var total = $(item).data(type);
			Handbook.utils.min(type, total);
			Handbook.utils.max(type, total);
			return total
		},
		color: function(item) {
			var weight = 0;

			if ($(item).hasClass("navy")) {
				weight = 100
			} else if ($(item).hasClass("blue")) {
				weight = 50
			} else if ($(item).hasClass("black")) {
				weight = 25
			} else if ($(item).hasClass("red")) {
				weight = 0
			}

			return weight
		},
		size: function(item) {
			var weight = 0;
			var type   = $(item).data('size');

			if (type == "dimunitive") {
				weight = 1
			} else if (type == "tiny") {
				weight = 2
			} else if (type == "small") {
				weight = 3
			} else if (type == "medium") {
				weight = 4
			} else if (type == "large") {
				weight = 5
			} else if (type == "huge") {
				weight = 6
			} else if (type == "gargantuan") {
				weight = 7;
				$(item).hide();
			}

			Handbook.utils.min('size', weight);
			Handbook.utils.max('size', weight);

			return weight
		},
		spd: function(item) {
			var total = 0;
			var speed_list = $(item).data('spd');

			if(speed_list !== undefined) {
				speed_list = speed_list.split(' ');
				total += parseInt(speed_list.shift().replace(/ft/g, ''));

				while(speed_list.length) {
					var type   = speed_list.shift();
					var amount = parseInt(speed_list.shift().replace(/ft/g, ''));
					var weight = 1;

					if (type == "fly") {
						weight = 1.2;
					} else if (type == "burrow") {
						weight = 1.1;
					} else if (type == "swim") {
						weight = 0.9;
					}

					total += weight * amount;
				}
			}

			Handbook.utils.min('spd', total);
			Handbook.utils.max('spd', total);

			return total
		},
		spc: function(item) {
			var abilities = $(item).data('spc');
			var total     = -1;

			if (abilities === undefined || abilities === '') {
				total = 0;
			} else {
				total = abilities.split(',').length;
			}

			Handbook.utils.min('spc', total);
			Handbook.utils.max('spc', total);

			return total
		},
		rating: function(item) {
			return Handbook.utils.simple(item, 'rating')
		},
		type: function(item) {
			return $(item).data('type')
		},
		att: function(item) {
			return Handbook.utils.simple(item, 'att')
		},
		str: function(item) {
			return Handbook.utils.simple(item, 'str')
		},
		dex: function(item) {
			return Handbook.utils.simple(item, 'dex')
		},
		con: function(item) {
			return Handbook.utils.simple(item, 'con')
		},
		nat: function(item) {
			return Handbook.utils.simple(item, 'nat')
		},
		total: function(item) {
			var ret = 0;

			ret += Handbook.utils.normalize('rating', parseInt($(item).data('rating')));
			ret += Handbook.utils.normalize('att', parseInt($(item).data('att')));
			ret += Handbook.utils.normalize('str', parseInt($(item).data('str')));
			ret += Handbook.utils.normalize('dex', parseInt($(item).data('dex')));
			ret += Handbook.utils.normalize('con', parseInt($(item).data('con'))) * 0.5;
			ret += Handbook.utils.normalize('nat', parseInt($(item).data('nat')));
			ret += Handbook.utils.normalize('size', Handbook.utils.size(item));
			ret += Handbook.utils.normalize('spd', Handbook.utils.spd(item));
			ret += Handbook.utils.normalize('spc', Handbook.utils.spc(item));

			Handbook.utils.min('tot', ret);
			Handbook.utils.max('tot', ret);
			//$(item).find('.tot').html(ret);

			return ret;
		},
		offense: function(item) {
			var ret = 0;

			ret += Handbook.utils.normalize('rating', parseInt($(item).data('rating')));
			ret += Handbook.utils.normalize('att', parseInt($(item).data('att')));
			ret += Handbook.utils.normalize('str', parseInt($(item).data('str')));
			ret += Handbook.utils.normalize('dex', parseInt($(item).data('dex')));
			//ret += Handbook.utils.normalize('con', parseInt($(item).data('con')));
			//ret += Handbook.utils.normalize('nat', parseInt($(item).data('nat')));
			ret += Handbook.utils.normalize('size', Handbook.utils.size(item));
			//ret += Handbook.utils.normalize('spd', Handbook.utils.spd(item));
			ret += Handbook.utils.normalize('spc', Handbook.utils.spc(item));

			Handbook.utils.min('off', ret);
			Handbook.utils.max('off', ret);
			//$(item).find('.off').html(ret);

			return ret;
		},
		defense: function(item) {
			var ret = 0;

			ret += Handbook.utils.normalize('rating', parseInt($(item).data('rating')));
			//ret += Handbook.utils.normalize('att', parseInt($(item).data('att')));
			//ret += Handbook.utils.normalize('str', parseInt($(item).data('str')));
			ret += Handbook.utils.normalize('dex', parseInt($(item).data('dex')));
			ret += Handbook.utils.normalize('con', parseInt($(item).data('con'))) * 0.5;
			ret += Handbook.utils.normalize('nat', parseInt($(item).data('nat')));
			//ret += Handbook.utils.normalize('size', Handbook.utils.size(item));
			ret += Handbook.utils.normalize('spd', Handbook.utils.spd(item));
			ret += Handbook.utils.normalize('spc', Handbook.utils.spc(item));

			Handbook.utils.min('def', ret);
			Handbook.utils.max('def', ret);
			//$(item).find('.def').html(ret);

			return ret;
		}
	};

    Handbook.ajax = function(data){
        data.sheet = data.sheet || 'druid';
        data.jsonp = data.jsonp || 'console.log';

        return $.ajax({
            "url": url,
            "dataType": 'jsonp',
            "data": data
        });
    };

}(window.Handbook = window.Handbook || {}, jQuery));