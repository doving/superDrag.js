(function(){
	var superDrag = function($){
		var SD = function($){
			this.$      = $.css("position","absolute");
			this.ex     = 0;
			this.ey     = 0;
			this.z      = $.css("z-index");
			this.drag   = false;
			this.target = null;
			this.left   = SD.getLeft($);
			this.top    = SD.getTop($);

			var offset  = $.offset();
			this.x = offset.left;
			this.y = offset.top;

			$[0].superDrag = this;

			var self = this;
			this.$.on("mousedown",function(e){
				self.x    = e.pageX;
				self.y    = e.pageY;
				self.drag = true;
				self.$.css("z-index",1);
			});
		}

		SD.getLeft = function($){
			return  parseInt($.css("left"));
		}
		SD.getTop = function($){
			return  parseInt($.css("top"));
		}
		SD.getX = function($){
			return $.offset().left;
		}
		SD.getY = function($){
			return $.offset().top;
		}

		$.extend(SD.prototype,{
			getLeft: function(){
				return SD.getLeft(this.$);
			},
			getTop: function(){
				return SD.getTop(this.$);
			},
			getX: function(){
				return SD.getX(this.$);
			},
			getY: function(){
				return SD.getY(this.$);
			},
			getTarget: function($$){
				var x = this.getX(),
					y = this.getY(),
					target = null,
					self = this;

				$$.each(function(){
					var $this = $(this);
					if(self.$[0] !== $this[0]){
						var dw = $this.outerWidth()/2,
							dh = $this.outerHeight()/2;
						target = Math.abs(SD.getX($this) - x) <= dw && Math.abs(SD.getY($this) - y) <= dh ? $this : null;
						if(target)return false;
					}
				});

				return target;
			},
			move: function($$,e){
				if(this.drag){
					var x = e.pageX,
						y = e.pageY,
						offsetX = x - this.ex,
						offsetY = y - this.ey;

					this.ex = x;
					this.ey = y;

					this.$.css({
						left : this.getLeft() + offsetX ,
						top  : this.getTop() + offsetY
					});

					var target = this.getTarget($$);
					if(target){
						if(this.target){
							if(target[0] !== this.target[0]){
								this.target.css("box-shadow","");
								target.css("box-shadow","0 0 10px red");
							}
						}else{
							target.css("box-shadow","0 0 10px red");
						}
					}else{
						if(this.target)this.target.css("box-shadow","");
					}
					this.target = target;
				}
			},
			exchange: function(){
				var $$ = this.target;
				var p1 = this.$.offset(),
					p2 = $$.offset(),
					l1 = this.$[0].SDleft,
					t1 = this.$[0].SDtop,
					l2 = $$[0].SDleft,
					t2 = $$[0].SDtop;

				this.$.css({
					left  : this.getLeft() + p2.left - p1.left,
					top   : this.getTop() + p2.top - p1.top
				});
				$$.css({
					left  : l2 + p1.left - p2.left,
					top   : t2 + p1.top - p2.top
				});

				var $next = this.$.next();
				var $parent = this.$.parent();
				$$.after(this.$);
				$next[0] ? $next.before($$) : $parent.append($$);

				var self = this;
				this.$.animate({
					left : l2,
					top  : t2
				},200,function(){
					self.$.css("z-index",self.z);
				});
				$$.animate({
					left : l1,
					top  : t1
				},200);
				
				$$.css("box-shadow","");
				$$[0].SDleft = l1;
				$$[0].SDtop  = t1;
				this.$[0].SDleft = l2;
				this.$[0].SDtop  = t2;
				
			},
			stop: function(){
				if(this.drag){
					var self = this;
					if(this.target){
						this.exchange();
					}else{
						this.$.animate({
							left : this.$[0].SDleft,
							top  : this.$[0].SDtop
						},200,function(){
							self.$.css("z-index",self.z);
						});
					}
				}
				this.drag = false;
			}
		});

		$.fn.superDrag = function(options){		
			var $self = this;			
			this.each(function(){
				if(this.superDrag)return true;
				var sd = new SD($(this));
				$(document).on("mouseup",function(e){sd.stop()}).on("mousemove",function(e){sd.move($self,e)});
				this.superDrag = true;
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