(function(){
	var superDrag = function($){
		$.fn.superDrag = function(options){
			var $self = this;
			var _left = function($e){
				return  parseInt($e.css("left"));
			}
			var _top = function($e){
				return  parseInt($e.css("top"));
			}
			var _x = function($e){
				return _left($e) + $e.outerWidth()/2;
			}
			var _y = function($e){
				return _top($e) + $e.outerHeight()/2;
			}
			var _target = function($e){
				var x = _x($e);
				var y = _y($e);
				var target = null;
				$self.each(function(){
					var $this = $(this);
					if($e[0] === $this[0])return true;
					var dw = $this.outerWidth()/2;
						dh = $this.outerHeight()/2;
					target = Math.abs(_x($this) - x) <= dw && Math.abs(_y($this) - y) <= dh ? $this : null;
					if(target)return false;
				});
				return target;
			}
			this.each(function(){
				var superDrag = false;
				var x, y, left ,top;
				var $this   = $(this),
					$target = null;		
				var z = $this.css("z-index");

				$this.css("position","absolute").on("mousedown",function(e){
					left = _left($this) + "px", 
					top  = _top($this) + "px",
					superDrag = true;
					x = e.pageX;
					y = e.pageY;
					$this.css("z-index",1);
				})

				$(document).on("mouseup",function(){
					if(superDrag){
						if($target){
							console.log($target.text());
							var l = _left($target) + "px",
								t = _top($target) + "px";
							$this.animate({
								left : l,
								top  : t
							},200,function(){
								$this.css("z-index",z);
							});
							$target.animate({
								left : left,
								top  : top
							},200);
							left = l;
							top  = t;
							$target.css("box-shadow","");
							$target = null;
						}else{
							$this.animate({
								left : left,
								top  : top
							},200,function(){
								$this.css("z-index",z);
							});
						}
						superDrag = false;
					}
					
				}).on("mousemove",function(e){	
					if(superDrag){
						var offsetX = e.pageX - x;
						var offsetY = e.pageY - y;
						x = e.pageX;
						y = e.pageY;
						$this.css({
							left : _left($this) + offsetX + "px",
							top  : _top($this) + offsetY + "px"
						});

						var target = _target($this);
						if(target){
							if($target){
								if(target[0] !== $target[0]){
									$target.css("box-shadow","");
									target.css("box-shadow","0 0 10px red");
								}
							}else{
								target.css("box-shadow","0 0 10px red");
							}
						}else{
							if($target)$target.css("box-shadow","");
						}
						$target = target;
					}
				});

			});
			return this;
		}
	}
	//cmd规范写法
	if(typeof define === "function" && typeof define.cmd === "object"){
		define(['jquery'],function(require, exports, module){
			superDrag(require("jquery"));
		});
	//amd规范写法
	}else if(typeof define === "function" && typeof define.amd === "object"){
		define(['jquery'],superDrag);
	//普通写法
	}else{
		if("undefined" === jQuery){
			throw new Error("superDrag requires jQuery");
		}
		superDrag(jQuery);
	}
})()