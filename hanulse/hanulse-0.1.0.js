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
	var SIGHT_WIDTH = 300;
	var SIGHT_HEIGHT = 200;
	var FOG_SIZE = 120;
	var FOG_AMOUNT = 1 / (FOG_SIZE + 1);
	var FOG_UPDATING_TIME = 80;

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
	var getBooleanData = function($e, name, defaultValue) {
		return (getData($e, name) === true) || getData($e, name) == 'true' || defaultValue;
	};
	var getEnumData = function($e, name, arr, defaultValue) {
		var data = getData($e, name);
		return arr.includes(data)? data: defaultValue;
	};
	var loadScript = function(url) {
		return $.ajax({
			'url': url,
			'dataType': 'script',
			'async': false
		});
	};
	var preventDefault = function($evt) {
		$evt.preventDefault();
	};
	var getRandom = function(max) {
		return Math.random() * max;
	};
	var getRandomRGBA = function(fixed) {
		return getRGBA(
			(fixed.r != null)? fixed.r: getRandom(255),
			(fixed.g != null)? fixed.g: getRandom(255),
			(fixed.b != null)? fixed.b: getRandom(255),
			(fixed.a != null)? fixed.a: getRandom(1.0)
		);
	};
	var getRGBA = function(r, g, b, a) {
		return 'rgba(' + parseInt(r) + ', ' + parseInt(g) + ', ' + parseInt(b) + ', ' + a + ')';
	};
	var getCellLeft_V1 = function(x, y, d) {
		return (x - y) * CELL_WIDTH / 2;
	};
	var getCellTop_V1 = function(x, y, d) {
		return (y + x) * CELL_HEIGHT / 2 - (d * CELL_DEPTH);
	};
	var getCellLeft_V2 = function(x, y, d) {
		var offsetX = ((y % 2) == 0)? -CELL_WIDTH_HALF: 0;
		return x * CELL_WIDTH + offsetX;
	};
	var getCellTop_V2 = function(x, y, d) {
		return y * CELL_HEIGHT_HALF - (d * CELL_DEPTH);
	};
	var getFog = function(baseLeft, baseTop, left, top) {
		var fogX = Math.min(SIGHT_WIDTH - Math.abs(left - baseLeft) - FOG_SIZE, 0) * FOG_AMOUNT;
		var fogY = Math.min(SIGHT_HEIGHT - Math.abs(top - baseTop) - FOG_SIZE, 0) * FOG_AMOUNT;
		return Math.min(fogX, fogY);
	};

	// Private html
	var SVG_EFFECT_FLOAT = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<path class="hanulse-effect-float_ground hanulse_i1" data-tag="shape" d="m 34 0 l 34 17 l -34 17 l -34 -17 l 34 -17"/>',
		'	<path class="hanulse-effect-float_ground hanulse_i2" data-tag="shape" d="m 34 0 l 34 17 l -34 17 l -34 -17 l 34 -17"/>',
		'	<path class="hanulse-effect-float_ground hanulse_i3" data-tag="shape" d="m 34 0 l 34 17 l -34 17 l -34 -17 l 34 -17"/>',
		'</svg>'
	].join('\n');
	var SVG_EFFECT_BOX = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<defs>',
		'		<linearGradient id="hanulse-effect-box_gradient-center" x1="0%" y1="0%" x2="-10%" y2="100%">',
		'			<stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.0); stop-opacity: 1.0;"/>',
		'			<stop offset="100%" style="stop-color: rgba(255, 255, 255, 1.0); stop-opacity: 1.0;"/>',
		'		</linearGradient>',
		'	</defs>',
		'	<path class="hanulse-effect-box_center hanulse_i1" data-tag="shape" d="m 34 0 l 34 17 l 0 -31 l -34 -17 l 0 31"/>',
		'	<path class="hanulse-effect-box_center hanulse_i2" data-tag="shape" d="m 0 17 l 34 -17 l 0 -31 l -34 17 l 0 31"/>',
		'	<path class="hanulse-effect-box_center hanulse_i3" data-tag="shape" d="m 34 34 l 34 -17 l 0 -31 l -34 17 l 0 31"/>',
		'	<path class="hanulse-effect-box_center hanulse_i4" data-tag="shape" d="m 0 17 l 34 17 l 0 -31 l -34 -17 l 0 31"/>',
		'	<path class="hanulse-effect-box_center hanulse_i5" data-tag="shape" d="m 34 -31 l 34 17 l -34 17 l -34 -17 l 34 -17"/>',
		'</svg>'
	].join('\n');
	var SVG_EFFECT_FLASH = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<path class="hanulse-effect-flash_ground" data-tag="shape" d="m 34 0 l 34 17 l -34 17 l -34 -17 l 34 -17"/>',
		'</svg>'
	].join('\n');
	var SVG_EFFECT_CIRCLE = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<path class="hanulse-effect-circle_ground-white hanulse_i1" data-tag="shape" d="m 30 -2 l 8 4 l 0 -3 l -8 -4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_ground-white hanulse_i2" data-tag="shape" d="m -4 19 l 8 -4 l 0 -3 l -8 4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_ground-white hanulse_i3" data-tag="shape" d="m 66 18 l 8 -4 l 0 -3 l -8 4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_ground-white hanulse_i4" data-tag="shape" d="m 32 33 l 8 4 l 0 -3 l -8 -4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_ground-red hanulse_i1" data-tag="shape" d="m 30 -2 l 8 4 l 0 -3 l -8 -4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_ground-red hanulse_i2" data-tag="shape" d="m -4 19 l 8 -4 l 0 -3 l -8 4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_ground-red hanulse_i3" data-tag="shape" d="m 66 18 l 8 -4 l 0 -3 l -8 4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_ground-red hanulse_i4" data-tag="shape" d="m 32 33 l 8 4 l 0 -3 l -8 -4 l 0 3"/>',
		'</svg>'
	].join('\n');
	var SVG_EFFECT_CIRCLE_WALL_RIGHT = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<path class="hanulse-effect-circle_wall-right-white hanulse_i1" data-tag="shape" d="m 30 -30 l 8 4 l 0 -3 l -8 -4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_wall-right-white hanulse_i2" data-tag="shape" d="m 65 -12 l 3 1.5 l 0 -8 l -3 -1.5 l 0 8"/>',
		'	<path class="hanulse-effect-circle_wall-right-white hanulse_i3" data-tag="shape" d="m 64 15 l 8 4 l 0 -3 l -8 -4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_wall-right-white hanulse_i4" data-tag="shape" d="m 34 4 l 3 1.5 l 0 -8 l -3 -1.5 l 0 8"/>',
		'	<path class="hanulse-effect-circle_wall-right-red hanulse_i1" data-tag="shape" d="m 30 -30 l 8 4 l 0 -3 l -8 -4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_wall-right-red hanulse_i2" data-tag="shape" d="m 65 -12 l 3 1.5 l 0 -8 l -3 -1.5 l 0 8"/>',
		'	<path class="hanulse-effect-circle_wall-right-red hanulse_i3" data-tag="shape" d="m 64 15 l 8 4 l 0 -3 l -8 -4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_wall-right-red hanulse_i4" data-tag="shape" d="m 34 4 l 3 1.5 l 0 -8 l -3 -1.5 l 0 8"/>',
		'</svg>'
	].join('\n');
	var SVG_EFFECT_CIRCLE_WALL_LEFT = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<path class="hanulse-effect-circle_wall-left-white hanulse_i1" data-tag="shape" d="m -4 -9 l 8 -4 l 0 -3 l -8 4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_wall-left-white hanulse_i2" data-tag="shape" d="m 31 -25 l 3 -1.5 l 0 -8 l -3 1.5 l 0 8"/>',
		'	<path class="hanulse-effect-circle_wall-left-white hanulse_i3" data-tag="shape" d="m 30 2 l 8 -4 l 0 -3 l -8 4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_wall-left-white hanulse_i4" data-tag="shape" d="m 0 20 l 3 -1.5 l 0 -8 l -3 1.5 l 0 8"/>',
		'	<path class="hanulse-effect-circle_wall-left-red hanulse_i1" data-tag="shape" d="m -4 -9 l 8 -4 l 0 -3 l -8 4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_wall-left-red hanulse_i2" data-tag="shape" d="m 31 -25 l 3 -1.5 l 0 -8 l -3 1.5 l 0 8"/>',
		'	<path class="hanulse-effect-circle_wall-left-red hanulse_i3" data-tag="shape" d="m 30 2 l 8 -4 l 0 -3 l -8 4 l 0 3"/>',
		'	<path class="hanulse-effect-circle_wall-left-red hanulse_i4" data-tag="shape" d="m 0 20 l 3 -1.5 l 0 -8 l -3 1.5 l 0 8"/>',
		'</svg>'
	].join('\n');
	var SVG_EFFECT_WARP = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<defs>',
		'		<linearGradient id="hanulse-effect-warp_gradient-center" x1="0%" y1="0%" x2="-10%" y2="100%">',
		'			<stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.0); stop-opacity: 1.0;"/>',
		'			<stop offset="100%" style="stop-color: rgba(255, 255, 255, 1.0); stop-opacity: 1.0;"/>',
		'		</linearGradient>',
		'	</defs>',
		'	<path class="hanulse-effect-warp_large-band" data-tag="shape" d="m 34 -12 l 50 25 l 0 -40 l -50 -25 l 0 40"/>',
		'	<path class="hanulse-effect-warp_large-band" data-tag="shape" d="m -16 13 l 50 -25 l 0 -40 l -50 25 l 0 40"/>',
		'	<path class="hanulse-effect-warp_small-band hanulse_i2" data-tag="shape" d="m 34 -8 l 42 21 l 0 -10 l -42 -21 l 0 10"/>',
		'	<path class="hanulse-effect-warp_small-band hanulse_i2" data-tag="shape" d="m -8 13 l 42 -21 l 0 -10 l -42 21 l 0 10"/>',
		'	<path class="hanulse-effect-warp_small-band hanulse_i1" data-tag="shape" d="m 34 -8 l 42 21 l 0 -10 l -42 -21 l 0 10"/>',
		'	<path class="hanulse-effect-warp_small-band hanulse_i1" data-tag="shape" d="m -8 13 l 42 -21 l 0 -10 l -42 21 l 0 10"/>',
		'	<path class="hanulse-effect-warp_center" data-tag="shape" d="m 34 0 l 34 17 l 0 -100 l -34 -17 l 0 100"/>',
		'	<path class="hanulse-effect-warp_center" data-tag="shape" d="m 0 17 l 34 -17 l 0 -100 l -34 17 l 0 100"/>',
		'	<path class="hanulse-effect-warp_center" data-tag="shape" d="m 34 34 l 34 -17 l 0 -100 l -34 17 l 0 100"/>',
		'	<path class="hanulse-effect-warp_center" data-tag="shape" d="m 0 17 l 34 17 l 0 -100 l -34 -17 l 0 100"/>',
		'	<path class="hanulse-effect-warp_small-band hanulse_i1" data-tag="shape" d="m 34 34 l 42 -21 l 0 -10 l -42 21 l 0 10"/>',
		'	<path class="hanulse-effect-warp_small-band hanulse_i1" data-tag="shape" d="m -8 13 l 42 21 l 0 -10 l -42 -21 l 0 10"/>',
		'	<path class="hanulse-effect-warp_small-band hanulse_i2" data-tag="shape" d="m 34 34 l 42 -21 l 0 -10 l -42 21 l 0 10"/>',
		'	<path class="hanulse-effect-warp_small-band hanulse_i2" data-tag="shape" d="m -8 13 l 42 21 l 0 -10 l -42 -21 l 0 10"/>',
		'	<path class="hanulse-effect-warp_large-band" data-tag="shape" d="m 34 38 l 50 -25 l 0 -40 l -50 25 l 0 40"/>',
		'	<path class="hanulse-effect-warp_large-band" data-tag="shape" d="m -16 13 l 50 25 l 0 -40 l -50 -25 l 0 40"/>',
		'</svg>'
	].join('\n');
	var SVG_EFFECT_WARP_BIG = [
		'<svg viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<defs>',
		'		<linearGradient id="hanulse-effect-warp-big_gradient-center-white" x1="0%" y1="0%" x2="-10%" y2="100%">',
		'			<stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.0); stop-opacity: 1.0;"/>',
		'			<stop offset="50%" style="stop-color: rgba(200, 150, 150, 0.5); stop-opacity: 1.0;"/>',
		'			<stop offset="100%" style="stop-color: rgba(255, 255, 255, 1.0); stop-opacity: 1.0;"/>',
		'		</linearGradient>',
		'		<linearGradient id="hanulse-effect-warp-big_gradient-center-red" x1="0%" y1="0%" x2="-10%" y2="100%">',
		'			<stop offset="0%" style="stop-color: rgba(50, 80, 50, 0.0); stop-opacity: 1.0;"/>',
		'			<stop offset="50%" style="stop-color: rgba(240, 100, 100, 0.5); stop-opacity: 1.0;"/>',
		'			<stop offset="100%" style="stop-color: rgba(80, 120, 80, 1.0); stop-opacity: 1.0;"/>',
		'		</linearGradient>',
		'		<linearGradient id="hanulse-effect-warp-big_gradient-center-blue" x1="0%" y1="0%" x2="-10%" y2="100%">',
		'			<stop offset="0%" style="stop-color: rgba(200, 100, 255, 0.0); stop-opacity: 1.0;"/>',
		'			<stop offset="50%" style="stop-color: rgba(100, 180, 200, 0.5); stop-opacity: 1.0;"/>',
		'			<stop offset="100%" style="stop-color: rgba(100, 100, 80, 1.0); stop-opacity: 1.0;"/>',
		'		</linearGradient>',
		'		<linearGradient id="hanulse-effect-warp-big_gradient-center-yellow" x1="0%" y1="0%" x2="-10%" y2="100%">',
		'			<stop offset="0%" style="stop-color: rgba(120, 255, 255, 0.0); stop-opacity: 1.0;"/>',
		'			<stop offset="50%" style="stop-color: rgba(180, 180, 100, 0.5); stop-opacity: 1.0;"/>',
		'			<stop offset="100%" style="stop-color: rgba(80, 100, 120, 1.0); stop-opacity: 1.0;"/>',
		'		</linearGradient>',
		'	</defs>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i3" data-tag="shape" d="m 34 -20 l 66 33 l 0 -40 l -66 -33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i3" data-tag="shape" d="m -32 13 l 66 -33 l 0 -40 l -66 33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i2" data-tag="shape" d="m 34 -20 l 66 33 l 0 -40 l -66 -33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i2" data-tag="shape" d="m -32 13 l 66 -33 l 0 -40 l -66 33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i1" data-tag="shape" d="m 34 -20 l 66 33 l 0 -40 l -66 -33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i1" data-tag="shape" d="m -32 13 l 66 -33 l 0 -40 l -66 33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_large-band hanulse_i2" data-tag="shape" d="m 34 -12 l 50 25 l 0 -40 l -50 -25 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_large-band hanulse_i2" data-tag="shape" d="m -16 13 l 50 -25 l 0 -40 l -50 25 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_large-band hanulse_i1" data-tag="shape" d="m 34 -12 l 50 25 l 0 -40 l -50 -25 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_large-band hanulse_i1" data-tag="shape" d="m -16 13 l 50 -25 l 0 -40 l -50 25 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_small-band hanulse_i2" data-tag="shape" d="m 34 -8 l 42 21 l 0 -10 l -42 -21 l 0 10"/>',
		'	<path class="hanulse-effect-warp-big_small-band hanulse_i2" data-tag="shape" d="m -8 13 l 42 -21 l 0 -10 l -42 21 l 0 10"/>',
		'	<path class="hanulse-effect-warp-big_small-band hanulse_i1" data-tag="shape" d="m 34 -8 l 42 21 l 0 -10 l -42 -21 l 0 10"/>',
		'	<path class="hanulse-effect-warp-big_small-band hanulse_i1" data-tag="shape" d="m -8 13 l 42 -21 l 0 -10 l -42 21 l 0 10"/>',
		'	<path class="hanulse-effect-warp-big_center" data-tag="shape" d="m 34 0 l 34 17 l 0 -100 l -34 -17 l 0 100"/>',
		'	<path class="hanulse-effect-warp-big_center" data-tag="shape" d="m 0 17 l 34 -17 l 0 -100 l -34 17 l 0 100"/>',
		'	<path class="hanulse-effect-warp-big_center" data-tag="shape" d="m 34 34 l 34 -17 l 0 -100 l -34 17 l 0 100"/>',
		'	<path class="hanulse-effect-warp-big_center" data-tag="shape" d="m 0 17 l 34 17 l 0 -100 l -34 -17 l 0 100"/>',
		'	<path class="hanulse-effect-warp-big_small-band hanulse_i1" data-tag="shape" d="m 34 34 l 42 -21 l 0 -10 l -42 21 l 0 10"/>',
		'	<path class="hanulse-effect-warp-big_small-band hanulse_i1" data-tag="shape" d="m -8 13 l 42 21 l 0 -10 l -42 -21 l 0 10"/>',
		'	<path class="hanulse-effect-warp-big_small-band hanulse_i2" data-tag="shape" d="m 34 34 l 42 -21 l 0 -10 l -42 21 l 0 10"/>',
		'	<path class="hanulse-effect-warp-big_small-band hanulse_i2" data-tag="shape" d="m -8 13 l 42 21 l 0 -10 l -42 -21 l 0 10"/>',
		'	<path class="hanulse-effect-warp-big_large-band hanulse_i1" data-tag="shape" d="m 34 38 l 50 -25 l 0 -40 l -50 25 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_large-band hanulse_i1" data-tag="shape" d="m -16 13 l 50 25 l 0 -40 l -50 -25 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_large-band hanulse_i2" data-tag="shape" d="m 34 38 l 50 -25 l 0 -40 l -50 25 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_large-band hanulse_i2" data-tag="shape" d="m -16 13 l 50 25 l 0 -40 l -50 -25 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i1" data-tag="shape" d="m 34 46 l 66 -33 l 0 -40 l -66 33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i1" data-tag="shape" d="m -32 13 l 66 33 l 0 -40 l -66 -33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i2" data-tag="shape" d="m 34 46 l 66 -33 l 0 -40 l -66 33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i2" data-tag="shape" d="m -32 13 l 66 33 l 0 -40 l -66 -33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i3" data-tag="shape" d="m 34 46 l 66 -33 l 0 -40 l -66 33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_xlarge-band hanulse_i3" data-tag="shape" d="m -32 13 l 66 33 l 0 -40 l -66 -33 l 0 40"/>',
		'	<path class="hanulse-effect-warp-big_stick hanulse_i1" data-tag="shape" d="m 25 20 l 2 0 l 0 30 l -2 -0 l 0 -30"/>',
		'	<path class="hanulse-effect-warp-big_stick hanulse_i2" data-tag="shape" d="m 60 -10 l 2 0 l 0 30 l -2 -0 l 0 -30"/>',
		'	<path class="hanulse-effect-warp-big_stick hanulse_i3" data-tag="shape" d="m -10 10 l 2 0 l 0 20 l -2 -0 l 0 -20"/>',
		'	<path class="hanulse-effect-warp-big_stick hanulse_i4" data-tag="shape" d="m 80 0 l 2 0 l 0 20 l -2 -0 l 0 -20"/>',
		'	<path class="hanulse-effect-warp-big_stick hanulse_i5" data-tag="shape" d="m 20 5 l 2 0 l 0 10 l -2 -0 l 0 -10"/>',
		'	<path class="hanulse-effect-warp-big_stick hanulse_i6" data-tag="shape" d="m 55 15 l 2 0 l 0 10 l -2 -0 l 0 -10"/>',
		'	<path class="hanulse-effect-warp-big_stick hanulse_i7" data-tag="shape" d="m -20 -15 l 2 0 l 0 5 l -2 -0 l 0 -5"/>',
		'	<path class="hanulse-effect-warp-big_stick hanulse_i8" data-tag="shape" d="m 90 -10 l 2 0 l 0 5 l -2 -0 l 0 -5"/>',
		'</svg>'
	].join('\n');
	var SVG_GROUND = [
		'<svg class="hanulse-cell_shape" viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<a data-tag="link" href="javascript:void(0);" style="pointer-events: auto;">',
		'		<path class="hanulse-cell_shape-detail" data-tag="shape" d="m 34 0 l 34 17 l -34 17 l -34 -17 l 34 -17"/>',
		'	</a>',
		'</svg>'
	].join('\n');
	var SVG_WALL_LEFT = [
		'<svg class="hanulse-cell_shape" viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<a data-tag="link" href="javascript:void(0);" style="pointer-events: auto;">',
		'		<path class="hanulse-cell_shape-detail" data-tag="shape" d="m 0 17 l 34 -17 l 0 -31 l -34 17 l 0 31"/>',
		'	</a>',
		'</svg>'
	].join('\n');
	var SVG_WALL_RIGHT = [
		'<svg class="hanulse-cell_shape" viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<a data-tag="link" href="javascript:void(0);" style="pointer-events: auto;">',
		'		<path class="hanulse-cell_shape-detail" data-tag="shape" d="m 34 0 l 34 17 l 0 -31 l -34 -17 l 0 31"/>',
		'	</a>',
		'</svg>'
	].join('\n');
	var SVG_CLIFF_LEFT = [
		'<svg class="hanulse-cell_shape" viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<a data-tag="link" href="javascript:void(0);" style="pointer-events: auto;">',
		'		<path class="hanulse-cell_shape-detail" data-tag="shape" d="m 0 48 l 34 17 l 0 -31 l -34 -17 l 0 31"/>',
		'	</a>',
		'</svg>'
	].join('\n');
	var SVG_CLIFF_RIGHT = [
		'<svg class="hanulse-cell_shape" viewbox="0 0 68 34" style="position: absolute; overflow: visible; pointer-events: none;">',
		'	<a data-tag="link" href="javascript:void(0);" style="pointer-events: auto;">',
		'		<path class="hanulse-cell_shape-detail" data-tag="shape" d="m 34 65 l 34 -17 l 0 -31 l -34 17 l 0 31"/>',
		'	</a>',
		'</svg>'
	].join('\n');

	// Define class group
	hanulse.group = function($e) {
		// Set default
		this.$e = $e;
		$e.addClass('hanulse-group');

		// Get fields
		var fields = {};
		fields.name = getData($e, 'name');
		fields.offsetLeft = getNumberData($e, 'offset-left', 0);
		fields.offsetTop = getNumberData($e, 'offset-top', 0);
		fields.relocatable = getBooleanData($e, 'relocatable', false);

		// Register instance
		if (fields.name) {
			hanulse.group.instances[fields.name] = this;
		}

		// Private fields
		var childrenCell = [];
		var location = {'left': 0, 'top': 0};
		var $locationAnimatable = $(location);

		// Set element style
		$e.css('margin-left', fields.offsetLeft);
		$e.css('margin-top', fields.offsetTop);
		$e.css('left', '50%');
		$e.css('top', '50%');

		// Initialize functions
		this.addChildCell = function(cell) {
			childrenCell.push(cell);
		};

		this.updateLocation = function(left, top) {
			if (!fields.relocatable) return;

			var done = false;
			var updateLoop = function() {
				var time = +new Date();
				childrenCell.forEach(function(childCell) {
					childCell.updateFog(location.left, location.top);
				});
				console.log(+new Date() - time);
				if (done) return;

				setTimeout(updateLoop, FOG_UPDATING_TIME);
			};

			$locationAnimatable.stop().animate({'left': left, 'top': top}, {
				'duration': 400,
				'easing': 'swing',
				'start': function() {
					setTimeout(updateLoop, FOG_UPDATING_TIME);
				},
				'progress': function() {
					$e.css({'margin-left': -location.left + fields.offsetLeft, 'margin-top': -location.top + fields.offsetTop});
				},
				'done': function() {
					done = true;
				}
			});
		};
	};

	// Define static items of class menu
	hanulse.group.instances = {};
	hanulse.group.get = function(name) {
		return hanulse.group.instances[name];
	};
	hanulse.group.updateLocation = function($childCell, left, top) {
		var $group = $childCell.parents('.hanulse-group');
		var groupName = getData($group, 'name');
		var group = hanulse.group.get(groupName);

		group.updateLocation(left, top);
	};

	// Define class cell
	hanulse.cell = function($e) {
		// Set default
		this.$e = $e;
		$e.addClass('hanulse-cell');

		// Get fields
		var fields = {};
		fields.name = getData($e, 'name');
		fields.type = getEnumData($e, 'type', ['ground', 'wall-left', 'wall-right', 'cliff-left', 'cliff-right'], 'ground');
		fields.text = getData($e, 'text');
		fields.link = getData($e, 'link');
		fields.menu = getData($e, 'menu');
		fields.memo = getData($e, 'memo');
		fields.image = getData($e, 'image');
		fields.input = getData($e, 'input');
		fields.border = getData($e, 'border');
		fields.event = getData($e, 'event');
		fields.texture = getData($e, 'texture');
		fields.prop = getData($e, 'prop');
		fields.opacity = getNumberData($e, 'opacity', 1);
		fields.effect = getData($e, 'effect'); // none, simple, box, flash(todo), warp, warp-big(todo), fly(todo), bubble(todo), shine(todo)
		fields.x = getNumberData($e, 'x', 0);
		fields.y = getNumberData($e, 'y', 0);
		fields.d = getNumberData($e, 'd', 0);

		// Register instance
		if (fields.name) {
			hanulse.cell.instances[fields.name] = this;
		}
		hanulse.cell.register(this);

		// Private functions
		var updateFog = function($shape, baseLeft, baseTop, left, top) {
			var fog = getFog(baseLeft, baseTop, left, top);
			var opacity = fields.opacity + fog;
			if (opacity == 1) {
				$e.css('opacity', '');
				$e.show();
			} else if (opacity > 0) {
				$e.css('opacity', opacity);
				$e.show();
			} else {
				$e.hide();
			}
		}

		// Set element style
		var left = getCellLeft_V1(fields.x, fields.y, fields.d);
		var top = getCellTop_V1(fields.x, fields.y, fields.d);
		$e.css('left', left);
		$e.css('top', top);
		$e.css('width', CELL_WIDTH);
		$e.css('height', CELL_HEIGHT);

		// Create child elements
		var $shape = null;
		if (fields.type == 'ground') $shape = $(SVG_GROUND);
		else if (fields.type == 'wall-left') $shape = $(SVG_WALL_LEFT);
		else if (fields.type == 'wall-right') $shape = $(SVG_WALL_RIGHT);
		else if (fields.type == 'cliff-left') $shape = $(SVG_CLIFF_LEFT);
		else if (fields.type == 'cliff-right') $shape = $(SVG_CLIFF_RIGHT);
		else $shape = $(SVG_GROUND);
		if (fields.link) {
			$shape.find('[data-tag="link"]').attr({'href': fields.link, 'alt': crlfToSpace(fields.text)}).on("dragstart", preventDefault);
		} else {
			$shape.find('[data-tag="link"]').attr({'href': 'javascript:void(0)', 'alt': crlfToSpace(fields.text)}).on("dragstart click contextmenu", preventDefault);
		}
		$e.append($shape)

		// Accessories
		if (fields.border == 'none') {
			$shape.find('[data-tag="shape"]').css('stroke', 'none');
		}
		if (fields.event == 'none') {
			$shape.find('[data-tag="link"]').css('pointer-events', 'none');
			$shape.find('[data-tag="shape"]').css('pointer-events', 'none');
		}
		if (fields.texture) {
			$shape.find('[data-tag="shape"]').css('fill', 'url(#' + fields.texture + ')');
		}
		if (fields.prop) {
			var $prop = $('<div>').addClass('hanulse-prop').addClass('hanulse-prop_' + fields.prop);
			$e.append($prop);
		}
		var $effect = null;
		if (fields.effect == 'simple') {
			if (fields.type == 'ground') $effect = $(SVG_EFFECT_CIRCLE);
			else if (fields.type == 'wall-left') $effect = $(SVG_EFFECT_CIRCLE_WALL_LEFT);
			else if (fields.type == 'wall-right') $effect = $(SVG_EFFECT_CIRCLE_WALL_RIGHT);
			else $effect = $(SVG_EFFECT_CIRCLE);
		}
		else if (fields.effect == 'float') $effect = $(SVG_EFFECT_FLOAT);
		else if (fields.effect == 'box') $effect = $(SVG_EFFECT_BOX);
		else if (fields.effect == 'flash') {
			$effect = $(SVG_EFFECT_FLASH).hide();
			var refresh = function(waitTime) {
				$effect.hide();
				setTimeout(function() {
					$effect.find('[data-tag="shape"]').css('fill', getRandomRGBA({'a': 0.4}));
					$effect.show();
					setTimeout(function() {
						refresh();
					}, getRandom(10000));
				}, waitTime || 100);
			};
			refresh(getRandom(10000));
		}
		else if (fields.effect == 'circle') $effect = $(SVG_EFFECT_CIRCLE);
		else if (fields.effect == 'warp') $effect = $(SVG_EFFECT_WARP);
		else if (fields.effect == 'warp-big') $effect = $(SVG_EFFECT_WARP_BIG);
		if ($effect) $e.append($effect);
		if (fields.text) {
			var $textWrap = $('<div>').addClass('hanulse-cell_text-wrap').css({'left': CELL_WIDTH_HALF - 200 / 2, 'top': -CELL_DEPTH - 12, 'z-index': 1})
			var $text = $('<span>').addClass('hanulse-cell_text').text(crlfToSpace(fields.text))
			$textWrap.append($text)
			$e.append($textWrap)
		}

		// Set shape style
		if (fields.menu) $shape.css('cursor', 'pointer');
		if (fields.memo) $shape.css('cursor', 'pointer');
		if (fields.image) $shape.css('cursor', 'pointer');
		if (fields.input) $shape.css('cursor', 'pointer');

		// Default updating
		updateFog($shape, 0, 0, left, top);

		// Initialize functions
		this.updateFog = function(baseLeft, baseTop) {
			updateFog($shape, baseLeft, baseTop, left, top);
		};

		// Initialize events
		$shape.find('[data-tag="link"]').on('click', function() {
			hanulse.dialog.show(fields.menu, left + DEFAULT_VIEW_CENTER_X, top + DEFAULT_VIEW_CENTER_Y);
			hanulse.dialog.show(fields.memo, left + DEFAULT_VIEW_CENTER_X, top + DEFAULT_VIEW_CENTER_Y);
			hanulse.dialog.show(fields.image, left + DEFAULT_VIEW_CENTER_X, top + DEFAULT_VIEW_CENTER_Y);
			hanulse.dialog.show(fields.input, left + DEFAULT_VIEW_CENTER_X, top + DEFAULT_VIEW_CENTER_Y);
			
			hanulse.group.updateLocation($e, left, top);
		});
	};

	// Define static items of class menu
	hanulse.cell.instances = {};
	hanulse.cell.get = function(name) {
		return hanulse.cell.instances[name];
	};
	hanulse.cell.register = function(cell) {
		var $group = cell.$e.parents('.hanulse-group');
		var groupName = getData($group, 'name');
		var group = hanulse.group.get(groupName);

		group.addChildCell(cell);
	};

	// Define class dialog
	hanulse.dialog = function($e) {
		var _this = this;

		// Set default
		this.$e = $e;
		$e.addClass('hanulse-dialog');

		// Get fields
		var fields = {};
		fields.name = getData($e, 'name');
		fields.black = getEnumData($e, 'black', ['yes', 'no'], 'yes');

		// Register instance
		if (fields.name) {
			hanulse.dialog.instances[fields.name] = this;
		}

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
			// $e.css('display', 'block');
			$e.fadeIn(200)
		};

		this.hide = function() {
			// $e.css('display', 'none');
			$e.fadeOut(200)
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

		// Set default
		this.$e = $e;
		$e.addClass('hanulse-menu');

		// Inherit from class dialog
		hanulse.dialog.call(this, $e);

		// Create child elements
		var $list = $('<div>').addClass('hanulse-menu_list');
		$list.append($e.children('[data-class="hanulse.menu.item"]'));

		var $table = $('<table><tbody><tr><td align="center"></td></tr></tbody></table>').css({'width': '100%', 'height': '100%', 'pointer-events': 'none'});
		$table.find('td').append($list);
		$e.append($table);

		// Instance functions
		// var parentShow = this.show;
		// this.show = function(left, top) {
		// 	$list.css({'left': '50%', 'top': '50%', 'margin-left': -140, 'margin-top': -140});
		// 	parentShow.call(_this);
		// };
	};

	// Define class menu item
	hanulse.menu.item = function($e) {
		// Set default
		this.$e = $e;
		$e.addClass('hanulse-menu-item');

		// Get fields
		var fields = {};
		fields.text = getData($e, 'text');
		fields.status = getEnumData($e, 'status', ['ok', 'possible', 'working', 'impossible'], 'possible');
		fields.link = getData($e, 'link');

		// Set additional
		$e.attr({'href': fields.link, 'alt': crlfToSpace(fields.text)}).on("dragstart", preventDefault);

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

		// Set default
		this.$e = $e;
		$e.addClass('hanulse-memo');

		// Inherit from class dialog
		hanulse.dialog.call(this, $e);

		// Get fields
		var fields = {};
		fields.text = getData($e, 'text');

		// Create child elements
		var $box = $('<div>').addClass('hanulse-memo_box');
		var $text = $('<div>').addClass('hanulse-memo_text').html(crlfToBr(fields.text));
		$box.append($text);

		var $table = $('<table><tbody><tr><td align="center"></td></tr></tbody></table>').css({'width': '100%', 'height': '100%', 'pointer-events': 'none'});
		$table.find('td').append($box);
		$e.append($table);

		// Initialize events
		$box.on('click', function() {
			_this.hide();
		});

		// Instance functions
		// var parentShow = this.show;
		// this.show = function(left, top) {
		// 	$box.css({'left': '50%', 'top': '50%', 'margin-left': -140, 'margin-top': -140});
		// 	parentShow.call(_this);
		// };
	};

	// Define class image
	hanulse.image = function($e) {
		var _this = this;

		// Set default
		this.$e = $e;
		$e.addClass('hanulse-image');

		// Inherit from class dialog
		hanulse.dialog.call(this, $e);

		// Get fields
		var fields = {};
		fields.src = getData($e, 'src');

		// Create child elements
		var $box = $('<div>').addClass('hanulse-image_box').css('background-image', 'url("' + fields.src + '")');

		var $table = $('<table><tbody><tr><td align="center"></td></tr></tbody></table>').css({'width': '100%', 'height': '100%', 'pointer-events': 'none'});
		$table.find('td').append($box);
		$e.append($table);

		// Initialize events
		$box.on('click', function() {
			_this.hide();
		});

		// Instance functions
		// var parentShow = this.show;
		// this.show = function(left, top) {
		// 	$box.css({'left': '50%', 'top': '50%', 'margin-left': -200, 'margin-top': -150});
		// 	parentShow.call(_this);
		// };
	};

	// Define class input
	hanulse.input = function($e) {
		var _this = this;

		// Set default
		this.$e = $e;
		$e.addClass('hanulse-input');

		// Inherit from class dialog
		hanulse.dialog.call(this, $e);

		// Get fields
		var fields = {};
		fields.text = getData($e, 'text');
		fields.type = getData($e, 'type', ['text', 'password', 'number', 'date', 'color', 'month', 'week', 'time', 'datetime'], 'text');
		fields.submit = getData($e, 'submit');
		fields.callback = getData($e, 'callback');

		// Create child elements
		var $box = $('<div>').addClass('hanulse-input_box');
		var $text = $('<div>').addClass('hanulse-input_text').html(crlfToBr(fields.text));
		var $input = $('<input type="text">').addClass('hanulse-input_input').attr('type', fields.type);
		var $submit = $('<input type="button">').addClass('hanulse-input_submit').val(fields.submit || '확인');
		$box.append($text);
		$box.append($input);
		$box.append($submit);

		var $table = $('<table><tbody><tr><td align="center"></td></tr></tbody></table>').css({'width': '100%', 'height': '100%', 'pointer-events': 'none'});
		$table.find('td').append($box);
		$e.append($table);

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
			// $box.css({'left': '50%', 'top': '50%', 'margin-left': -140, 'margin-top': -140});

			parentShow.call(_this);

			$input.focus();
		};
	};

	hanulse.utils = {
		'hash': function(text) {
			if (window.$md5) return $md5(text);

			loadScript("http://www.ahyane.net/hanulse/libs/md5.js");

			return window.$md5(text);
		},
		'hueToRgb': function(p, q, t) {
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1 / 6) return p + (q - p) * 6 * t;
			if(t < 1 / 2) return q;
			if(t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		},
		'hslToRgb': function(h, s, l) {
			var r, g, b;

			if (s == 0) {
				r = g = b = l; // achromatic
			} else {
				var q = l < 0.5? l * (1 + s): l + s - l * s;
				var p = 2 * l - q;
				r = hanulse.utils.hueToRgb(p, q, h + 1 / 3);
				g = hanulse.utils.hueToRgb(p, q, h);
				b = hanulse.utils.hueToRgb(p, q, h - 1 / 3);
			}

			return {
				'r': Math.round(r * 255),
				'g': Math.round(g * 255),
				'b': Math.round(b * 255)
			}
		},
		'rgbToHsl': function(r, g, b) {
			r /= 255, g /= 255, b /= 255;
			var max = Math.max(r, g, b), min = Math.min(r, g, b);
			var h, s, l = (max + min) / 2;

			if (max == min) {
				h = s = 0; // achromatic
			} else {
				var d = max - min;
				s = l > 0.5? d / (2 - max - min): d / (max + min);
				switch (max) {
					case r: h = (g - b) / d + (g < b? 6: 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}
				h /= 6;
			}

			return {'h': h, 's': s, 'l': l};
		}
	};
})();

$(document).ready(function() {
	$('[data-class="hanulse.group"]').each(function(index, element) {
		// console.log("Create Hanulse Group")
		new $hanulse.group($(element));
	})

	$('[data-class="hanulse.cell"]').each(function(index, element) {
		// console.log("Create Hanulse Cell")
		new $hanulse.cell($(element));
	})

	$('[data-class="hanulse.menu"]').each(function(index, element) {
		// console.log("Create Hanulse Menu")
		new $hanulse.menu($(element));
	})

	$('[data-class="hanulse.menu.item"]').each(function(index, element) {
		// console.log("Create Hanulse Menu Item")
		new $hanulse.menu.item($(element));
	})

	$('[data-class="hanulse.memo"]').each(function(index, element) {
		// console.log("Create Hanulse Memo")
		new $hanulse.memo($(element));
	})

	$('[data-class="hanulse.image"]').each(function(index, element) {
		// console.log("Create Hanulse Image")
		new $hanulse.image($(element));
	})

	$('[data-class="hanulse.input"]').each(function(index, element) {
		// console.log("Create Hanulse Input")
		new $hanulse.input($(element));
	})
});