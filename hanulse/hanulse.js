var $hanulse = new (function hanulse(env) {
	var hanulse = this;

	// Private constants
	var DEFAULT_VIEW_WIDTH = 600; // Need to customize
	var DEFAULT_VIEW_HEIGHT = 500; // Need to customize
	var DEFAULT_VIEW_CENTER_X = 300; // Need to customize
	var DEFAULT_VIEW_CENTER_Y = 250; // Need to customize
	var CELL_WIDTH = 68;
	var CELL_HEIGHT = 34;
	var CELL_DEPTH = 31;
	var CELL_WIDTH_HALF = 34;
	var CELL_HEIGHT_HALF = 17;

	// Private utils
	var crlfToBr = function(text) {
		return text && String(text).replace(/(\n)|(\\n)/g, '<br>');
	};
	var crlfToSpace = function(text) {
		return text && String(text).replace(/(\n)|(\\n)/g, ' ');
	};
	var getData = function($e, name, defaultValue) {
		return $e.data(name) || defaultValue;
	};
	var getNumberData = function($e, name, defaultValue) {
		return Number(getData($e, name)) || defaultValue;
	};
	var getEnumData = function($e, name, arr, defaultValue) {
		var data = getData($e, name);
		return arr.includes(data)? data: defaultValue;
	};

	// Private html
	var SVG_GROUND = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<path class="hanulse-cell_ground" data-tag="shape" d="m 34 0 l 34 17 l -34 17 l -34 -17 l 34 -17" fill="#999999CC" stroke="rgb(82, 76, 18)" stroke-width="0.5" fill-rule="evenodd" style="pointer-events: auto;"/>',
		'</svg>'
	].join('\n')
	var SVG_WALL_LEFT = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<path class="hanulse-cell_wall-left" data-tag="shape" d="m 0 17 l 34 -17 l 0 -31 l -34 17 l 0 31" fill="#777777CC" stroke="rgb(82, 76, 18)" stroke-width="0.5" fill-rule="evenodd" style="pointer-events: auto;"/>',
		'</svg>'
	].join('\n')
	var SVG_WALL_RIGHT = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<path class="hanulse-cell_wall-right" data-tag="shape" d="m 34 0 l 34 17 l 0 -31 l -34 -17 l 0 31" fill="#888888CC" stroke="rgb(82, 76, 18)" stroke-width="0.5" fill-rule="evenodd" style="pointer-events: auto;"/>',
		'</svg>'
	].join('\n')
	var SVG_GROUND_LINKED = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<a data-tag="link" href="" style="pointer-events: auto;">',
		'		<path class="hanulse-cell_ground" data-tag="shape" d="m 34 0 l 34 17 l -34 17 l -34 -17 l 34 -17" fill="#999999CC" stroke="rgb(82, 76, 18)" stroke-width="0.5" fill-rule="evenodd" style="pointer-events: auto;"/>',
		'	</a>',
		'</svg>'
	].join('\n')
	var SVG_WALL_LEFT_LINKED = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<a data-tag="link" href="" style="pointer-events: auto;">',
		'		<path class="hanulse-cell_wall-left" data-tag="shape" d="m 0 17 l 34 -17 l 0 -31 l -34 17 l 0 31" fill="#777777CC" stroke="rgb(82, 76, 18)" stroke-width="0.5" fill-rule="evenodd" style="pointer-events: auto;"/>',
		'	</a>',
		'</svg>'
	].join('\n')
	var SVG_WALL_RIGHT_LINKED = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<a data-tag="link" href="" style="pointer-events: auto;">',
		'		<path class="hanulse-cell_wall-right" data-tag="shape" d="m 34 0 l 34 17 l 0 -31 l -34 -17 l 0 31" fill="#888888CC" stroke="rgb(82, 76, 18)" stroke-width="0.5" fill-rule="evenodd" style="pointer-events: auto;"/>',
		'	</a>',
		'</svg>'
	].join('\n')

	// Define class group
	hanulse.group = function($e) {
		// Set default
		$e.addClass('hanulse-group');

		// Get fields
		var fields = {};
		fields.offsetLeft = getNumberData($e, 'offset-left', 0);
		fields.offsetTop = getNumberData($e, 'offset-top', 0);

		// Set element style
		$e.css('left', fields.offsetLeft + DEFAULT_VIEW_CENTER_X - CELL_WIDTH_HALF);
		$e.css('top', fields.offsetTop + DEFAULT_VIEW_CENTER_Y - CELL_HEIGHT_HALF);
	};

	// Define class cell
	hanulse.cell = function($e) {
		// Set default
		$e.addClass('hanulse-cell');

		// Get fields
		var fields = {};
		fields.type = getEnumData($e, 'type', ['ground', 'wall-left', 'wall-right'], 'ground');
		fields.text = getData($e, 'text');
		fields.link = getData($e, 'link');
		fields.menu = getData($e, 'menu');
		fields.memo = getData($e, 'memo');
		fields.input = getData($e, 'input');
		fields.effect = getData($e, 'effect'); // none, simple, flash, warp, warp-big, bubble, shine
		fields.x = getNumberData($e, 'x', 0);
		fields.y = getNumberData($e, 'y', 0);
		fields.d = getNumberData($e, 'd', 0);

		// Set element style
		var left = (fields.x - fields.y) * CELL_WIDTH / 2;
		var top = (fields.y + fields.x) * CELL_HEIGHT / 2 - (fields.d * CELL_DEPTH);
		$e.css('left', left);
		$e.css('top', top);
		$e.css('width', CELL_WIDTH);
		$e.css('height', CELL_HEIGHT);

		// Create child elements
		var $shape = null;
		if (fields.link) {
			if (fields.type == 'ground') $shape = $(SVG_GROUND_LINKED);
			else if (fields.type == 'wall-left') $shape = $(SVG_WALL_LEFT_LINKED);
			else if (fields.type == 'wall-right') $shape = $(SVG_WALL_RIGHT_LINKED);
			else $shape = $(SVG_LINKED_GROUND);
			$shape.find('[data-tag="link"]').attr({'href': fields.link, 'alt': crlfToSpace(fields.text)});
		} else {
			if (fields.type == 'ground') $shape = $(SVG_GROUND);
			else if (fields.type == 'wall-left') $shape = $(SVG_WALL_LEFT);
			else if (fields.type == 'wall-right') $shape = $(SVG_WALL_RIGHT);
			else $shape = $(SVG_GROUND);
		}
		$e.append($shape)
		if (fields.text) {
			var $textWrap = $('<div>').addClass('hanulse-cell_text-wrap').css({'left': CELL_WIDTH_HALF - 120 / 2, 'top': -CELL_DEPTH - 12})
			var $text = $('<span>').addClass('hanulse-cell_text').text(crlfToSpace(fields.text))
			$textWrap.append($text)
			$e.append($textWrap)
		}

		// Initialize events
		$shape.find('[data-tag="shape"]').on('click', function() {
			hanulse.dialog.show(fields.menu, left + DEFAULT_VIEW_CENTER_X, top + DEFAULT_VIEW_CENTER_Y);
			hanulse.dialog.show(fields.memo, left + DEFAULT_VIEW_CENTER_X, top + DEFAULT_VIEW_CENTER_Y);
			hanulse.dialog.show(fields.input, left + DEFAULT_VIEW_CENTER_X, top + DEFAULT_VIEW_CENTER_Y);
		});
	};

	// Define class dialog
	hanulse.dialog = function($e) {
		var _this = this;

		// Set default
		$e.addClass('hanulse-dialog');

		// Get fields
		var fields = {};
		fields.name = getData($e, 'name');
		fields.black = getEnumData($e, 'black', ['yes', 'no'], 'yes');

		// Register instance
		hanulse.dialog.instances[fields.name] = this;

		// Create child elements
		var $black = null;
		if (fields.black == 'yes') {
			$black = $('<div>').addClass('hanulse-dialog_black');
			$e.append($black);
		}

		// Initialize events
		if ($black) {
			$black.on('click', function() {
				_this.hide();
			});
		}

		// Instance functions
		this.show = function() {
			$e.css('display', 'block');
		};

		this.hide = function() {
			$e.css('display', 'none');
		};
	};

	// Define static items of class menu
	hanulse.dialog.instances = {};
	hanulse.dialog.get = function(name) {
		return hanulse.dialog.instances[name];
	};
	hanulse.dialog.show = function(name, left, top) {
		var dialog = hanulse.dialog.get(name);
		if (dialog) {
			dialog.show(left, top);
		}
	};

	// Define class menu
	hanulse.menu = function($e) {
		var _this = this;

		// Inherit from class dialog
		hanulse.dialog.call(this, $e);

		$e.addClass('hanulse-menu');

		// Create child elements
		var $list = $('<div>').addClass('hanulse-menu_list').css('width', 240);
		$list.append($e.children('[data-class="hanulse.menu.item"]'))
		$e.append($list)

		// Instance functions
		var parentShow = this.show;
		this.show = function(left, top) {
			$list.css({'left': left - 120, 'top': top});
			parentShow.call(_this);
		};
	};

	// Define class menu item
	hanulse.menu.item = function($e) {
		// Set default
		$e.addClass('hanulse-menu-item');

		// Get fields
		var fields = {};
		fields.text = getData($e, 'text');
		fields.status = getEnumData($e, 'status', ['ok', 'possible', 'working', 'impossible'], 'possible');
		fields.link = getData($e, 'link');

		// Set additional
		$e.attr({'href': fields.link, 'alt': crlfToSpace(fields.text)});

		// Create child elements
		var $text = $('<div>').addClass('hanulse-menu-item_text').text(crlfToSpace(fields.text));
		var $status = $('<div>').addClass('hanulse-menu-item_status');
		if (fields.status == 'ok') $status.text("ok").css('color', '#00FF00');
		else if (fields.status == 'possible') $status.text("possible").css('color', '#FFFF00');
		else if (fields.status == 'working') $status.text("working").css('color', '#FFC800');
		else if (fields.status == 'impossible') {
			$e.attr('href', 'javascript:void(0)');
			$e.css('color', '#808080');
			$status.text("impossible").css('color', '#FF0000');
		}
		else $status.text("possible").css('color', '#FFFF00');
		$e.append($text);
		$e.append($status);
	};

	// Define class memo
	hanulse.memo = function($e) {
		var _this = this;

		// Inherit from class dialog
		hanulse.dialog.call(this, $e);

		// Set default
		$e.addClass('hanulse-memo');

		// Get fields
		var fields = {};
		fields.text = getData($e, 'text');

		// Create child elements
		var $box = $('<div>').addClass('hanulse-memo_box').css('width', 200);
		var $text = $('<div>').addClass('hanulse-memo_text').html(crlfToBr(fields.text));
		$box.append($text);
		$e.append($box);

		// Initialize events
		$box.on('click', function() {
			_this.hide();
		});

		// Instance functions
		var parentShow = this.show;
		this.show = function(left, top) {
			$box.css({'left': left - 100, 'top': top});
			parentShow.call(_this);
		};
	};

	// Define class input
	hanulse.input = function($e) {
		var _this = this;

		// Inherit from class dialog
		hanulse.dialog.call(this, $e);

		// Set default
		$e.addClass('hanulse-input');

		// Get fields
		var fields = {};
		fields.text = getData($e, 'text');
		fields.type = getData($e, 'type', ['text', 'password', 'number', 'date', 'color', 'month', 'week', 'time', 'datetime'], 'text');
		fields.submit = getData($e, 'submit');
		fields.callback = getData($e, 'callback');

		// Create child elements
		var $box = $('<div>').addClass('hanulse-input_box').css('width', 200);
		var $text = $('<div>').addClass('hanulse-input_text').html(crlfToBr(fields.text));
		var $input = $('<input type="text">').addClass('hanulse-input_input').attr('type', fields.type);
		var $submit = $('<input type="button">').addClass('hanulse-input_submit').val(fields.submit || '확인');
		$box.append($text);
		$box.append($input);
		$box.append($submit);
		$e.append($box);

		// Initialize events
		$box.on('click', function() {
			$input.focus();
		});
		$input.on('keyup', function(evt) {
			if (evt.code == 'Enter') {
				$submit.click();
			}
		});
		$submit.on('click', function() {
			var value = $input.val();
			$input.val(null);

			_this.hide();

			setTimeout(function() {
				var func = eval(fields.callback);
				if (func instanceof Function) {
					func(value);
				}
			})
		});

		// Instance functions
		var parentShow = this.show;
		this.show = function(left, top) {
			$input.val(null);
			$box.css({'left': left - 100, 'top': top});

			parentShow.call(_this);

			$input.focus();
		};
	};
})();

$(document).ready(function() {
	$('[data-class="hanulse.group"]').each(function(index, element) {
		new $hanulse.group($(element));
	})

	$('[data-class="hanulse.cell"]').each(function(index, element) {
		new $hanulse.cell($(element));
	})

	$('[data-class="hanulse.menu"]').each(function(index, element) {
		new $hanulse.menu($(element));
	})

	$('[data-class="hanulse.menu.item"]').each(function(index, element) {
		new $hanulse.menu.item($(element));
	})

	$('[data-class="hanulse.memo"]').each(function(index, element) {
		new $hanulse.memo($(element));
	})

	$('[data-class="hanulse.input"]').each(function(index, element) {
		new $hanulse.input($(element));
	})
});