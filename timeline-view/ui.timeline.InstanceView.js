
(function(){
	window.UI = window.UI? window.UI: {};
	UI.Timeline = UI.Timeline? UI.Timeline: {};

	UI.Timeline.InstanceView = function(keyframeTimes){
		var _self = this;
		var _element = make();

		//[Private fields]
		var _keyframeViewList = initKeyframs();
		var _timeList = [].concat(keyframeTimes);
		var _customData = null;
		//Events callback
		var _onKeyframeSelect = null;		//function(view, index, time)
		var _onKeyframeShiftSelect = null;	//function(view, index, time)
		var _onKeyframeTimeChange = null;	//function(view, index, time)
		var _onClick = null;				//function(view)
		var _onShiftClick = null;			//function(view)

		//[Public functions]
		this.getElement = function(){return _element;};
		//this.getKeyframeViewList = function(){return _keyframeViewList;};
		this.addKeyframeView = function(time){
			//Create
			var keyframeView = new UI.Timeline.KeyframeView();
			keyframeView.setTime(time);
			//keyframeView.setOnClick(onKeyframeSelect);
			keyframeView.setOnTimeChange(onKeyframeTimeChange);
			keyframeView.setOnMouseDown(onKeyframeMouseDown);

			//Add Element
			var tableRow = _element.find(".keyframes tr")[0];
			var cell = tableRow.insertCell(tableRow.cells.length);
			cell.appendChild(keyframeView.getElement()[0]);
			
			//Data
			_keyframeViewList.push(keyframeView);
			_timeList.push(time);
			_sortInternalData();

			//Update Elements
			_updateViewElements(_keyframeViewList);
		};
		this.getKeyframeViewAtTime = function(time){
			var index = _timeList.indexOf(time);
			return _keyframeViewList[index];
		};
		this.getKeyframeViewIndexAtTime = function(time){
			var index = _timeList.indexOf(time);
			return index;
		};
		this.removeKeyframeViewAtTime = function(time){
			var index = _timeList.indexOf(time);
			var view = _keyframeViewList[index];
			if(view){
				//Element
				var element = view.getElement();
				element.remove();

				//Data
				_keyframeViewList.splice(index, 1);
				_timeList.splice(index, 1);
			}
		};
		//Set/Get Contents
		this.setCustomData = function(data){_customData = data;};
		this.getCustomData = function(){return _customData;};
		this.setFocus = function(flag){
			if(flag){
				_element.css("background-color", "rgba(200,200,200,0.3)");
			}else{
				_element.css("background-color", "initial");
			}
		};
		this.changeTime = function(view, time){onKeyframeTimeChange(view, time);};

		//Events
		this.setOnKeyframeSelect = function(callback){_onKeyframeSelect = callback;};
		this.setOnKeyframeShiftSelect = function(callback){_onKeyframeShiftSelect = callback;};
		this.setOnKeyframeTimeChange = function(callback){_onKeyframeTimeChange = callback;};
		this.setOnClick = function(callback){_onClick = callback;};
		this.setOnShiftClick = function(callback){_onShiftClick = callback;};

		//[Make View]
		function make(){
			var instanceElement = $("<div>").attr("class", "instance");
			var keyframeTable = $('<table>').attr("class", "keyframes");
			var tableRow = keyframeTable[0].insertRow();

			instanceElement.append(keyframeTable);

			//Events
			instanceElement.click(onClick);

			//CSS
			instanceElement.css("position", "relative");
			instanceElement.css("background-color", "initial");
			instanceElement.css("z-index", "2");
			instanceElement.css("height", "29px");								//임시
			instanceElement.css("border-bottom", "solid 1px #AEAB9E");			//임시

			return instanceElement;
		}
		function initKeyframs(){
			var tableRow = _element.find(".keyframes tr")[0];
			var keyframeCount = keyframeTimes.length;
			var viewList = [];

			for(var i = 0; i < keyframeCount; i++){
				//Create
				var keyframeView = new UI.Timeline.KeyframeView();
				keyframeView.setTime(keyframeTimes[i]);
				//keyframeView.setOnClick(onKeyframeSelect);
				keyframeView.setOnTimeChange(onKeyframeTimeChange);
				keyframeView.setOnMouseDown(onKeyframeMouseDown);
				keyframeView.setOnShiftMouseDown(onKeyframeShiftMouseDown);

				//Add to List
				viewList.push(keyframeView);

				//Element
				var cell = tableRow.insertCell(tableRow.cells.length);
				cell.appendChild(keyframeView.getElement()[0]);
			}

			//임시
			_updateViewElements(viewList);

			return viewList;
		}

		//[Private functions]
		//Event forwarding
		/*
		function onKeyframeSelect(view){
			//먼저 인스턴스 선택
			(_onClick instanceof Function) && _onClick(_self);

			//그리고 키프레임 선택
			var index = _keyframeViewList.indexOf(view);
			var time = view.getTime();
			(_onKeyframeSelect instanceof Function) && _onKeyframeSelect(view, index, time);
		}
		function onKeyframeShiftSelect(view){
			//먼저 인스턴스 선택
			(_onClick instanceof Function) && _onClick(_self);

			//그리고 키프레임 선택
			var index = _keyframeViewList.indexOf(view);
			var time = view.getTime();
			(_onKeyframeShiftSelect instanceof Function) && _onKeyframeShiftSelect(view, index, time);
		}
		*/
		function onKeyframeTimeChange(view, time){
			var index = _keyframeViewList.indexOf(view);

			//값 체크
			if(isNaN(time) || time < 0){
				view.setTime(_timeList[index]);
				return;
			}
			//소수점 처리
			time = Math.floor(time);

			//이벤트 전달 - 키프레임뷰, 키프레임 인덱스, 입력 시간
			if(_onKeyframeTimeChange instanceof Function){
				if(!_onKeyframeTimeChange(view, index, time)){
					//처리하지 않음
					view.setTime(_timeList[index]);
					return;
				}
			}

			_timeList[index] = time;
			_sortInternalData();

			//임시
			_updateViewElements(_keyframeViewList);
		}
		function onClick(e){
			//인스턴스 선택
			if(e.shiftKey){
				(_onShiftClick instanceof Function) && _onShiftClick(_self);
			}else{
				(_onClick instanceof Function) && _onClick(_self);
			}
		}

		function onKeyframeMouseDown(view){
			//먼저 인스턴스 선택
			(_onClick instanceof Function) && _onClick(_self);

			//그리고 키프레임 선택
			var index = _keyframeViewList.indexOf(view);
			var time = view.getTime();
			(_onKeyframeSelect instanceof Function) && _onKeyframeSelect(view, index, time);
		}
		function onKeyframeShiftMouseDown(view){
			//먼저 인스턴스 선택
			(_onShiftClick instanceof Function) && _onShiftClick(_self);

			//그리고 키프레임 선택
			var index = _keyframeViewList.indexOf(view);
			var time = view.getTime();
			(_onKeyframeShiftSelect instanceof Function) && _onKeyframeShiftSelect(view, index, time);
		}

		//[Private functions]
		function _getIndexAtTime(){
			/*
			var newIndex = 0;
			for(var i = _timeList.length - 1; i >= 0; i--){
				if(_timeList[i] < time){
					return newIndex = (i < index)? i + 1: i;
					break;
				}
			}
			*/
		}
		function _sortInternalData(){
			//뷰 내부 적용
			//재정렬들
			_keyframeViewList.sort(function(a,b){return a.getTime()-b.getTime();});
			_timeList.sort(function(a,b){return a - b;});

			//for(var i = 0; i < _timeList.length; i++)console.log(_keyframeViewList[i].getTime() + ", " + _timeList[i]);
		}
		//임시
		function _updateViewElements(viewList){
			var length = viewList.length;
			var lastTime = 0;
			for(var i = 0; i < length; i++){
				var view = viewList[i];
				var element = view.getElement();
				var time = view.getTime();
				element.css("position", "absolute");
				element.css("left", time * 5);
				element.css("top", 0);
				lastTime = time;
			}
			_element.css("min-width", lastTime * 5 + 1000);
		}

	};//UI.Timeline.InstanceView

})();//namespace UI
