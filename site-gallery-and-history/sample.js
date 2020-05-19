(function(namespace) {
	var jayune = namespace.jayune || (namespace.jayune = {});
	var utils = jayune.utils || (jayune.utils = {});
	var status = jayune.status || (jayune.status = {});
	var actions = jayune.actions || (jayune.actions = {});
	var plugins = jayune.plugins || (jayune.plugins = {});

	jayune.addPlugin = function(name, statics) {
		if (plugins[name]) throw new Error('Plugin \'' + name + '\' is already added.');
		if (!(statics['init'] instanceof Function)) throw new Error('Plugin \'' + name + '\' does not have \'init\' function.');

		plugins[name] = statics;
	};

})(window);

(function(namespace) {
	var jayune = namespace.jayune || (namespace.jayune = {});
	var utils = jayune.utils || (jayune.utils = {});

	utils.action = function(ns, element) {
		var name = $(element).data('action');
		var delay = $(element).data('action-delay') || 1; //Consider

		if (name == null) return;
		name = String(name).trim();

		if (ns[name]) {
			setTimeout(function() {
				ns[name].call(ns, element);
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

		obj = (scheme || '').split(';').reduce(function(obj, elem) {
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

	utils.paramStringToArray = function(str, separator) {
		return params = (str || '').split(separator || ' ').filter(function(o) {return o;});
	};
})(window);

(function(namespace) {
	var jayune = namespace.jayune || (namespace.jayune = {});
	var utils = jayune.utils || (jayune.utils = {});
	var status = jayune.status || (jayune.status = {});
	var actions = jayune.actions || (jayune.actions = {});

	actions.anchor = function(element) {
		var href = $(element).data('action-anchor-href');
		var target = $(element).data('action-anchor-target');

		if (target) {
			window.open(href, target);
		} else {
			location.assign(href);
		}
	};

	actions.group = function(element) {
		var name = $(element).data('action-group');
		var behavior = utils.paramStringToArray($(element).data('action-group-behavior'));
		var cmd = params[0];
		var param = params[1];

		var group = $('[data-group=\'' + name + '\']');
		var children = group.find('[data-group-parent=\''+ name + '\']');
		var item = children.filter('.active');
		if (item.length == 0) item = children.filter('[data-group-default]');
		if (item.length == 0) item = $(children.get(0));
		if (item.length == 0) return;

		var count = children.length;
		var index = children.index(item);
		var direction = 0;

		switch (cmd) {
			case 'init': {
				children.removeClass('active').addClass('deactive');
				item.removeClass('deactive').addClass('active');
				return;
			}
			case 'prev': {
				direction = -1;
				index--;
				break;
			}
			case 'next': {
				direction = 1;
				index++;
				break;
			}
			case 'go': {
				direction = parseInt(param) - index;
				index = parseInt(param);
				break;
			}
			case 'up': {
				direction = -1;
				index = parseInt(item.data('group-up')) || (index - 1);
				break;
			}
			case 'down': {
				direction = 1;
				index = parseInt(item.data('group-down')) || (index + 1);
				break;
			}
			case 'left': {
				direction = -1;
				index = parseInt(item.data('group-left')) || (index - 1);
				break;
			}
			case 'right': {
				direction = 1;
				index = parseInt(item.data('group-right')) || (index + 1);
				break;
			}
			default: return;
		}

		index = index % count;

		//children.removeClass('prev').removeClass('next');
		var deactived = children.filter('.active').removeClass('active').addClass('deactive');
		var actived = $(children.get(index)).removeClass('deactive').addClass('active');

		if (direction > 0) {
			deactived.removeClass('prev').addClass('next');
			actived.removeClass('prev').addClass('next');
		} else if (direction < 0) {
			deactived.removeClass('next').addClass('prev');
			actived.removeClass('next').addClass('prev');
		}
	};

	actions.jsonp = function () {

	};
})(window);

(function(namespace) {
	var jayune = namespace.jayune || (namespace.jayune = {});
	var utils = jayune.utils || (jayune.utils = {});

	jayune.addPlugin('focuslayer', {
		'init': function() {
			var _self = this;

			this.objects = [];

			$(document).on('mousemove', function(e) {
				var i, obj;
				var x = e.pageX / $(document).width();
				var y = e.pageY / $(document).height();

				for (i in _self.objects) {
					obj = _self.objects[i];

					$(obj.element).css({'left': -x * obj.delta + '%', 'top': -y * obj.delta + '%'});
				}
			});
		},
		'plug': function(element) {
			var params = utils.schemeStringToObject($(element).data('plugin-param'));
			var scale = parseFloat(params['scale']) || 1.05;
			var delta = (scale - 1) * 100;
			var obj = {
				element: element,
				scale: scale,
				delta: delta
			};
			this.objects.push(obj);

			$(obj.element).css({'width': scale * 100 + '%', 'height': scale * 100 + '%', 'left': -delta * 0.5 + '%', 'top': -delta * 0.5 + '%'});
		},
		'unplug': function(element) {
			this.objects = this.objects.filter(function(obj) {return obj.element != element;});
		}
	});
})(window);

(function(namespace) {
	$(document).ready(function() {
		var jayune = namespace.jayune || (namespace.jayune = {});
		var utils = jayune.utils || (jayune.utils = {});
		var status = jayune.status || (jayune.status = {});
		var actions = jayune.actions || (jayune.actions = {});
		var plugins = jayune.plugins || (jayune.plugins = {});

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
				utils.action(actions, element[0]);
			}
		};

		var __initPlugins__ = function() {
			$('[data-plugin]').each(function(index, element) {
				var name = $(element).data('plugin');

				if (!plugins[name]) return;

				if (!plugins[name].__initialized__) {
					plugins[name].init();
					plugins[name].__initialized__ = true;
				}

				plugins[name].plug(element);
			});
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

		__initPlugins__();
	});
})(window);