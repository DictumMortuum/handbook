String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
};

function saveRating(id, t, evt) {
    evt.preventDefault();
    evt.stopPropagation();

    var weight = "";

    if ($('#' + id).hasClass("navy")) {
        weight = "navy"
    } else if ($('#' + id).hasClass("blue")) {
        weight = "blue"
    } else if ($('#' + id).hasClass("black")) {
        weight = "black"
    } else if ($('#' + id).hasClass("red")) {
        weight = "red"
    }

    console.log(weight);

    Handbook.ajax({
        "name": id,
        "action": "vote",
        "color": weight
    });

    $(t).prop('onclick',null);
    $(t).css('background-position', '0 -20px');
    return false
}

function getRating(rate) {

    console.log(rate);

    $('.tile').each(function(){
        var id  = $(this).attr('id');
        var ret = rate[id] === undefined ? 0 : rate[id].votes;

        var weight = "";

        if ($(this).hasClass("navy")) {
            weight = "navy"
        } else if ($(this).hasClass("blue")) {
            weight = "blue"
        } else if ($(this).hasClass("black")) {
            weight = "black"
        } else if ($(this).hasClass("red")) {
            weight = "red"
        }

        var color = rate[id] === undefined ? rate[weight].color : rate[id].color;

        //$(this).find('h4').css('background-color', '#' + color);
        $(this).find('.score').html(ret);
    });
}

function format_item(data) {
    var output = "";
    output += data.id || "";
    output += data.name || "";

    data.desc = data.desc.replace(/\\n/g, '</p><p>');
    data.selector = output.hashCode();

    return data
}

function format_animal(data) {
    data = format_item(data);

    data.special = data.special.replace(/,/g, ', ');

    return data
}

var sort_order = [];
var filters = [];
var banned = [];
var books = ['.ecs', '.dmg', '.dmg2', '.mm1', '.mm2', '.mm3', '.mm4', '.mm5', '.phb', '.phb2',
    '.boed', '.cv', '.city', '.ca', '.cc', '.cd', '.cpsi', '.cs', '.cw', '.drac', '.ds', '.ee', '.xph',
    '.eoe', '.ff1', '.ff2', '.fb', '.hob', '.hoh', '.lm', '.lom', '.moi', '.mic', '.mh', '.plh',
    '.rod', '.roe', '.rof', '.ros', '.rotd', '.rotw', '.sand', '.ss', '.spc', '.sw', '.tob', '.tom',
    '.ua', '.wol', '.ff', '.ecs', '.dmr', '.doe', '.eh', '.foe', '.f5n', '.fow', '.moe', '.pgte',
    '.sos', '.sox', '.cot', '.cor', '.cov', '.dof', '.leof', '.pof', '.sk', '.sso', '.ue', '.und',
    '.wtd', '.mof'];

function setup() {

    $('.desc div').click(function () {

        var sort = $(this).attr('class').split(' ')[0];
        $('.' + sort).toggleClass('toggleBlack');

        if ($.inArray(sort, sort_order) == -1) {
            sort_order.push(sort);

        } else {
            sort_order = $.grep(sort_order, function (value) {
                return value != sort
            });
        }

        console.log(sort_order);

        $('#animal').isotope({
            sortBy: sort_order
        });
    });

    function elementClick(data, event) {

        if (event.shiftKey) {
            if ($.inArray(data, banned) == -1)
                banned.push(data)
        } else if (event.ctrlKey) {
            filters = $.grep(filters, function (value) {
                return value != data
            })
        } else {
            if ($.inArray(data, filters) == -1)
                filters.push(data)
        }

        var temp = filters.toString().replace(/,/g, '');

        $.each(banned, function (i, book) {
            temp += ':not(' + book + ')'
        });

        if (temp === "") {
            temp = "*"
        } else {
            temp += ',.pinned'
        }

        console.log(temp, event);

        $('.section').isotope({filter: temp})
    }

    $.each(books, function (i, data) {
        $(data + ' .book').click(function (event) {
            elementClick(data, event)
        })
    });

    $.each(['.beast', '.summoner', '.master'], function (i, data) {
        $(data + ' ' + data).click(function (event) {
            elementClick(data, event)
        })
    });

    $.each(['.navy', '.black', '.blue', '.red'], function (i, data) {
        $(data + ' h4').click(function (event) {
            elementClick(data, event)
        })
    });
}