define( [ './graph.serie', '../graph.util' ], function( SerieNonInstanciable, util ) {

  "use strict";

  var hexChar = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" ];

  /** 
   * Serie line
   * @class SerieDensityMap
   * @example graph.newSerie( name, options, "line" );
   * @see Graph#newSerie
   * @augments Serie
   */
  function SerieDensityMap() {}

  SerieDensityMap.prototype = new SerieNonInstanciable();

  /**
   * Initializes the serie
   * @memberof SerieDensityMap
   */
  SerieDensityMap.prototype.init = function( graph, name, options ) {

    this.options = $.extend( true, {}, SerieDensityMap.prototype.defaults, ( options || {} ) ); // Creates options
    util.mapEventEmission( this.options, this ); // Register events

    this.graph = graph;
    this.groupMain = document.createElementNS( this.graph.ns, 'g' );

    this.rects = [];
    this.paths = [];
  };

  SerieDensityMap.prototype.setData = function( data ) {

    this.minX = this.maxX = this.minY = this.maxY = 0;
    var i = 0,
      l = data.length;
    this.data = data;
    for ( i = 0; i < l; i++ ) {
      this._checkX( data[ i ][ 0 ] );
      this._checkY( data[ i ][ 1 ] );
    }

    return this;

  }

  SerieDensityMap.prototype.calculateDensity = function( fromX, deltaX, numX, fromY, deltaY, numY ) {

    var densitymap = [],
      i,
      l = this.data.length,
      indexX, indexY;

    var binMin = Number.POSITIVE_INFINITY;
    var binMax = Number.NEGATIVE_INFINITY;

    for ( i = 0; i < l; i++ ) {
      indexX = Math.floor( ( this.data[ i ][ 0 ] - fromX ) / deltaX );
      indexY = Math.floor( ( this.data[ i ][ 1 ] - fromY ) / deltaY );

      if ( indexX > numX || indexY > numY ||  indexX < 0 ||  indexY < 0 ) {
        continue;
      }

      densitymap[ indexX ] = densitymap[ indexX ] || [];
      densitymap[ indexX ][ indexY ] = densitymap[ indexX ][ indexY ] + 1 ||  1;

      binMin = Math.min( binMin, densitymap[ indexX ][ indexY ] );
      binMax = Math.max( binMax, densitymap[ indexX ][ indexY ] );
    }

    this.maxIndexX = numX;
    this.maxIndexY = numY;

    this.binMin = binMin;
    this.binMax = binMax;

    this.deltaX = deltaX;
    this.deltaY = deltaY;

    this.fromX = fromX;
    this.fromY = fromY;

    this.numX = numX;
    this.numY = numY;

    this.densitymap = densitymap;
    return densitymap;
  }

  SerieDensityMap.prototype.autoBins = function( numX, numY ) {

    this.calculateDensity(
      this.minX, ( this.maxX - this.minX ) / numX, numX,
      this.minY, ( this.maxY - this.minY ) / numY, numY
    );
  }

  SerieDensityMap.prototype.colorMapHSV = function( fromColor, toColor, minBin, maxBin, numBins, method ) {

    minBin = minBin || 0;
    method = method || "linear";

    var methods = {
      "exp": function( value ) {
        return ( Math.exp( value ) - Math.exp( minBin ) ) / ( Math.exp( maxBin ) - Math.exp( minBin ) );
      },
      "linear": function( value ) {
        return ( value - minBin ) / ( maxBin - minBin );
      }
    }

    var k = 0,
      colorMap = [];

    var color = {
      h: null,
      s: null,
      v: null
    };
    var deltaBin = ( maxBin - minBin ) / ( numBins - 1 ),
      ratio;

    for ( var i = minBin; i <= maxBin; i += deltaBin ) {

      ratio = methods[ method ]( i );

      for ( var j in color ) {
        color[ j ] = ( toColor[ j ] - fromColor[ j ] ) * ratio + fromColor[ j ];
      }

      colorMap[ k ] = this.HSVtoRGB( color.h, color.s, color.v );
      k++;
    }

    this.colorMap = colorMap;
    this.colorMapMin = minBin;
    this.colorMapMax = maxBin;
    this.colorMapNum = numBins;
  }

  SerieDensityMap.prototype.autoColorMapHSV = function( fromColor, toColor, numBins ) {

    numBins = numBins ||  300;
    this.colorMapHSV( fromColor, toColor, this.binMin, this.binMax, numBins, "linear" );
  }

  SerieDensityMap.prototype.byteToHex = function( b ) {
    return hexChar[ ( b >> 4 ) & 0x0f ] + hexChar[ b & 0x0f ];
  }

  SerieDensityMap.prototype.HSVtoRGB = function( h, s, v ) {
    var r, g, b, i, f, p, q, t;
    if ( arguments.length === 1 ) {
      s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor( h * 6 );
    f = h * 6 - i;
    p = v * ( 1 - s );
    q = v * ( 1 - f * s );
    t = v * ( 1 - ( 1 - f ) * s );
    switch ( i % 6 ) {
      case 0:
        r = v, g = t, b = p;
        break;
      case 1:
        r = q, g = v, b = p;
        break;
      case 2:
        r = p, g = v, b = t;
        break;
      case 3:
        r = p, g = q, b = v;
        break;
      case 4:
        r = t, g = p, b = v;
        break;
      case 5:
        r = v, g = p, b = q;
        break;
    }
    return "#" + this.byteToHex( Math.floor( r * 255 ) ) + this.byteToHex( Math.floor( g * 255 ) ) + this.byteToHex( Math.floor( b * 255 ) );
  }

  SerieDensityMap.prototype.getColorIndex = function( value ) {

    return Math.floor( ( value - this.colorMapMin ) / ( this.colorMapMax - this.colorMapMin ) * this.colorMapNum );
  }

  SerieDensityMap.prototype.draw = function() {

    var colorIndex;

    var deltaXPx = this.getXAxis().getRelPx( this.deltaX ),
      deltaYPx = this.getYAxis().getRelPx( this.deltaY );

    for ( var i = 0; i < this.paths.length; i++ ) {
      this.paths[ i ] = "";
    }

    for ( var i = 0; i < this.maxIndexX; i++ ) {

      for ( var j = 0; j < this.maxIndexY; j++ ) {

        if ( this.densitymap[ i ][ j ] == "undefined" ) {
          continue;
        }

        colorIndex = this.getColorIndex( this.densitymap[ i ][ j ] );
        if ( !this.paths[ colorIndex ] ) {
          this.paths[ colorIndex ] = "";
        }
        this.paths[ colorIndex ] += " M " + this.getXAxis().getPx( i * this.deltaX + this.fromX ) + " " + this.getYAxis().getPx( j * this.deltaY + this.fromY ) + " h " + deltaXPx + " v " + deltaYPx + " h -" + deltaXPx + " z";

        ;
      }
    }
    /*
        this.maxIndexX = indexX;
        this.maxIndexY = indexY;*/

    this.drawRects();
  }

  SerieDensityMap.prototype.drawRects = function() {

    for ( var i = 0; i < this.paths.length; i++ ) {

      if ( !this.rects[ i ] ) {
        this.rects[ i ] = document.createElementNS( this.graph.ns, "path" );
      }

      if ( this.paths[ i ] ) {
        this.rects[ i ].setAttribute( 'd', this.paths[  i ] );
        this.rects[ i ].setAttribute( 'fill', this.colorMap[ i ] );
      }
      this.groupMain.appendChild( this.rects[ i ] );
    }
  }

  /**
   * @name SerieDensityMapDefaultOptions
   * @object
   * @static
   * @memberof SerieDensityMap
   */
  SerieDensityMap.prototype.defaults = {

  };

  /**
   * Sets the options of the serie
   * @see SerieDensityMapDefaultOptions
   * @param {Object} options - A object containing the options to set
   * @return {SerieDensityMap} The current serie
   * @memberof SerieDensityMap
   
*/
  SerieDensityMap.prototype.setOptions = function( options ) {
    this.options = $.extend( true, {}, SerieDensityMap.prototype.defaults, ( options || {} ) );
    // Unselected style

    return this;
  };

  return SerieDensityMap;
} );