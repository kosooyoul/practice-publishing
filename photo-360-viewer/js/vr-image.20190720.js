// ver 20190718

function downloadJSAtOnload(src) {var element = document.createElement("script"); element.src = src; (document.head || document.body).appendChild(element);}
function evalWithinContext(context, code) {(function(code) {eval(code);}).call(context, code);}
downloadJSAtOnload('./js/Projector.js');
downloadJSAtOnload('./js/CanvasRenderer.js');

window.requestAnimFrame = (function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ) {window.setTimeout(callback, 1000 / 60);};
})();

window.$block = function(name, methods, parent) {
	var constructor = methods.constructor;

	if (!constructor) {
		return;
	}

	for (var methodName in methods) {
		if (constructor == methods[methodName]) {
			continue;
		}

		// static function
		if (methodName[0] == '$') {
			constructor[methodName.slice(1)] = methods[methodName];
			continue;
		}

		// normal member function
		constructor.prototype[methodName] = methods[methodName];
	}

	name && ((parent || window)[name] = constructor);
};

// DropController
(function() {
	var _private = {};

	$block('DropController', {
		constructor: function(element) {
			var _this = this;

			this.element = element;

			// event
			this.onDrop = null;

			var onDropListener = function(e) {_private.onDrop.call(_this, e);};
			var onDragoverListener = function(e) {e.preventDefault();};

			element.addEventListener('drop', onDropListener, false);
			element.addEventListener('dragover', onDragoverListener, false);
		},
		setOnDrop: function(onDrop) {
			this.onDrop = onDrop;
		}
	});

	_private.onDrop = function(e) {
		if (e.target != this.element) {
			return;
		}

		this.onDrop(e.dataTransfer.files[0]);

		e.preventDefault();
	};
})();

// RotationController
(function() {
	var _private = {};

	$block('RotationController', {
		constructor: function(element) {
			var _this = this;

			this.element = element;

			// event
			this.onRotate = null;

			// moving
			this.moving = false;
			this.rx = 0;
			this.ry = 0;
			this.lastX = 0;
			this.lastY = 0;

			// sliding
			this.records = [];
			this.intervalRecording = null;
			this.intervalSliding = null;

			var onStartListener = function(e) {_private.onStart.call(_this, e);};
			var onMoveListener = function(e) {_private.onMove.call(_this, e);};
			var onStopListener = function(e) {_private.onStop.call(_this, e);};

			window.addEventListener('mousedown', onStartListener, false);
			window.addEventListener('mousemove', onMoveListener, false);
			window.addEventListener('mouseup', onStopListener, false);
			this.element.addEventListener('touchstart', onStartListener);
			this.element.addEventListener('touchmove', onMoveListener);
			this.element.addEventListener('touchend', onStopListener);
		},
		setOnRotate: function(onRotate) {
			this.onRotate = onRotate;
		}
	});

	var getPoint = function(e) {
		return event.targetTouches? event.targetTouches[0] : event; //for Mobile
	};

	var getTouchCount = function(e) {
		return event.touches? event.touches.length: null;
	};

	_private.onStart = function(e) {
		if (e.target != this.element) {
			return;
		}

		if (e.type == 'touchstart') {
			e.preventDefault(); //for Mobile
		}

		var pointer = getPoint(e); // touch count must be 1

		this.moving = true;
		this.lastX = pointer.pageX;
		this.lastY = pointer.pageY;

		_private.stopSliding.call(this);
		_private.startRecording.call(this);
	};

	_private.onMove = function(e) {
		if (!this.moving) {
			return;
		}

		var pointer = getPoint(e); // touch count must be 1

		var drx = (pointer.pageY - this.lastY) / 360;
		var dry = (pointer.pageX - this.lastX) / 360;
		var temprx = this.rx - drx;
		var tempry = this.ry - dry;
		if ((temprx < -Math.PI / 2 && drx > 0) || (temprx > Math.PI / 2 && drx < 0)) {
			temprx = this.rx - drx / 4;
		}

		this.rx = temprx;
		this.ry = tempry;
		this.lastX = pointer.pageX;
		this.lastY = pointer.pageY;

		this.onRotate(this.rx, this.ry);
	};

	_private.onStop = function(e) {
		this.moving = false; // touch count must be 0

		_private.stopRecording.call(this);
		_private.startSliding.call(this);
	};

	_private.startRecording = function() {
		var _this = this;

		this.records = [];
		this.records.push({rx: this.rx, ry: this.ry});

		if (this.intervalRecording) {
			clearInterval(this.intervalRecording);
		}

		this.intervalRecording = setInterval(function() {
			if (!_this.moving) {
				return _private.stopRecording.call(_this);
			}

			_this.records.push({rx: _this.rx, ry: _this.ry});
		}, 1000 / 60)
	};

	_private.stopRecording = function() {
		this.records.push({rx: this.rx, ry: this.ry});

		clearInterval(this.intervalRecording);
		this.intervalRecording = null;
	};

	_private.startSliding = function() {
		var _this = this;

		var lastRecords = this.records.slice(-3);
		if (lastRecords.length < 3) return;

		var first = lastRecords[0], prev = lastRecords[1], curr = lastRecords[2];
		var pdrx = first.rx - curr.rx, pdry = first.ry - curr.ry;
		var cdrx = curr.rx - prev.rx, cdry = curr.ry - prev.ry;
		var drx = cdrx + (cdrx - pdrx) * 0.4; // expected next drx is added prev drx x 0.4
		var dry = cdry + (cdry - pdry) * 0.4; // expected next dry is added prev dry x 0.4

		if (this.intervalSliding) {
			clearInterval(this.intervalSliding);
		}

		this.intervalSliding = setInterval(function() {
			if (_this.moving) {
				return _this.stopSliding.call(_this);
			}

			var temprx = _this.rx + drx;
			var tempry = _this.ry + dry;
			if ((temprx < -Math.PI / 2 && drx < 0) || (temprx > Math.PI / 2 && drx > 0)) {
				temprx = _this.rx + drx / 4;
			}
			
			// if (rx < -Math.PI / 2) {
			// 	rx = -Math.PI / 2;
			// 	drx = -drx;
			// } else if (rx > Math.PI / 2) {
			// 	rx = Math.PI / 2;
			// 	drx = -drx;
			// }

			_this.rx = temprx;
			_this.ry = tempry;

			drx /= 1.1;
			dry /= 1.1;

			_this.onRotate(_this.rx, _this.ry);

			if (Math.abs(drx) < 0.00000001 && Math.abs(dry) < 0.00000001) {
				_private.stopSliding.call(_this);
			}
		}, 1000 / 60);
	};

	_private.stopSliding = function() {
		clearInterval(this.intervalSliding);
		this.intervalSliding = null;
	};
})();

// JsonpDataLoader
(function() {
	var _private = {};

	$block('JsonpDataLoader', {
		constructor: function() {
			var _this = this;

			// event
			this.onLoadByType = {};

			window.jsonp = function(data) {_private.onLoad.call(_this, data);};
		},
		setOnLoadByType: function(type, onLoad) {
			this.onLoadByType[type] = onLoad;
		},
		load: function(url) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;
			document.head.appendChild(script);
		}
	});

	_private.onLoad = function(data) {
		var type = data.type || '';
		var onLoad = this.onLoadByType[type];

		if (onLoad) {
			onLoad(data);
		}
	};
})();

// MeshHelper
(function() {
	$block('MeshHelper', {
		$getSphere: function() {
			var geometry = new THREE.SphereGeometry(100, 40, 20, 0, Math.PI * 2, 0, Math.PI);
			return new THREE.Mesh(geometry);
		},
		$getPieceOfSphere: function(x, y, divideX, divideY) {
			var geometry = new THREE.SphereGeometry(100, 80 / divideX, 40 / divideY, Math.PI * 2 / divideX * x, Math.PI * 2 / divideX, Math.PI / divideY * (divideY - y - 1), Math.PI / divideY);
			var material = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide});
			return new THREE.Mesh(geometry, material);
		}
	});
})();

//check intersect 1

	// var findIntersectObject = function(parent) {
	// 	var intersect;

	// 	for (var c = 0; c < parent.children.length; c++) {
	// 		var child = parent.children[c];
	// 		if (child.isMesh && child.visible) {
	// 			var intersects = _raycaster.intersectObject(child);
	// 			intersect = intersects && intersects[0];

	// 			if (intersect) return intersect;
	// 		}

	// 		if (child.isGroup) {
	// 			intersect = findIntersectObject(child);

	// 			if (intersect) return intersect;
	// 		}
	// 	}
	// }

//check intersect 2

		// var pointer = event.targetTouches? event.targetTouches[0] : event;//for Mobile
		// if (event.touches && event.touches.length > 1) return;

		// if (obj.sphere) {
		// 	_vectorForMouse.x = (pointer.pageX / obj.element.clientWidth) * 2 - 1;
		// 	_vectorForMouse.y = -(pointer.pageY / obj.element.clientHeight) * 2 + 1;
		// 	_raycaster.setFromCamera(_vectorForMouse, obj.camera);
		// 	var intersect = findIntersectObject(obj.sphere);
		// 	if (intersect) {
		// 		var element = obj.element.querySelector('[data-view=vr-pointer]');

		// 		// obj.testMesh.position.x = intersect.point.x / 2;
		// 		// obj.testMesh.position.y = intersect.point.y / 2;
		// 		// obj.testMesh.position.z = intersect.point.z / 2;

		// 		var m = new THREE.Matrix4().copy(obj.sphere.matrix);
		// 		m.getInverse(m);
		// 		intersect.point.applyMatrix4(m);

		// 		element.setAttribute('data-x', intersect.point.x);
		// 		element.setAttribute('data-y', intersect.point.y);
		// 		element.setAttribute('data-z', intersect.point.z);

		// 		obj.invalidate();
		// 	}
		// }


(function() {
	var _clazz = {};
	var _objects = {};

	var DIVIDE_WIDTH = 8;
	var DIVIDE_HEIGHT = 4;

	var _raycaster = new THREE.Raycaster();
	var _vectorForMouse = new THREE.Vector2();

	_clazz.get = function (name) {
		return _objects[name];
	};

	_clazz.constructor = function(element) {
		var self = this;
		this.element = element;
		this.jsonp = element.getAttribute('data-jsonp');
		this.prop = {
			angleX: Number(element.getAttribute('data-anglex')),
			angleY: Number(element.getAttribute('data-angley')),
			fov: Number(element.getAttribute('data-fov')),
			onload: element.getAttribute('data-onload')
		};

		this.isLoading = false;

		try {
			if (!window.WebGLRenderingContext) throw new Error('WebGLRenderingContext is undefined.');
			this.renderer = new THREE.WebGLRenderer({antialias: false})
			this.webGLContext = this.renderer.getContext();
		} catch(e) {
			this.renderer = new THREE.CanvasRenderer(); // Fallback to canvas renderer, if necessary.
			this.webGLContext = null;
		}
		this.renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the WebGL viewport.
		this.renderer.setClearColor(0x000000, 1);
		this.element.appendChild(this.renderer.domElement); // Append the WebGL viewport to the DOM.

		this.scene = new THREE.Scene(); // Create a Three.js scene object.
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000); // Define the perspective camera's attributes.

		initializeEvents(this);

		// init rotate sphere controller
		this.rotationController = new RotationController(this.renderer.domElement);
		this.rotationController.setOnRotate(function(rx, ry) {
			if (self.sphere) {
				self.sphere.rotation.x = rx;
				self.sphere.rotation.y = ry;
				self.invalidate();
			}
		});

		// init drag drop data file
		this.dropController = new DropController(this.renderer.domElement);
		this.dropController.setOnDrop(function(file) {
			self.loadFromFile(file);
		});

		// init jsonp data loader
		this.jsonpDataLoader = new JsonpDataLoader();
		this.jsonpDataLoader.setOnLoadByType('', function(data) {
			self.data = data.data; // Single mode
			self.datas = data.datas; // Partial mode
			self.tags = data.tags || [];
			if (self.datas) {
				self.divideSphereX = data.divideSphereX || 8;
				self.divideSphereY = data.divideSphereY || 4;
			}

			initialize(self);

			var code = self.prop.onload;
			if (window[self.prop.onload] instanceof Function) {
				window[self.prop.onload].call(self);
			} else {
				evalWithinContext(self, code);
			}
		});
		this.jsonpDataLoader.setOnLoadByType('part', function(data) {
			self.onLoadPartData(data);
		});

		initializeRenderLoop(this);

		loadData(this);
	};

	_clazz.constructor.prototype.loadFromFile = function(file) {
		var obj = this;
		var reader  = new FileReader();

		reader.addEventListener('load', function () {
			obj.loadFromDataURI(reader.result);
		}, false);

		reader.readAsDataURL(file);
	};

	_clazz.constructor.prototype.loadFromDataURI = function(uri) {
		this.data = uri;
		loadData(this);
	};

	_clazz.constructor.prototype.invalidate = function() {
		if (!this.dirty) {
			this.dirty = true;
			this.requestRender && this.requestRender();
		}
	};

	_clazz.constructor.prototype.loadPart = function(mesh) {
		var self = this;

		if (mesh.partLoaded == true) return;
		mesh.partLoaded = true;

		if (mesh.data) {
			this.textureLoader.load(mesh.data, function(texture) {
				texture.wrapS = THREE.ClampToEdgeWrapping;
				texture.wrapT = THREE.ClampToEdgeWrapping;
				texture.flipY = false;
				// texture.repeat.set(-1, 1);
				// texture.offset.set(0.5, 0);

				var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide}); // Skin the cube with 100% blue.

				mesh.material = material;
				mesh.visible = true;

				self.invalidate();
			});
			return;
		}

		if (mesh.jsonp) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = mesh.jsonp;
			document.head.appendChild(script);
		}
	};

	_clazz.constructor.prototype.onLoadPartData = function(data) {
		var self = this;
		var mesh = this.meshPartForSpheres[data.key];

		// Load Texture
		this.textureLoader.load(data.data || data.uri, function(texture) {
			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearFilter;
			texture.flipY = false;
			// texture.repeat.set(-1, 1);
			// texture.offset.set(0.5, 0 - 1 / divideY * (partY + 1));

			var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide}); // Skin the cube with 100% blue.

			mesh.material = material;
			mesh.visible = true;

			console.log('loaded ' + data.key);

			self.invalidate();
		});
	};

	var loadData = function(obj) {
		obj.name = obj.name || 'Untitled';
		obj.filename = obj.filename || 'VRImage.png';

		if (obj.angle) {
			obj.angle = {'x': obj.angle.x || 0, 'y': obj.angle.y || 0};
		} else {
			obj.angle = {'x': 0, 'y': 0};
		}
		obj.fov = obj.fov || 60;
		obj.magiceye = obj.magiceye; //[null = none, sbs, tb]

		//override prop
		if (isFinite(obj.prop.angleX)) {
			obj.angle.x = obj.prop.angleX;
			console.log('obj.angle.x', obj.angle.x);
		}
		if (isFinite(obj.prop.angleY)) {
			obj.angle.y = obj.prop.angleY;
			console.log('obj.angle.y', obj.angle.y);
		}
		if (isFinite(obj.prop.fov)) {
			obj.fov = obj.prop.fov;
			console.log('obj.fov', obj.fov);
		}

		if (obj.data) {
			initialize(obj);
		} else if (obj.jsonp) {

			obj.jsonpDataLoader.load(obj.jsonp);

			// var script = document.createElement('script');
			// script.type = 'text/javascript';
			// script.src = obj.jsonp;
			
			// window.jsonp = function(jso) {
			// 	var type = jso && jso.type;
			// 	if (type == 'part') {
			// 		obj.onLoadPartData(jso);
			// 	} else {
			// 		obj.data = jso.data; // Single mode
			// 		obj.datas = jso.datas; // Partial mode
			// 		obj.tags = jso.tags || [];
			// 		if (obj.datas) {
			// 			obj.divideSphereX = jso.divideSphereX || 8;
			// 			obj.divideSphereY = jso.divideSphereY || 4;
			// 		}

			// 		initialize(obj);
			// 		obj.isLoading = false;

			// 		var code = obj.prop.onload;
			// 		if (window[obj.prop.onload] instanceof Function) {
			// 			window[obj.prop.onload].call(obj);
			// 		} else {
			// 			evalWithinContext(obj, code);
			// 		}
			// 	}
			// };
			// obj.isLoading = true;

			// document.head.appendChild(script);
		}
	};

	var initialize = function(obj) {
		initializeMesh(obj);
		initializeTexture(obj);
		initializeCamera(obj);
		initializeElements(obj);

		obj.sphere.rotation.x = obj.angle.x * Math.PI / 180;
		obj.sphere.rotation.y = obj.angle.y * Math.PI / 180;
		obj.camera.fov = obj.fov;
		obj.camera.updateProjectionMatrix();

		obj.invalidate();
	};

	var initializeMesh = function(obj) {
		// Clear sphere
		obj.scene.remove(obj.sphere);
		obj.sphere = new THREE.Group();
		obj.scene.add(obj.sphere);

		obj.meshForSphere = null;
		obj.meshPartForSpheres = {};

		// Single mode
		if (obj.data) {
			obj.meshForSphere = MeshHelper.getSphere();
			obj.meshForSphere.data = obj.data;
			obj.sphere.add(obj.meshForSphere);
			obj.meshForSphere.rotateX(Math.PI);
			// obj.meshForSphere.rotateY(Math.PI / 2);
			return;
		}

		// Partial mode
		if (obj.datas) {
			obj.sphereParts = new THREE.Group();
			obj.sphere.add(obj.sphereParts);
			obj.sphereParts.rotateX(Math.PI);
			obj.sphereParts.rotateY(-Math.PI / 2);
			for (var x = 0; x < obj.divideSphereX; x++) {
				for (var y = 0; y < obj.divideSphereY; y++) {
					var meshPartOfSphere = MeshHelper.getPieceOfSphere(x, y, obj.divideSphereX, obj.divideSphereY);
					meshPartOfSphere.visible = false;
					obj.sphereParts.add(meshPartOfSphere);

					var key = x + '-' + y;
					meshPartOfSphere.jsonp = obj.datas[x + '-' + y];
					obj.meshPartForSpheres[key] = meshPartOfSphere;
				}
			}
			return;
		}
	};

	var initializeTexture = function(obj) {
		obj.textureLoader = new THREE.TextureLoader();
	};

	var initializeCamera = function(obj) {
		obj.camera.position.z = 0; // Move the camera away from the origin, down the positive z-axis.
	};

	var initializeElements = function(obj) {
		obj.tags.forEach(function(tag) {
			var element = document.createElement('div');
			element.setAttribute('data-view', 'vr-element');
			element.setAttribute('data-x', tag.x || 0);
			element.setAttribute('data-y', tag.y || 0);
			element.setAttribute('data-z', tag.z || 0);
			element.setAttribute('style', 'display: none; position: absolute; left: 0px; top: 0px; color: white; text-shadow: 0px 0px 4px black; font-size: 16px; white-space: nowrap;');
			element.textContent = tag.text;
			obj.element.appendChild(element);
		});
	};

	var initializeRenderLoop = function(obj) {
		obj.requestRender = function() {
			requestAnimFrame(onRender);
		};

		var onRender = function(timems) {
			if (!obj.dirty) return; // requestAnimFrame(onRender);

			check();

			render();

			obj.dirty = false;

			// Call the render() function up to 60 times per second (i.e., up to 60 animation frames per second).
			requestAnimFrame(onRender);
		};

		var check = function() {
			var frustum = new THREE.Frustum();
			var cameraViewProjectionMatrix = new THREE.Matrix4();
			obj.camera.updateMatrixWorld();
			obj.camera.matrixWorldInverse.getInverse(obj.camera.matrixWorld);
			cameraViewProjectionMatrix.multiplyMatrices(obj.camera.projectionMatrix, obj.camera.matrixWorldInverse);
			// cameraViewProjectionMatrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, 100))
			frustum.setFromMatrix(cameraViewProjectionMatrix);
			obj.sphere.children.forEach(function(mesh) {
				if (mesh.isMesh) {
					mesh.visible = frustum.intersectsObject(mesh);
					if (mesh.visible) {
						obj.loadPart(mesh);
					}
				} else if (mesh.isGroup) {
					mesh.children.forEach(function(mesh) {
						if (mesh.isMesh) {
							mesh.visible = frustum.intersectsObject(mesh);
							if (mesh.visible) {
								obj.loadPart(mesh);
							}
						}
					});
				}
			});

			// Texts
			var textModelView = new THREE.Matrix4();
			textModelView.copy(obj.camera.projectionMatrix);
			textModelView.multiply(obj.camera.matrixWorldInverse);
			textModelView.multiply(obj.sphere.matrix);

			var vrElements = obj.element.querySelectorAll('[data-view=\'vr-element\']');
			vrElements.forEach(function(element) {
				var x = Number(element.getAttribute('data-x')) || 0;
				var y = Number(element.getAttribute('data-y')) || 0;
				var z = Number(element.getAttribute('data-z')) || (x && y? 1: 0);

				var vector = new THREE.Vector3(x, y, z).applyMatrix4(textModelView);
				if (vector.z >= 1) {
					element.style.display = 'none';
				} else {
					element.style.display = 'block';
					element.style.left = Math.floor((vector.x + 1) / 2 * window.innerWidth - element.clientWidth / 2) + 'px';
					element.style.top = Math.floor(-(vector.y - 1) / 2 * window.innerHeight - element.clientHeight / 2) + 'px';
				}
			});
			// var vrPointers = obj.element.querySelectorAll('[data-view=\'vr-pointer\']');
			// vrPointers.forEach(function(element) {
			// 	var x = Number(element.getAttribute('data-x')) || 0;
			// 	var y = Number(element.getAttribute('data-y')) || 0;
			// 	var z = Number(element.getAttribute('data-z')) || (x && y? 1: 0);

			// 	var vector = new THREE.Vector3(x, y, z).applyMatrix4(textModelView);
			// 	if (vector.z > 1) {
			// 		element.style.display = 'none';
			// 	} else {
			// 		element.style.display = 'block';
			// 		element.style.left = Math.floor((vector.x + 1) / 2 * window.innerWidth - element.clientWidth / 2) + 'px';
			// 		element.style.top = Math.floor(-(vector.y - 1) / 2 * window.innerHeight - element.clientHeight / 2) + 'px';
			// 	}
			// });
		};

		var render = function() {

			/*
			obj.meshForLoading.visible = obj.isLoading;
			if (obj.isLoading) {
				obj.meshForLoading.rotation.y -= Math.PI / 40;
			}
			*/

			obj.renderer.render(obj.scene, obj.camera); // Each time we change the position of the cube object, we must re-render it.

			if (obj.webGLContext && obj.webGLContext.getError()) {
				//If error is occured, change renderer to canvas renderer.
				obj.webGLContext = null;
				obj.renderer.domElement.remove();

				obj.renderer = new THREE.CanvasRenderer();
				obj.renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the WebGL viewport.
				obj.renderer.setClearColor(0xF9F9F9, 1);
				obj.element.appendChild(obj.renderer.domElement); // Append the WebGL viewport to the DOM.
			}
		};

		onRender(0);
	};

	var initializeEvents = function(obj) {

		window.addEventListener('wheel', function(e) {
			if (e.deltaY < 0) {
				obj.fov = Math.max(obj.fov - 1, 10);
			} else if (e.deltaY > 0) {
				obj.fov = Math.min(obj.fov + 1, 120);
			}
			obj.camera.fov = obj.fov;
			obj.camera.updateProjectionMatrix();
			obj.invalidate();
		}, false);
		window.addEventListener('resize', function() {
			obj.renderer.setSize(window.innerWidth, window.innerHeight);

			obj.camera.aspect = window.innerWidth / window.innerHeight;
			obj.camera.updateProjectionMatrix();
			obj.invalidate();
		}, false);
	};

	/*
	var generateGradient = function(start, center, end, width, height) {
		var w = width || 512;
		var h = height || 512;

		// create canvas
		canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;

		// get context
		var context = canvas.getContext('2d');

		// draw gradient
		context.rect(0, 0, w, h);
		var gradient = context.createLinearGradient(0, 0, w, h);
		gradient.addColorStop(0, start);
		gradient.addColorStop(0.5, center);
		gradient.addColorStop(1, end);
		context.fillStyle = gradient;
		context.fill();

		return canvas;
	};
	*/

	function dataURIToBlob(dataURI) {
		var binStr = atob(dataURI.split(',')[1]), len = binStr.length, arr = new Uint8Array(len), mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

		for (var i = 0; i < len; i++) {
			arr[i] = binStr.charCodeAt(i);
		}

		return new Blob([arr], {type: mimeString});
	}

	window.VRImageViewer = _clazz;
	window.addEventListener('load', function() {
		var elements = document.querySelectorAll('[data-view=\'vr-image\']');
		var i, name, obj;
		for (i = 0; i < elements.length; i++) {
			obj = new _clazz.constructor(elements[i]);

			name = elements[i].getAttribute('name');
			if (name) {
				_objects[name] = obj;
			}
			
		}
	});
})();