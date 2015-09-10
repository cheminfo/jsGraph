define( [ 'jquery', './graph.axis' ], function( $, GraphAxis ) {

  "use strict";

  /** 
   * Generic constructor of a y axis
   * @class GraphXAxis
   * @augments GraphAxis
   */
  var GraphXAxis = function( graph, topbottom, options ) {
    this.init( graph, options );
    this.top = topbottom == 'top';
  }

  $.extend( GraphXAxis.prototype, GraphAxis.prototype, {

    getAxisPosition: function() {

      if ( !this.options.display ) {
        return 0;
      }

      var size = ( this.options.tickPosition == 1 ? 8 : 20 ) + this.graph.options.fontSize * 1;

      if ( this.getLabel() ) {
        size += this.graph.options.fontSize;
      }

      return size;
    },

    getAxisWidthHeight: function() {
      return;
    },

    isX: function()  {
      return true;
    },
    isY: function()  {
      return false;
    },

    _setShift: function() {
      if ( !this.getShift() ||  !this.graph.getDrawingHeight() ) {
        return;
      }

      this.group.setAttribute( 'transform', 'translate(0 ' + ( this.floating ? this.getShift() : ( this.top ? this.shift : ( this.graph.getDrawingHeight() - this.shift ) ) ) + ')' )
    },

    getMaxSizeTick: function() {
      return ( this.top ? -1 : 1 ) * ( ( this.options.tickPosition == 1 ) ? 10 : 10 )
    },

    drawTick: function( value, label, scaling, options, forcedPos ) {
      var group = this.groupTicks;
      var val;
      var tick = document.createElementNS( this.graph.ns, 'line' );

      if ( forcedPos !== undefined ) {
        val = forcedPos;
      } else {
        val = this.getPos( value );
      }

      if ( val == undefined || isNaN( val ) ) {
        return;
      }

      tick.setAttribute( 'shape-rendering', 'crispEdges' );
      tick.setAttribute( 'x1', val );
      tick.setAttribute( 'x2', val );

      tick.setAttribute( 'y1', ( this.top ? 1 : -1 ) * this.tickPx1 * scaling );
      tick.setAttribute( 'y2', ( this.top ? 1 : -1 ) * this.tickPx2 * scaling );

      if ( label && this.options.primaryGrid ) {

        this.doGridLine( true, val, val, 0, this.graph.getDrawingHeight() );

      } else if ( !label && this.options.secondaryGrid ) {

        this.doGridLine( false, val, val, 0, this.graph.getDrawingHeight() );

      }

      if ( label ) {

        tick.setAttribute( 'stroke', this.getPrimaryTicksColor() );

      } else {

        tick.setAttribute( 'stroke', this.getSecondaryTicksColor() );

      }

      this.groupTicks.appendChild( tick );
      if ( label ) {
        var groupLabel = this.groupTickLabels;
        var tickLabel = document.createElementNS( this.graph.ns, 'text' );
        tickLabel.setAttribute( 'x', val );
        tickLabel.setAttribute( 'y', ( this.top ? -1 : 1 ) * ( ( this.options.tickPosition == 1 ? 8 : 20 ) + ( this.top ? 10 : 0 ) ) );
        tickLabel.setAttribute( 'text-anchor', 'middle' );

        if ( this.getTicksLabelColor() !== 'black' ) {
          tickLabel.setAttribute( 'fill', this.getTicksLabelColor() );
        }

        tickLabel.style.dominantBaseline = 'hanging';

        this.setTickContent( tickLabel, value, options );

        this.groupTickLabels.appendChild( tickLabel );
      }
      this.ticks.push( tick );

      return [ tick, tickLabel ];
    },

    drawSpecifics: function() {

      // Adjusts group shift
      //this.group.setAttribute('transform', 'translate(0 ' + this.getShift() + ')');

      // Place label correctly
      this.label.setAttribute( 'text-anchor', 'middle' );
      this.label.setAttribute( 'x', Math.abs( this.getMaxPx() - this.getMinPx() ) / 2 + this.getMinPx() );
      this.label.setAttribute( 'y', ( this.top ? -1 : 1 ) * ( ( this.options.tickPosition == 1 ? 10 : 15 ) + this.graph.options.fontSize ) );
      this.labelTspan.textContent = this.getLabel();

      this.line.setAttribute( 'x1', this.getMinPx() );
      this.line.setAttribute( 'x2', this.getMaxPx() );
      this.line.setAttribute( 'y1', 0 );
      this.line.setAttribute( 'y2', 0 );

      this.line.setAttribute( 'stroke', this.getAxisColor() );

      if ( !this.top ) {
        this.labelTspan.style.dominantBaseline = 'hanging';
        this.expTspan.style.dominantBaseline = 'hanging';
        this.expTspanExp.style.dominantBaseline = 'hanging';

        this.unitTspan.style.dominantBaseline = 'hanging';
        this.preunitTspan.style.dominantBaseline = 'hanging';

      }
    },

    _draw0Line: function( px ) {
      this._0line = document.createElementNS( this.graph.ns, 'line' );
      this._0line.setAttribute( 'x1', px );
      this._0line.setAttribute( 'x2', px );

      this._0line.setAttribute( 'y1', 0 );
      this._0line.setAttribute( 'y2', this.getMaxPx() );

      this._0line.setAttribute( 'stroke', 'black' );
      this.groupGrids.appendChild( this._0line );
    },

    handleMouseMoveLocal: function( x, y, e ) {
      x -= this.graph.getPaddingLeft();
      this.mouseVal = this.getVal( x );
    }

  } );

  return GraphXAxis;
} );