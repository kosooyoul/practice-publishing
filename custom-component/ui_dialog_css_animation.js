
var UIDialog = function(element){
	var _self = this;
	var _element = element;
	var _onanimationend;

	//Element 생성
	var _titlebar = document.createElement("div");
	var _contentbox = document.createElement("div");
	var _bottomlayout = document.createElement("center");
	var _okbutton = document.createElement("div");
 
	//속성 설정
	if(element.dataset.title)
		_titlebar.textContent = element.dataset.title;
	_okbutton.textContent = "확인";

	//Element 노드 변경
	var childCount = _element.childNodes.length;
	for(var i = 0; i < childCount; i++)
		_contentbox.appendChild(_element.firstChild);

	//Element 추가
	_element.appendChild(_titlebar);
	_element.appendChild(_contentbox);
	_element.appendChild(_bottomlayout);
	_bottomlayout.appendChild(_okbutton);

	//CSS설정
	_element.classList.add("uidialog-dialog");
	_titlebar.classList.add("uidialog-titlebar");
	_contentbox.classList.add("uidialog-contentbox");
	_okbutton.classList.add("uidialog-okbutton");
	
	//이벤트 설정
	_element.addEventListener("webkitAnimationEnd", onAnimationEnd);
	_element.addEventListener("animationend", onAnimationEnd);

	var _onOKClickListener;
	try{
		_onOKClickListener = new Function(element.dataset.onokclick);
	}catch(err){
		console.log(err);
	}

	_titlebar.addEventListener("mousedown", function(e){
        var x = e.clientX - e.target.getBoundingClientRect().left;
        var y = e.clientY - e.target.getBoundingClientRect().top;

		var ox = x + _element.clientLeft;
		var oy = y + _element.clientTop;

		document.onmousemove = function(e){
			_element.style.left = (e.pageX - ox) + "px";
			_element.style.top = (e.pageY - oy) + "px";
		};
		document.onmouseup = function(e){
			document.onmousemove = null;
			document.onmouseup = null;
		}
	});

	_okbutton.addEventListener("click", function(e){
		if(_onOKClickListener)_onOKClickListener();
		_self.hide();
	});

	//컴포넌트 API
	this.setTitle = function(title){
		_titlebar.textContent = title;
	};

	this.setMessage = function(message){
		_contentbox.textContent = message;
	};

	this.setOnOKClickListener = function(callback){
		_onOKClickListener = callback;
	};

	this.show = function(x, y){
		_onanimationend = function(e){
			console.log("show");
		}

		_element.classList.remove("uidialog-hide");
		_element.classList.add("uidialog-show");
	};

	this.hide = function(){
		_onanimationend = function(e){
			console.log("hide");
		}

		_element.classList.remove("uidialog-show");
		_element.classList.add("uidialog-hide");

	};

	function onAnimationEnd(e){
		if(_onanimationend)
			_onanimationend(e);
		_onanimationend = null;
	}

};

//uidialog view인 Element는 자동으로 생성
window.addEventListener("load", function(){
	var elements = document.querySelectorAll("[data-view='uidialog']");
	for(var i = 0; i < elements.length; i++)
		window[elements[i].id] = new UIDialog(elements[i]);
});
