//蓝面包的唯美代码
//wc24@qq.com
var zero = zero || {};
zero.error = this.error || cc.error;
zero.assert = this.assert || cc.assert;
zero.warn = this.warn || cc.warn;
zero.Object=function(){}
zero.Object.extend=function(prop){
	var __Class=function () {
 		this.class=__Class;
 		if (this.ctor){
		    this.ctor.apply(this, arguments);
 		}
	}
	if (this!=zero.Object){
		var subProp= Object.create(this.prototype)
		for(item in prop){
			subProp[item]=prop[item]
		}
		__Class.prototype=subProp;
	}else{
		__Class.prototype=prop;
	}
	__Class.extend=zero.Object.extend;
	__Class.isZeroClass=true;
	return __Class;
}
zero.Package=zero.Object.extend({
	add:function(key,item){
		if (item.parent==null){
			this[key]=item;
			item.parent=this;
			if(this.path==null){
				item.path=key;
			}else{
				item.dir=this.path;
				item.path=this.path+"."+key;
			}
			zero.Package.pathPool[item.path]=item;
		}
	}
})
zero.Package.pathPool={}
zero.Package.get=function(path){
	return zero.Package.pathPool[path]
}
zero.AntList = zero.Object.extend({
	ctor:function(){
		Object.defineProperty(this, "meta", {value : {}});
	    this.meta.first={};
	    this.meta.last={};
	    this.meta.pool={}
	    this.meta.first.priority=-100000000;
	    this.meta.last.priority=100000000;
	    this.meta.first.next=this.meta.last;
	    this.meta.last.prev=this.meta.first;
	    this.meta.size=0;
	    this.meta.index=1
	},
	add:function(data,priority,tag){
		priority=priority||0;
		var tag = tag || this.meta.index;
	    zero.assert(Math.abs(priority)<100000000,"添加对象 - 无效参数 priority")
	    if (self[tag]==null){
	        var node={};
	        node.priority=priority;
	        node.tag=tag;
	        node.data=data;
	        var useNode=this.find(priority);
	        node.next=useNode.next;
	        node.prev=useNode;
	        useNode.next.prev=node;
	        useNode.next=node;
	        this[tag]=data;
	        this.meta.pool[tag]=node
	        this.meta.size++;
	        this.meta.index++;
	    }else{
	        zero.warn("数据重定义")
	    }
        return tag
	},
	find:function(priority){
	    //从链表中查找这个优先级将要插入的位置的前一个对象
	    //使用从头遍历可以改用二分法来优化这个算法
	    var useNode=this.meta.last.prev;
	    var cp=Math.abs(useNode.priority-priority);
	    this.each(function(item,tag,itemPriority,node){
	    	var kcp=Math.abs(node.priority-priority);
	        if (kcp==0){
	            useNode=node;
	            return true;
	        }else if(kcp<cp){
	            cp=kcp;
	            useNode=node;
	        }
	    });
	    if (useNode.priority>priority){
	        useNode=useNode.prev;
	    }
	    return useNode;
	},
	del:function(ditem){
    	this.each(function(item,tag,itemPriority,node){
	        if (item==ditem){
				node.prev.next=node.next;
		        node.next.prev=node.prev;
		        this.meta.size--;
		        delete this.meta.pool[tag];
		        delete this[tag];
            	return true;
	        }
	    });
	},
	delAt:function(tag){
	    var node=this.meta.pool[tag];
        node.prev.next=node.next;
        node.next.prev=node.prev;
        this.meta.size--;
        delete this.meta.pool[tag];
        delete this[tag];
	},
	size:function(){
		return this.meta.size;
	},
	each:function(callback){
		var item;
		var isBreak;
		do
		{
			item = this.next(item)
			if (item==null){
				isBreak = true;
			}else{
				isBreak = callback(item.data,item.tag,item.priority,item)==true;
			}
		}
		while (!isBreak);
	},
	next:function(node){
		if (node==null){
	        node=this.meta.first.next;
	        if(node.next==null){
	            return null;
	        }else{
	            return node;
	        }
	    }else if(node.next.next!=null){
	        node=node.next;
	        return node;
	    }else{
	        return null;
	    }
	},
});
zero.Mapped=zero.Object.extend({
	ctor:function(addFn,remFn,upFn){
	   this.index=1;
	   this.indexs={};
	   this.pool={};
	   this.addFn=addFn;
	   this.remFn=remFn;
	   this.upFn=upFn;
	},
	up:function(pool,indexKey){
	    this.index++;
	    for (k in pool) {
	    	var v=pool[k]
	        var key=v[indexKey];
	        if (this.pool[key]==null){
	            this.pool[key]=this.addFn(this,v,k);
	            if (this.pool[key]==null){
	                zero.warn("添加函数返回反射对象不能为空");
	            }
	        }else{
	            if (this.upFn!=null){
	                this.upFn(this,this.pool[key],v,k)
	            }
	        }
	        this.indexs[this.pool[key]]=this.index
	    }
	    for (vo in this.pool) {
	    	var ui=this.pool[vo]
	        if( this.indexs[ui]!=this.index ){
	            this.indexs[ui]=null
	            this.pool[vo]=null
	            this.remFn(this,ui)
	        }
	    }
	},
});
zero.Event = zero.Object.extend({
	ctor:function(target){
	    this.bind(target)
	},
	bind:function(){
	    if(target==null){
	        this.pool = {};
	        this.target=this;
	    }else{
	        if(target.isEvent){
			    this.pool = target.pool;
			    this.target=target;
			}else{
		        this.pool = {};
		        this.target=target;
		        target.target=this;
		        target.addEvent=this.addEvent;
		        target.event=this.event;
		        target.hasEvent=this.hasEvent;
		        target.removeEvent=this.removeEvent;
		        target.clearEvent=this.clearEvent;
		        target.isEvent=true;
			}
	    }
	    this.isEvent=true
	},
	addEvent:function(type,callBack,priority){
		var pool=this.target.pool;
	    if(pool[type] == null ){
	        pool[type] = new zero.AntList();
	    }
	    pool[type].add(callBack,priority)
	},
	event:function(type){
		var pool=this.target.pool;
		var arg=arguments.shift()
	    if(pool[type] != null){
	    	pool[type].each(function(item,tag,priority,node){
				return item.apply(this, arg);
	    	})
	    }
	},
	hasEvent:function(type){
		var pool=this.target.pool;
		var out=false
	    if( pool[type] != null ){
	        pool[type].each(function(item,tag,priority,node){
	        	out=true
				return true
	    	})
	    }
	    return out
	},
	removeEvent:function(type,callBack){
		var pool=this.target.pool;
		if(pool[type] != null){
    		pool[type].del(callBack)
    	}
	},
	clearEvent:function(type){
		var pool=this.target.pool;
        pool[type] = new zero.AntList();
	},
});
zero.Observer=zero.Object.extend({
	ctor:function(target){
		this.reset(target)
	},
	hasListener:function(type, zeroNode, methodName){
		var tag=zeroNode.path+"."+(methodName || "execute")
		if(zeroNode ==null ){
			return this.pool[type] != null && this.pool[type].length > 0
		}else{
			return this.pool[type] != null && (this.pool[type][tag])
		}
	},
	addListener:function(type,zeroNode,methodName,priority){
		var tag=zeroNode.path+"."+(methodName || "execute")
		if (this.pool[type] == null) {
	        this.pool[type] = new zero.AntList()
		}
	    this.pool[type].add([zeroNode,methodName],priority,tag)
	},
	removeListener:function(type, zeroNode,methodName){
		var tag=zeroNode.path+"."+(methodName || "execute")
		if(this.pool[type] != null){
	        this.pool[type].delAt(tag)
	    }
	},
	clearListener:function(type){
		this.pool[type] = null
	},
	dispose:function(){
	    this.pool = null
	    this.instancePool = null
	},
	reset:function(target){
	    this.pool = {}
	    this.target = target || this
	    this.instancePool = {}
	},
	clear:function(){
		this.instancePool[path] = null
	},
	notify:function(key){
		var arg=arguments.shift()
	    var happen = 0;
		var methods = this.pool[key]
	    zero.assert(typeof key === "string", "notify 第一个参数格式不对.不应该为" + typeof key)
	    if (methods != null ){
			methods.each(function(item,tag,priority,node){
				var thisArg=arg.unshift(item[0]).unshift(item[1])
		    	var isStop= this.callSingle.apply(this,arg);
	            happen = happen + 1;
	            return isStop;
		    });
	    }
	    return happen
	},
	callSingle:function(key, zeroNode, methodName){
		var arg=arguments.shift().shift().shift()
	    var neure = this.instancePool[zeroNode.path]
	    var isStop=false
	    if(neure == null ){
	        zero.assert(zeroNode != null  && zeroNode.path != null,"指令："+key+"指向无效的类")
	        neure = new zeroNode(this.target)
	        self.instancePool[zeroNode.path] = neure
            if (neure.init != null){
                neure.init()
            }
	    }
	    neure.key = key
	    var method = neure[methodName || "execute"]
	    if( method != null ){
	        isStop=method.apply(neure, arg)
	    }
	    return isStop
	},
}),
zero.zeromvc = {	
	Zero:zero.Object.extend({
		ctor:function(stage, data){
		    this.stage = stage;
		    this.data = data || {};
		    this.model = {};
		    this.showList = {};
		    this.showPool = {};
		    this.view = new zero.Observer();
		    this.control = new zero.Observer();
		},
		addCommand:function(key, zeroNode, methodName,priority){
    		this.control.addListener(key, zeroNode, methodName,priority);
		},
		removeCommand:function(key, zeroNode, methodName){
    		this.control.removeListener(key, zeroNode, methodName);
		},
		addMediator:function(key, zeroNode){
    		this.view.addListener(key, zeroNode);
		},
		removeMediator:function(key, zeroNode){
    		this.control.removeListener(key, zeroNode);
		},
		callView:function(){
    		this.view.notify.apply(this.view, arguments);
		},
		activate:function(key){
			var arg=arguments.shift().unshift("_show").unshift("key");
    		this.view.notify.apply(this.view, arg);
		},
		isActivate:function(key){
    		return this.showPool[key] != null
		},
		inactivate:function(key){
			var arg=arguments.shift().unshift("_hide").unshift("key");
    		this.view.notify.apply(this.view, arg);
		},
		inactivateAll:function(){
			for (item in this.showPool) {
				this.view.notify(item, "_hide")
			}
		},
		command:function(){
    		this.control.notify.apply(this.control, arguments);
		},
		dispose:function(){
			for (item in this.showList) {
				item.dispose()
			}
		    this.showList = null
		    this.showPool = null
		    this.model = null
		    this.view.dispose()
		    this.control.dispose()
		},
		restart:function(){
		    this.dispose()
		    this.showList ={}
		    this.showPool ={}
		    this.model = {}
		    this.view = new zero.Observer(this)
		    this.control = new zero.Observer(this)
		},
		commandOne:function(){
			var arg=arguments.unshift("commandOne")
    		this.control.callSingle.apply(this.control, arg);
		},
		getProxy:function(proxyClass){
			var proxy = self.model[proxyClass.path]
		    if (proxy == null) {
		        if (proxyClass.isZeroClass) {
		            proxy = new proxyClass(this)
		            this.model[proxyClass.path] = proxy
		        }
		    }
		    return proxy
		},
	}),
	Mediator:zero.Object.extend({
		ctor:function(zero){
		    this._pool = {}
		    this._isShow = false
		    this.zero = zero
		    this.mediatorKey = mediatorKey
		},
		getStage:function(){
   			return this.zero.stage
		},
		execute:function(method){
			var arg=arguments.shift();
		    if (method && this[method]){
		        this[method].apply(this, arg);
		    }
		},
		_show:function(){
		    if(this.show && !this._isShow){
		        this.zero.showList[this.mediatorKey]=this
		        this.zero.showPool[this.key]=this
		        this._isShow = true
		        this.show.apply(this, arguments);
		    }
		},
		_hide:function(){
		    if(this.hide && this._isShow){
		        this.zero.showList[this.mediatorKey]=null
		        this.zero.showPool[this.key]=null
		        this._isShow = false
		        this.hide.apply(this, arguments);
		        for (proxyPath in this._pool){
		        	var callBack=this._pool[proxyPath];
		        	var proxy=this.zero.getProxy(zero.Package.get(proxyPath))
		            this.removeProxy(proxy);
		        }
		    }
		},
		hideSelf:function(){
    		this.zero.view.notify(this.key, "_hide")
		},
		addProxy:function(proxy, callBack){
		    proxy:link(this, callBack);
		    this._pool[proxy.path] = callBack
		},
		linkProxy:function(proxy){
			function callBack(_proxy, key){
				if (key != null && this[key] != null && typeof key == "string" ){
		            this[key].apply(this, arguments);
		        }else if (key == null && this["upProxy"] != null ){
		            this["upProxy"].apply(this, arguments);
		        }
			}
		    proxy:link(this, callBack);
		    this._pool[proxy] = callBack
		},
		removeProxy:function(proxy){
		    proxy:unbind(this)
		    this._pool[proxy.path] = null
		},
		clear:function(){
			for (item in this._pool) {
		        var proxy=this.zero.getProxy(zero.Package.get(item))
        		this.removeProxy(proxy)
			}
		    this.zero.view.clear(this.mediatorKey)
		},
		dispose:function(){
		    this._hide()
		    this.clear()
		    // this.zero.view.removeListener(this.key, self.mediatorKey)
		},
		command:function(key){
			var arg=arguments.shift().unshift(this.class.dir+"."+key);
    		this.zero.command.apply(this,arg)
		},
		getProxy:function(proxyNode){
    		return this.zero.getProxy(proxyNode)
		},
		activate:function(key){
			var arg=arguments.shift().unshift("_show").unshift(this.class.dir+"."+key);
    		this.zero.view.notify.apply(this,arg)
		},
		inactivate:function(key){
			var arg=arguments.shift().unshift("_hide").unshift(this.class.dir+"."+key);
    		this.zero.view.notify.apply(this,arg)
		},
	}),
	Command:zero.Object.extend({
		ctor:function(zero, commandName){
		    this.zero = zero
		    this.commandName = this.class.path
		},
		clear:function(){
    		this.zero.control.clear(this.commandName)
		},
		dispose:function(){
		    // this.clear()
		    // this.zero.control.removeListener(this.key, this.commandName)
		},
		command:function(key){
			var arg=arguments.shift().unshift(this.class.dir+"."+key);
    		this.zero.command.apply(this,arg)
		},
		addCommand:function(key, zeroNode, methodName){
			this.zero.control.addListener(this.class.dir+"."+key,zeroNode,methodName)
		},
		addMediator:function(key, zeroNode, methodName){
			this.zero.view.addListener(this.class.dir+"."+key,zeroNode,methodName)
		},
		getProxy:function(proxyNode){
    		return this.zero.getProxy(proxyNode)
		},
		activate:function(){
			var arg=arguments.shift().unshift("_show").unshift(this.class.dir+"."+key);
    		this.zero.view.notify.apply(this,arg)
		},
		inactivate:function(){
			var arg=arguments.shift().unshift("_hide").unshift(this.class.dir+"."+key);
    		this.zero.view.notify.apply(this,arg)
		},
	}),
	Proxy:zero.Object.extend({
		ctor:function(){
		    this.__pool = {}
		    this.zero = zero
		    this.data = this.zero.data
		    if (this.init!= null) {
		        this.init()
		    }
		},
		link:function(mediator, callback){
    		this.__pool[mediator.path] = callback
		},
		unLink:function(mediator){
    		this.__pool[mediator.path] = nil
		},
		update:function(){
			var arg=arguments.unshift(this);
			for (item in this.__pool) {
	    		var neure = this.zero.view.instancePool[item]
	    		var callback=this.__pool[item]
				callback.apply(neure,arg)
			}
		},
	}),
};
//----------------------------------------------------------------------