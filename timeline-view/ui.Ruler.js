/*
	namespace UI
*/
(function(){
	window.UI = window.UI? window.UI: {};

	UI.Ruler = function(selector){
		//[Constants]
		var MARKING_GAP = 5;

		var MARKING_SMALL = 1;
		var MARKING_NORMAL = 5;
		var MARKING_BIG = 10;

		var VALUE_TEXT_MARKING = 10;
		var LOOPING_MARKING = 10;

		var DISPLAY_VALUE_SCALE = 0.1;

		var _self = this;
		var _element = $(selector).addClass("ui-ruler");
		var _markingGroup = _makeMarkingGroup(_element);
		var _valueTextGroup = _makeValueTextGroup(_element);
		var _selectBar = _makeSelectBar();
		var _eventListener = _makeEventListener();
		_markingGroup.append(_valueTextGroup);
		_markingGroup.append(_selectBar);
		_element.append(_markingGroup);
		_element.append(_eventListener);

		//[Private Fields]
		var _value = 0;
		var _selectedValue = 0;
		//Event callback
		var _onSelect = null;
		var _onScroll = null;

		//[Public Functions]
		//Set/Get contents
		this.getScroll = function(){return _value};
		this.setScroll = function(value){
			_value = value;

			var offset = (value % LOOPING_MARKING) * MARKING_GAP;
			_markingGroup.css("margin-left", -offset);
			_updateValueText();
			_updateSelectBar();
		};
		this.getSelect = function(){return _selectedValue;};
		this.setSelect = function(value){
			_selectedValue = value;

			_updateSelectBar();
		};
		this.getElement = function(){return _element;};
		//Set event callback
		this.setOnSelect = function(callback){_onSelect = callback;};
		this.setOnScroll = function(callback){_onScroll = callback;};
		
		//[Private Functions]
		function _makeMarkingGroup(element){
			var markingGroup = $("<div class='marking-group'></div>");

			var width = element.width();
			var markingCount = parseInt(width / MARKING_GAP) + 1 + LOOPING_MARKING;
			for(var i = 0; i < markingCount; i++){
				var marking = $("<div></div>");

				if((i % MARKING_BIG) == 0) marking.attr("class", "marking big");
				else if((i % MARKING_NORMAL) == 0) marking.attr("class", "marking normal");
				else marking.attr("class", "marking");
				
				marking.css("left", i * MARKING_GAP);

				markingGroup.append(marking);
			}

			return markingGroup;
		}

		function _makeValueTextGroup(element){
			var valueTextGroup = $("<div class='valuetext-group'></div>");

			var width = element.width();
			var valueTextCount = parseInt(width / MARKING_GAP / VALUE_TEXT_MARKING + LOOPING_MARKING) + 1;
			for(var i = 0; i < valueTextCount; i++){
				var valueText = $("<div></div>");
				valueText.attr("class", "valuetext");
				valueText.css("left", i * MARKING_GAP * VALUE_TEXT_MARKING);
				valueText.text(i * VALUE_TEXT_MARKING * DISPLAY_VALUE_SCALE);

				valueTextGroup.append(valueText);
			}

			return valueTextGroup;
		}

		function _makeSelectBar(){
			var selectBar = $("<div class='selectbar'></div>");
			
			return selectBar;
		}

		function _makeEventListener(){
			var element = $("<div></div>");

			//CSS
			//element.css("background-color", "yellow");//css debug
			element.css("position", "absolute");
			element.css("opacity", "0.5");
			element.css("width", "100%");
			element.css("height", "100%");
			element.css("left", "0");
			element.css("top", "0");

			//Events
			element.bind("mousedown", onMouseDown);
			element.bind("mousemove", onMouseMove);

			function onMouseDown(e){
				var selectValue = ((e.offsetX / 5) + _value);
				selectValue = (selectValue < 0)? 0: selectValue;
				_self.setSelect(selectValue);
				(_onSelect instanceof Function) && _onSelect(selectValue);
			}
			function onMouseMove(e){
				if(e.which == 1){
					var selectValue = ((e.offsetX / 5) + _value);
					selectValue = (selectValue < 0)? 0: selectValue;
					_self.setSelect(selectValue);
					(_onSelect instanceof Function) && _onSelect(selectValue);
				}
			}

			return element;
		}

		function _updateValueText(){
			var firstValue = parseInt(_value / LOOPING_MARKING) * LOOPING_MARKING;
			var valueTexts = _element.find(".valuetext-group .valuetext");
			var valueTextCount = valueTexts.length;
			for(var i = 0; i < valueTextCount; i++){
				var displayValue = i * VALUE_TEXT_MARKING + firstValue;
				$(valueTexts[i]).text(displayValue * DISPLAY_VALUE_SCALE);
			}
		}

		function _updateSelectBar(){
			var firstValue = parseInt(_value / LOOPING_MARKING) * LOOPING_MARKING;
			var offset = (_selectedValue - firstValue) * MARKING_GAP;
			_selectBar.css("left", offset);
		}

	};//UI.Ruler

})();//namespace UI
