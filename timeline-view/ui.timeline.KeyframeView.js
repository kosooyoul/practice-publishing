(function(){
	window.UI = window.UI? window.UI: {};
	UI.Timeline = UI.Timeline? UI.Timeline: {};

	UI.Timeline.KeyframeView = function(){
		var _self = this;
		var _element = make();
		var _button = _element.find(".selector");

		//[Private fields]
		//Status
		var _visible = false;
		//Events callback
		var _onClick = null;				//function(view)
		var _onShiftClick = null;			//function(view)
		var _onTimeChange = null;			//function(view, time)
		var _onMouseDown = null;			//function(view)
		var _onShiftMouseDown = null;		//function(view)
		var _onMouseUp = null;				//function(view)

		//[Public functions]
		this.getElement = function(){return _element;};
		//Values
		this.setTime = function(time){_element.find(".time").val(time);};
		this.getTime = function(){return Number(_element.find(".time").val());};
		this.setVisible = function(visible){
			_visible = visible;
			_button.css("opacity", visible? 1.0: 0.2);
		};
		this.getVisible = function(){return _visible;};
		this.setFocus = function(flag){
			if(flag){
				_button.css("background-color", "rgba(255,210,45,0.9)");
				_button.css("border", "solid 1px rgba(255,128,33,0.5)");
			}else{
				_button.css("background-color", "rgba(128,192,255,0.9)");
				_button.css("border", "solid 1px rgba(128,128,128,0.5)");
			}
		};
		//Events
		this.setOnClick = function(callback){_onClick = callback;};
		this.setOnShiftClick = function(callback){_onShiftClick = callback;};
		this.setOnTimeChange = function(callback){_onTimeChange = callback;};
		this.setOnMouseDown = function(callback){_onMouseDown = callback;};
		this.setOnShiftMouseDown = function(callback){_onShiftMouseDown = callback;};
		this.setOnMouseUp = function(callback){_onMouseUp = callback;};

		//[Make View]
		function make(){
			var keyFrameElement = $("<div>").attr("class", "keyframe");
			//var button = $("<button>").attr("class", "selector");
			var button = $("<div>").attr("class", "selector");
			var textbox = $("<input>").attr("class", "time");
			keyFrameElement.append(button);
			keyFrameElement.append(textbox);

			//Events
			button.click(onClick);
			textbox.change(onTimeChange);
			button.bind("mousedown", onMouseDown);
			button.bind("mouseup", onMouseUp);

			//CSS
			button.css("position", "absolute");
			button.css("width", "7px");
			button.css("margin-left", "-4px");
			button.css("top", "5px");
			button.css("height", "18px");
			button.css("background-color", "rgba(128,192,255,0.9)");
			button.css("border-radius", "5px");
			button.css("border", "solid 1px rgba(128,128,128,0.5)");
			button.css("cursor", "pointer");
			button.css("z-index", "3");
			//button.width(20);
			//button.height(20);
			textbox.css("position", "absolute");
			textbox.css("left", "8px");
			textbox.css("top", "2px");
			textbox.width(30);
			textbox.css("display", "none");

			//Event forwarding
			function onClick(e){
				if(e.shiftKey){
					(_onShiftClick instanceof Function) && _onShiftClick(_self);
				}else{
					(_onClick instanceof Function) && _onClick(_self);
				}
				return false;
			}
			function onTimeChange(e){
				var time = Number(e.target.value);
				(_onTimeChange instanceof Function) && _onTimeChange(_self, time);
			}
			function onMouseDown(e){
				if(e.shiftKey){
					(_onShiftMouseDown instanceof Function) && _onShiftMouseDown(_self);
				}else{
					(_onMouseDown instanceof Function) && _onMouseDown(_self);
				}
			}
			function onMouseUp(e){
				(_onMouseUp instanceof Function) && _onMouseUp(_self);
			}

			return keyFrameElement;
		}

	};//UI.Timeline.KeyframeView

})();//namespace UI
