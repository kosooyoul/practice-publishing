(function(){
	window.UI = window.UI? window.UI: {};

	UI.Timeline.TimelineView = function(selector, options){
		options = options? options: _getDefaultOptions();
		var _self = this;
		var _element = make(selector);
		var _timeSelectBar = makeTimeSelectBar();

		//[Private Fields]
		var _dataSource = options.hierarchy;		//Instances hierarchy include time list
		var _selectTime = 0;
		/*
		var sampleDataSource = {
			hierarchy: [
			{
					text: "InstanceName1",
					customData: {...},
					timeList: [1,2,3,4,5,...],
					items: [
						{
							text: "InstanceName1-1",
							customData: {...},
							timeList: [1,2,3,4,5,...],
						},
						{
							text: "InstanceName1-2",
							customData: {...},
							timeList: [1,2,3,4,5,...],
						},...
					]
				},
				{
					text: "InstanceName2",
					customData: {...},
					timeList: [1,2,3,4,5,...],
					items: [

					]
				},...
			]
		};
		*/
		//Events callback
		var _onKeyframeSelect = null;
		var _onKeyframeUnselect = null;
		var _onKeyframeTimeChange = null;
		var _onInstanceClick = null;
		var _onSelectTimeChange = null;
		var _onScroll = null;
		//Event status
		var _dragStarted = false;
		var _selectedInstanceView = null;
		var _selectedKeyframeView = null;
		var _multiSelectList = {};
		var _instanceViewList = [];

		//[Public functions]
		this.getElement = function(){return _element;};
		this.selectInstance = function(index){
			index = isNaN(index)? 0: index;
			//_element.find(".instance")[index].click();

			var view = _instanceViewList[index];
			
			//키프레임 선택 해제
			if(_selectedKeyframeView){
				(_onKeyframeUnselect instanceof Function) && _onKeyframeUnselect();
				_selectedKeyframeView.setFocus(false);
				_selectedKeyframeView = null;
			}

			//선택된 인스턴스 재설정
			_selectedInstanceView && _selectedInstanceView.setFocus(false);
			_selectedInstanceView = view;
			view.setFocus(true);
		};
		this.getSelectedInstanceView = function(){return _selectedInstanceView;};
		this.getSelectedKeyframeView = function(){return _selectedKeyframeView;};
		this.addKeyframeView = function(time){
			if(!_selectedInstanceView)return;
			_selectedInstanceView.addKeyframeView(time);
		};
		this.selectKeyframeView = function(time){
			if(!_selectedInstanceView)return;
			var view = _selectedInstanceView.getKeyframeViewAtTime(time);
			var index = _selectedInstanceView.getKeyframeViewIndexAtTime(time);

			//키프레임 선택 해제
			if(view){
				//선택된 키프레임 재설정
				(_onKeyframeSelect instanceof Function) && _onKeyframeSelect(view, index, time);
				_selectedKeyframeView && _selectedKeyframeView.setFocus(false);
				_selectedKeyframeView = view;
				view.setFocus(true);
			}else if(_selectedKeyframeView){
				(_onKeyframeUnselect instanceof Function) && _onKeyframeUnselect();
				_selectedKeyframeView.setFocus(false);
				_selectedKeyframeView = null;
			}
		};
		this.unselectKeyframeView = function(){
			if(!_selectedInstanceView)return;
			if(_selectedKeyframeView){
				(_onKeyframeUnselect instanceof Function) && _onKeyframeUnselect();
				_selectedKeyframeView.setFocus(false);
				_selectedKeyframeView = null;
			}
		};
		this.removeKeyframeView = function(time){
			if(!_selectedInstanceView)return;
			var view = _selectedInstanceView.getKeyframeViewAtTime(time);
			var isSelectedView = (view == _selectedKeyframeView);
			_selectedInstanceView.removeKeyframeViewAtTime(time);

			if(isSelectedView && _selectedKeyframeView){
				(_onKeyframeUnselect instanceof Function) && _onKeyframeUnselect();
				_selectedKeyframeView.setFocus(false);
				_selectedKeyframeView = null;
			}
		};
		//Set/Get Content
		this.setDataSource = function(dataSource){
			_dataSource = dataSource;
			_refresh();
		};
		this.getDataSource = function(){return _dataSource;};
		this.setTime = function(time){
			_selectTime = parseInt(time);
			_timeSelectBar.css("left", time * 5);
		};
		this.getTime = function(){return _selectTime;};
		this.setScrollTop = function(p){_element.parent().scrollTop(p);};
		this.getScrollTop = function(){return _element.parent().scrollTop();};
		this.setScrollLeft = function(p){_element.parent().scrollLeft(p);};
		this.getScrollLeft = function(){return _element.parent().scrollLeft();};
		this.moveScrollSelectTime = function(){
										this.setScrollTop(_selectedInstanceView.getElement().offset().top - 586 - 90 + this.getScrollTop());
										this.setScrollLeft((_selectTime * 5) - 280);
									};

		//Set event callback
		this.setOnKeyframeSelect = function(callback){_onKeyframeSelect = callback;};
		this.setOnKeyframeUnselect = function(callback){_onKeyframeUnselect = callback;};
		this.setOnKeyframeTimeChange = function(callback){_onKeyframeTimeChange = callback;};
		this.setOnInstanceClick = function(callback){_onInstanceClick = callback;};
		this.setOnSelectTimeChange = function(callback){_onSelectTimeChange = callback;};
		this.setOnScroll = function(callback){_onScroll = callback;};

		//[Init]
		_refresh();

		//Make view
		function make(selector){
			var element = $(selector);
			var wrapper = element.parent();

			//Events
			element.bind("mousedown", onMouseDown);
			element.bind("mousemove", onMouseMove);
			element.bind("mouseup", onMouseUp);
			element.bind("selectstart", function(e){return false;});
			wrapper.bind("scroll", onScroll);
			wrapper.bind("selectstart", function(e){return false;});

			//CSS
			element.css("position", "relative");
			element.css("border-right", "solid 1px rgb(174, 171, 158)");

			return element;
		}

		function makeTimeSelectBar(){
			var timeSelectBar = $("<div class='time-select-bar'></div>");
			_element.append(timeSelectBar);

			//Event
			timeSelectBar.bind("click", function(e){return false;});

			//CSS
			timeSelectBar.css("width", "1px");
			timeSelectBar.css("height", "100%");
			timeSelectBar.css("left", "0px");
			timeSelectBar.css("top", "0px");
			timeSelectBar.css("background-color", "red");
			timeSelectBar.css("position", "absolute");
			timeSelectBar.css("z-index", "1");

			return timeSelectBar;
		}

		//[Private functions]
		function _refresh(){
			var timelineKeyframeList = _element;
			timelineKeyframeList.children().remove();//임시: 모두 삭제

			//리스트 다시 만들기
			_clearView();
			var instanceList = _makeInstanceList(_dataSource, 0);
			_element.append(instanceList);

			_element.append(_timeSelectBar);
			_self.setTime(0);

			//Status 초기화
			_selectedInstanceView = null;
			_selectedKeyframeView = null;
		}

		//[Private internal functions]
		//Make elements
		function _makeInstanceList(hierarchy, depth){
			var instanceList = _makeInstanceGroup();

			var length = hierarchy.length;
			for(var i = 0; i < length; i++){
				var child = hierarchy[i];
				var timeList = child.timeList;
				var items = child.items;

				if(items && items.length > 0){
					var childInstanceGroup = _makeInstanceGroup();

					var instanceElement = _makeInstanceElement(timeList, child.customData);
					childInstanceGroup.append(instanceElement);

					var childInstanceList = _makeInstanceList(child.items, depth + 1);
					childInstanceGroup.append(childInstanceList);

					instanceList.append(childInstanceGroup);
				}else{							
					var instanceElement = _makeInstanceElement(timeList, child.customData);
					instanceList.append(instanceElement);
				}

			}

			return instanceList;
		}
		function _makeInstanceGroup(){
			var groupElement = $("<div class='group'></div>");
			return groupElement;
		}
		function _makeInstanceElement(timeList, customData){
			var view = new UI.Timeline.InstanceView(timeList);
			_addView(view);

			view.setCustomData(customData);
			
			//Events
			view.setOnKeyframeSelect(onKeyframeSelect);
			view.setOnKeyframeShiftSelect(onKeyframeShiftSelect);
			view.setOnKeyframeTimeChange(_onKeyframeTimeChange);
			view.setOnClick(onInstanceClick);

			return view.getElement();
		}
		function _addView(view){
			_instanceViewList.push(view);
		}
		function _clearView(){
			_instanceViewList = [];
		}

		//Events
		function onKeyframeSelect(view, index, time){
			if(_onKeyframeSelect instanceof Function){
				if(!_onKeyframeSelect(view, index, time)){
					return;
				}
			}
			
			//키프레임 선택 해제, 재설정
			_selectedKeyframeView && _selectedKeyframeView.setFocus(false);
			_selectedKeyframeView = view;
			_dragStarted = true;

			view.setFocus(true);
		}
		function onKeyframeShiftSelect(view, index, time){
			if(_onKeyframeSelect instanceof Function){
				if(!_onKeyframeSelect(view, index, time)){
					return;
				}
			}
			
			//키프레임 선택 해제, 재설정
			_selectedKeyframeView && _selectedKeyframeView.setFocus(false);
			_selectedKeyframeView = view;
			_dragStarted = true;

			view.setFocus(true);
		}
		function onKeyframeTimeChange(view, index, time){
			(_onKeyframeTimeChange instanceof Function) && _onKeyframeTimeChange(view, index, time);
		}
		function onInstanceClick(view){
			//키프레임 선택 해제
			if(_selectedKeyframeView){
				(_onKeyframeUnselect instanceof Function) && _onKeyframeUnselect();
				_selectedKeyframeView.setFocus(false);
				_selectedKeyframeView = null;
			}

			//인스턴스 선택
			var customData = view.getCustomData();
			var index = _element.find(".instance").index(view.getElement());
			(_onInstanceClick instanceof Function) && _onInstanceClick(view, index, customData);

			//선택된 인스턴스 재설정
			_selectedInstanceView && _selectedInstanceView.setFocus(false);
			_selectedInstanceView = view;
			view.setFocus(true);
		}
		function onScroll(e){
			var scrollLeft = e.target.scrollLeft;
			var scrollTop = e.target.scrollTop;

			(_onScroll instanceof Function) && _onScroll(scrollLeft, scrollTop);
		}
		function onMouseDown(e){
			//왼쪽버튼만 허용
			if(e.button != 0) return;

			var offset = (e.clientX - _element.offset().left);
			var time = Math.round(offset / 5);
			if(_selectTime != time){
				_selectTime = time;
				_timeSelectBar.css("left", time * 5);
				(_onSelectTimeChange instanceof Function) && _onSelectTimeChange(time);
			}
		}
		function onMouseMove(e){
			if(e.which == 1){
				var offset = (e.clientX - _element.offset().left);
				var time = Math.round(offset / 5);
				if(_selectTime != time){
					_selectTime = time;
					_timeSelectBar.css("left", time * 5);
					(_onSelectTimeChange instanceof Function) && _onSelectTimeChange(time);
				}
			}else{
				_dragStarted = false;
			}
			//키프레임 드래그
			if(e.which == 1 && _dragStarted && _selectedKeyframeView){
				var offset = (e.clientX - _element.offset().left);
				var time = Math.round(offset / 5);
				if(_selectedKeyframeView.getTime() != time){
					_selectedInstanceView.changeTime(_selectedKeyframeView, time);
				}
			}
		}
		function onMouseUp(e){
			_dragStarted = false;
		}

		function _getDefaultOptions(){
			var options = {
				data: []
			};
			return options;
		}

	};//UI.Timeline.TimelineView

})();//namespace UI
