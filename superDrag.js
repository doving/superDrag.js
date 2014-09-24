(function(){
	var superDrag = function($){
		var SD = function($){
			//该对象对jQuery包装DOM元素对象的引用
			this.$      = $;

			//该对象引用的DOM上发生mousedown或mousemove时鼠标的坐标
			this.ex     = 0;
			this.ey     = 0;

			this.z      = $.css("z-index");
			this.position = $.css("position");

			//该对象引用的DOM元素宽和高的一半
			this.dw     = $.outerWidth()/2;
			this.dh     = $.outerHeight()/2;

			//是否可以拖动
			this.dragable   = false;
			
			//是否正在和其他元素互换
			this.exchanging = false;

			//该对象引用的DOM元素相对于整个文档的坐标
			var offset  = $.offset();
			this.x      = offset.left;
			this.y      = offset.top;

			
			//该对象引用的DOM发生动画时对循环器的引用
			this.interval = null;

			//允许互换时，对互换对象的引用
			this.target     = null;

			//DOM元素通过_superDrag属性引用该对象
			this.$[0]._superDrag = this;

			var self = this;
			this.$.on("mousedown",function(e){
				//当前DOM发生mousedown时，如果已经在互换过程中则直接return
				//否则清空该DOM中发生的animate动画
				//记录下当前鼠标相对于文档的坐标并付给当前对象的ex和ey属性
				//设置该对象dragable为true，表示可拖拽，设置当前DOM的z-index属性为最大，拖拽时赋予其他所选元素之上
				if(self.exchanging)return;
				self.stop();
				self.ex    = e.pageX;
				self.ey    = e.pageY;
				self.dragable  = true;
				self.$.css("z-index",SD.maxZ);
			});
		}

		SD.prototype = {
			offset: function(){
				return this.$.offset();
			},
			//该DOM在拖拽过程中获取互换对象的函数
			getTarget: function($$){
				var offset = this.offset();
				var x      = offset.left,
					y      = offset.top,
					target = null,
					self   = this;

				$$.each(function(){
					var sd = this._superDrag;
					//如果该sd对象正处于互换过程中则continue
					if(sd.exchanging)return true;
					//横坐标距离小于该DOM的width一半，纵坐标距离小于该DOM的height一半，则该DOM的superDrag包装对象被选为互换对象
					self !== sd && Math.abs(sd.x - x) <= sd.dw && Math.abs(sd.y - y) <= sd.dh && (target = sd);
					//如果选出一个target互换对象则break
					if(target)return false;
				});

				return target;
			},
			//document中鼠标移动时触发的函数
			mousemove: function($$,e){
				if(this.dragable){
					var offset = this.offset();
					this.$.offset({
						left : offset.left + e.pageX - this.ex,
						top  : offset.top + e.pageY - this.ey
					});

					this.ex = e.pageX;
					this.ey = e.pageY;

					var target = this.getTarget($$);
					if(target){
						if(this.target){
							if(target !== this.target){
								this.target.$.css("box-shadow","");
								target.$.css("box-shadow","0 0 10px red");
							}
						}else{
							target.$.css("box-shadow","0 0 10px red");
						}
					}else{
						this.target && this.target.$.css("box-shadow","");
					}
					this.target = target;
				}
			},
			//该对象引用的DOM发生动画的函数
			animate: function(offset,duration,callback){
				this.stop();
				var n    = 1,
					step = 13,
					time = parseInt(duration/step);

				var of = this.offset();
				var x  = (offset.left - of.left)/time,
					y  = (offset.top - of.top)/time;
				
				if(x == 0 && y == 0)return;

				var self = this;
				
				this.interval = setInterval(function(){		
					//动画完成后清空interval对象及属性
					//设置exchange为false表示不在互换过程中	
					//恢复DOM之前的z-index属性
					//将当前对象作为this关键字传递给回调函数		
					if(n > time){
						self.stop();
						self.exchanging = false;
						self.$.css("z-index",self.z);
						callback && callback.call(self);
					}else{
						self.$.offset({left: of.left + x*n, top:of.top + y*n});
					}
					n++;
				},step);
			},
			//该对象引用的DOM与其他DOM发生互换时的函数
			exchange: function(){
				var target = this.target;

				//设置当前对象和互换对象的exchange属性为true
				this.exchanging = target.exchanging = true;

				//互换当前对象和互换对象的x、y和position属性
				var x = this.x, 
					y = this.y, 
					p = this.position;

				this.x = target.x;
				this.y = target.y;
				this.position = target.position;
				target.x = x;
				target.y = y;
				target.position = p;

				//目标对象发生动画
				target.animate({left: target.x, top: target.y},400);

				//当前对象发生动画
				this.animate({left: this.x, top: this.y},400,function(){
					//动画完成时互换当前对象引用DOM和目标对象引用DOM的节点位置
					var $next = this.$.next(),
					$parent = this.$.parent();
					target.$.after(this.$);
					$next[0] ? $next.before(target.$) : $parent.append(target.$); 

					//换完位置后将已经互换的position
					this.$.css({"position": this.position});
					target.$.css({"position": target.position});
					this.$.offset({left: this.x, top: this.y});
					target.$.offset({left: target.x, top: target.y});
				});
				this.target = null;
				target.$.css("box-shadow","");
			},
			//在document中发生mouseup时调用的函数
			mouseup: function(){
				//如果可以拖拽则判断是否存在互换对象
				//如果存在则进行互换，否则该对象引用的DOM发生animate动画回到原处
				this.dragable && (this.target ? this.exchange() : this.animate({left: this.x, top: this.y},400));
				this.dragable = false;
			},
			//清空该对象引用的DOM上发生的animate动画，并设置该对象interval属性为null
			stop: function(){
				this.interval && (clearInterval(this.interval), this.interval = null);
			}
		};

		$.fn.superDrag = function(options){		
			var $self = this;

			//集合DOM元素中z-index值中最大的
			SD.maxZ = 1;	

			this.each(function(){
				if(this._superDrag)return true;
				var sd = new SD($(this));
				var z = +$(this).css("z-index") || 0;
				//获取最大z-index并加1
				SD.maxZ = SD.maxZ > z ? SD.maxZ : z + 1;
				$(document).on("mousemove",function(e){sd.mousemove($self,e)}).on("mouseup",function(e){sd.mouseup()});
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