define(["require","./graph.serie"],function(i,t){var e=function(){};return t.prototype,$.extend(!0,e.prototype,t.prototype,{initExtended1:function(){this.initExtended2&&this.initExtended2()},setAxis:function(i){this.axis=i},kill:function(i){this.getAxis().groupSeries.removeChild(this.groupMain),this.getAxis().series.splice(this.getAxis().series.indexOf(this),1),i||this.graph.redraw()},getAxis:function(){return this.axis},getXAxis:function(){return this.axis},getYAxis:function(){return this.axis}}),e});