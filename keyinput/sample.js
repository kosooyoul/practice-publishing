$(document).ready(function() {
	var utils = (window.utils = {});
	var namespace = (window.namespace = {});
	var status = (window.status = {});

	utils.actionByElement = function(element) {
		var name = $(element).data('action');
		var param = $(element).data('action-param');
		var delay = $(element).data('action-delay') || 1;

		if (name == null) return;
		name = String(name).trim();

		if (namespace[name]) {
			setTimeout(function() {
				namespace[name].call(namespace, element, param);
			}, delay);
		}
	};

	utils.condition = function(condition) {
		var c, name, value;

		if (!condition) return true;

		c = condition.split('=');
		name = c[0]? c[0].trim(): null;
		value = c[1]? c[1].trim(): null;

		return status[name] && status[name] == value;
	};

	utils.containTrigger = function(trigger, type, param) {
		var t;

		if (!trigger && type == 'click') return true;

		t = utils.schemeStringToObject(trigger);

		if (!t.hasOwnProperty(type)) return false;
		if (!t[type]) return true;

		return t[type] == param;
	};

	utils.schemeStringToObject = function(scheme) {
		var obj;

		obj = scheme.split(';').reduce(function(obj, elem) {
			var elemParts = elem.split(':').map(function(x) {
				return x.trim();
			});
			obj[elemParts[0]] = elemParts[1];
			return obj;
		}, {});

		return obj;
	};

	utils.keyNameToCode = function(name) {
		switch (name) {
			case 'up': return 38;
			case 'down': return 40;
			case 'left': return 37;
			case 'right': return 39;
			case 'enter': return 13;
			case 'esc': return 27;
			case '0': return 48;
			case '1': return 49;
			case '2': return 50;
			case '3': return 51;
			case '4': return 52;
			case '5': return 53;
			case '6': return 54;
			case '7': return 55;
			case '8': return 56;
			case '9': return 57;
		}
		return name;
	};

	utils.keyCodeToName = function(code) {
		switch (code) {
			case 38: return 'up';
			case 40: return 'down';
			case 37: return 'left';
			case 39: return 'right';
			case 13: return 'enter';
			case 27: return 'esc';
			case 48: return '0';
			case 49: return '1';
			case 50: return '2';
			case 51: return '3';
			case 52: return '4';
			case 53: return '5';
			case 54: return '6';
			case 55: return '7';
			case 56: return '8';
			case 57: return '9';
			case 65: return 'a';
			case 66: return 'b';
			case 67: return 'c';
			case 68: return 'd';
		}
		return code;
	};

	utils.mouseCodeToName = function(code) {
		switch (code) {
			case 0: return 'none';
			case 1: return 'left';
			case 2: return 'center';
			case 3: return 'right';
		}
		return code;
	};

	utils.paramFromEvent = function(evt) {
		var param = (evt.altKey? '@': '') + (evt.ctrlKey? '^': '') + (evt.shiftKey? '+': '');

		if (evt.type.startsWith('key')) {
			param += utils.keyCodeToName(evt.keyCode);
		} else if (evt.type.startsWith('mouse')) {
			param += utils.mouseCodeToName(evt.which);
		}

		return param;
	};

	namespace.href = function(element, href) {
		location.assign(href);
	};

	namespace.group = function(element, params) {
		var p = String(params).split(':');
		var name = p[0];
		var cmd = p[1];
		var param = p[2];

		var group = $('[data-group=\'' + name + '\']');
		var children = group.find('[data-group-parent=\''+ name + '\']');
		var item = children.filter('.active');
		if (item.length == 0) item = children.filter('[data-group-default]');
		if (item.length == 0) item = $(children.get(0));
		if (item.length == 0) return;

		var count = children.length;
		var index = children.index(item);

		switch (cmd) {
			case 'init': {
				children.removeClass('active').addClass('deactive');
				children.filter('[data-group-default]').removeClass('deactive').addClass('active');
				return;
			}
			case 'prev': index--; break;
			case 'next': index++; break;
			case 'go': index = param; break;
			case 'up': index = parseInt(item.data('group-up')) || (index - 1); break;
			case 'down': index = parseInt(item.data('group-down')) || (index + 1); break;
			case 'left': index = parseInt(item.data('group-left')) || (index - 1); break;
			case 'right': index = parseInt(item.data('group-right')) || (index + 1); break;
			default: return;
		}

		index = index % count;

		children.removeClass('active').addClass('deactive');
		$(children.get(index)).removeClass('deactive').addClass('active');
	};

	var __initEvents__ = function (type, global, param) {
		var root = $(document);
		var onevent;

		onevent = function(e) {
			var target, cparam;
			var i, count;

			target = (e instanceof $.Event)? (!global? e.target: null): null;
			target = target? $(target): $('[data-action-trigger]');
			count = target.length;

			if ((e instanceof $.Event) && !param) {
				cparam = utils.paramFromEvent(e);
			} else {
				cparam = param;
			}

			for (i = 0; i < count; i++) {
				__onEvent__(target[i], type, cparam);
			}
		};

		if (root[type]) {
			root[type](onevent);
		} else {
			root.on(type, onevent);
		}
	};

	var __onEvent__ = function(target, type, param) {
		var element = $(target);

		if (!element.data('action')) return;

		if (utils.containTrigger(element.data('action-trigger'), type, param)) {
			utils.actionByElement(element[0]);
		}
	};

	__initEvents__('click');
	__initEvents__('dblclick');
	__initEvents__('mouseenter');
	__initEvents__('mouseleave');
	__initEvents__('mousedown');
	__initEvents__('mouseup');
	__initEvents__('mousemove');
	__initEvents__('mouseover');
	__initEvents__('mouseout');
	__initEvents__('keydown', true);
	__initEvents__('keyup', true);
	__initEvents__('keypress', true);
	__initEvents__('ready', true);

});