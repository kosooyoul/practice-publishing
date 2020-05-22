
var UICanvas = function(element){
	var _self = this;
	var _element = element;
	var _rectMode = _element.dataset.shape == "rect"? true: false;
	var _shapeCount = _element.dataset.shapecount? parseInt(_element.dataset.shapecount): 100;

	//Element 생성
	var _canvas = document.createElement("canvas");
	var _link = document.createElement("a");
	var _context = _canvas.getContext("2d");

	//Element 추가
	_element.appendChild(_canvas);
	_element.appendChild(_link);

	//속성 설정
	_canvas.width = _element.dataset.width? parseInt(_element.dataset.width): 200;
	_canvas.height = _element.dataset.height? parseInt(_element.dataset.height): 80;
	_canvas.draggable = false;
	
	//이벤트 설정
	var _mousedown1 = false;
	var _mousedown2 = false;
	var _mousedown3 = false;
	var _mousedown4 = false;
	var _mousedown5 = false;
	_canvas.addEventListener("mousedown", function(e){
        var x = e.clientX - e.target.getBoundingClientRect().left;
        var y = e.clientY - e.target.getBoundingClientRect().top;

		if(x > _canvas.width - 20 && y < 20){
			_mousedown1 = true;
		}else if(x > _canvas.width - 20 && y < 40){
			_mousedown2 = true;
		}else if(x < 20 && y < 20){
			_mousedown3 = true;
		}else if(x < 20 && y < 40){
			_mousedown4 = true;
		}else if(x > _canvas.width - 20 && y > _canvas.height - 20){
			_mousedown5 = true;
		}else{
			return;
		}
		drawUI();
	});

	_canvas.addEventListener("mouseup", function(e){
        var x = e.clientX - e.target.getBoundingClientRect().left;
        var y = e.clientY - e.target.getBoundingClientRect().top;

		if(_mousedown1 && x > _canvas.width - 20 && y < 20)_rectMode = false;
		else if(_mousedown2 && x > _canvas.width - 20 && y < 40)_rectMode = true;
		else if(_mousedown3 && x < 20 && y < 20)_shapeCount+=50;
		else if(_mousedown4 && x < 20 && y < 40){
			_shapeCount-=50;
			if(_shapeCount < 0) _shapeCount = 0;
		}else if(_mousedown5 && x > _canvas.width - 20 && y > _canvas.height - 20){
			//IE11 동작 안함
			_link.href = _canvas.toDataURL();
			_link.download = "sample.png";
			_link.click();
		}
		_mousedown1 = false;
		_mousedown2 = false;
		_mousedown3 = false;
		_mousedown4 = false;
		_mousedown5 = false;
	});

	this.setSize = function(w, h){
		_canvas.width = w;
		_canvas.height = h;
		drawUI();
	};

	//Drawing관련
	var _startTime = +new Date();
	var _interval = setInterval(drawUI, 1000 / 24);
	function drawUI(){
		var time = +new Date() - _startTime;
		var w = _canvas.width;
		var h = _canvas.height;

		_context.clearRect(0, 0, w, h);

		//배경
		for(var i = 0; i < _shapeCount; i++)drawRandomShape(i, time, w, h, _rectMode);
		
		//작은 버튼 배경1
		setFillColor(0, 0, 0, 0.3);
		if(_mousedown1)setFillColor(0.1, 0.3, 0.7, 0.25);
		_context.fillRect(w - 20, 0, 20, 20);
		//작은 버튼 배경2
		setFillColor(0.5, 0.0, 0.0, 0.3);
		if(_mousedown2)setFillColor(0.1, 0.3, 0.7, 0.25);
		_context.fillRect(w - 20, 20, 20, 20);
		//작은 버튼 배경3
		setFillColor(0.0, 0.0, 0.5, 0.3);
		if(_mousedown3)setFillColor(0.1, 0.3, 1.0, 0.25);
		_context.fillRect(0, 0, 20, 20);
		//작은 버튼 배경4
		setFillColor(0.3, 0.3, 0.0, 0.3);
		if(_mousedown4)setFillColor(0.3, 0.3, 0.7, 0.25);
		_context.fillRect(0, 20, 20, 20);
		//작은 버튼 배경5
		setFillColor(0.3, 0.3, 0.0, 0.3);
		if(_mousedown5)setFillColor(0.3, 0.3, 0.7, 0.25);
		_context.fillRect(w - 20, h - 20, 20, 20);

		//가운데 텍스트
		_context.fillStyle = "#000000";
		_context.textAlign = "left"
		_context.textBaseline = "middle"
		_context.font = "11px sans-serif"
		_context.fillStyle = "#000000";
		_context.fillText(_shapeCount, 25, 10);
		//작은 버튼 텍스트1
		_context.textAlign = "center"
		_context.textBaseline = "middle"
		_context.font = "10px sans-serif"
		_context.fillStyle = "#FFFFFF";
		_context.fillText("◇", (w - 20) + 20 / 2, 20 / 2 + (_mousedown1? 1: 0));
		//작은 버튼 텍스트2
		_context.fillText("□", (w - 20) + 20 / 2, 20 + 20 / 2 + (_mousedown2? 1: 0));
		//작은 버튼 텍스트3
		_context.fillText("+", 20 / 2, 20 / 2 + (_mousedown3? 1: 0));
		//작은 버튼 텍스트4
		_context.fillText("-", 20 / 2, 20 + 20 / 2 + (_mousedown4? 1: 0));
		//작은 버튼 텍스트5
		_context.fillText("▼", (w - 20) + 20 / 2, (h - 20) + 20 / 2 + (_mousedown5? 1: 0));

		//버튼 테두리
		_context.lineJoin = "bevel";
		_context.lineWidth = "1";
		setStrokeColor(0, 0, 0, 1);
		_context.strokeRect(0, 0, w, h);

		function drawRandomShape(seed, time, w, h, rect){
			var r = (seed * 23 + 100) % 20 + 10;
			var speedX = 1 / ((seed * 1009 + 50) / 3 % 20 + 5);
			var speedY = 1 / ((seed * 1109 + 50) / 3 % 20 + 5);
			var startX = (seed * 1013 + 6010) / 13 % w;
			var startY = (seed * 3097 + 5201) / 7 % h;
			var red = parseInt((seed * 333 + 5000) / 19) % 256 / 255;
			var green = parseInt((seed * 777 + 5000) / 19) % 256 / 255;
			var blue = parseInt((seed * 999 + 3000) / 31) % 256 / 255;

			var dx = (time * speedX);
			var dy = (time * speedY);
			var x = (startX + dx) % (w + r * 2) - r;
			var y = (startY + dy) % (h + r * 2) - r;

			setFillColor(red, green, blue, 0.2);
			if(rect)
				_context.fillRect(x, y, r, r);
			else{
				_context.beginPath();
				//Only Chrome
				//_context.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
				diamond(x, y, r);
				_context.fill();
			}
		}

		function setFillColor(r, g, b, a){
			//Only Chrome
			//_context.setFillColor(r, g, b, a);
			_context.fillStyle = rgbToHex(parseInt(r*255), parseInt(g*255), parseInt(b*255));
			_context.globalAlpha = a;
		}

		function setStrokeColor(r, g, b, a){
			//Only Chrome
			//_context.setStrokeColor(r, g, b, a);
			_context.strokeStyle = rgbToHex(parseInt(r*255), parseInt(g*255), parseInt(b*255));
			_context.globalAlpha = a;
		}

		function diamond(x, y, r){
			_context.moveTo(x-r, y);
			_context.lineTo(x, y-r);
			_context.lineTo(x+r, y);
			_context.lineTo(x, y+r);
			_context.lineTo(x-r, y);
		}

	}

	//util
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
};

//uicanvas태그인 Element는 자동으로 생성
window.addEventListener("load", function(){
	var elements = document.querySelectorAll("[data-view='uicanvas']");
	for(var i = 0; i < elements.length; i++)
		window[elements[i].id] = new UICanvas(elements[i]);
});
