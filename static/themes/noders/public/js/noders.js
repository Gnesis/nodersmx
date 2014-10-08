(function() {

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function polygon( pos, rad, color, sides ) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
            _this.sides = sides || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            if (_this.sides < 3) return;

            var a = (Math.PI * 2) / _this.sides;
            var i = 1;

            ctx.save();
            ctx.translate( _this.pos.x, _this.pos.y );
            ctx.rotate( 100 );
            ctx.moveTo( _this.radius, 0 );
            for (; i < _this.sides; i++) {
                ctx.lineTo( _this.radius*Math.cos( a*i ), _this.radius*Math.sin( a*i ) );
            }
            ctx.fillStyle = 'rgba('+color+','+ _this.active+')';
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        };
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width/2, y: height/2};

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for( var x = 0; x < width; x = x + width/18 ) {
            for( var y = 0; y < height; y = y + height/18 ) {
                var px = x + Math.random()*width/16;
                var py = y + Math.random()*height/16;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if( !placed ) {
                            if( closest[k] == undefined ) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 5; k++) {
                        if( !placed ) {
                            if( getDistance(p1, p2) < getDistance(p1, closest[k]) ) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a node to each point
        for(var i in points) {
            var c = new polygon( points[i], ( 2+Math.random()*2 ) * 1.7, '123,207,40', 6);
            points[i].node = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            //window.addEventListener('mousemove', mouseMove);
        }
        //window.addEventListener('scroll', scrollCheck);
        //window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 0;
        if ( e.pageX || e.pageY ) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if ( e.clientX || e.clientY )    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.y = ( target.y >  window.innerHeight ) ? window.innerHeight : posy;
        target.x = posx;
    }

    function scrollCheck() {
        if( document.body.scrollTop > height ) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for( var i in points ) {
            shiftPoint( points[i] );
        }
    }

    function animate() {
        if( animateHeader ) {
            ctx.clearRect( 0, 0, width, height );
            for(var i in points) {
                // detect points in range
                if( Math.abs( getDistance( target, points[i]) ) < 4000) {
                    points[i].active = 0.3;
                    points[i].node.active = 0.6;
                } else if( Math.abs( getDistance( target, points[i] ) ) < 20000) {
                    points[i].active = 0.1;
                    points[i].node.active = 0.3;
                } else if( Math.abs( getDistance( target, points[i] ) ) < 40000) {
                    points[i].active = 0.02;
                    points[i].node.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].node.active = 0;
                }

                drawLines(points[i]);
                points[i].node.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to( p, 1+1*Math.random(), {
            x: p.originX-50+Math.random()*100,
            y: p.originY-50+Math.random()*100,
            ease: Circ.easeInOut,
            onComplete: function() {
                shiftPoint( p );
            }
        });
    }

    // Canvas manipulation
    function drawLines(p) {
        if( !p.active ) return;
        for( var i in p.closest ) {
            ctx.beginPath();
            ctx.moveTo( p.x, p.y );
            ctx.lineTo( p.closest[i].x, p.closest[i].y );
            ctx.strokeStyle = 'rgba(123,207,40,'+ p.active+')';
            ctx.stroke();
        }
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow( p1.x - p2.x, 2 ) + Math.pow( p1.y - p2.y, 2 );
    }

    var animate_dash = function ( path, time ){
        var length = path.getTotalLength();
        path.style.strokeWidth = '1';
        path.style.transition = path.style.WebkitTransition = 'none';
        path.style.strokeDasharray = length + ' ' + length;
        path.style.strokeDashoffset = length;

        path.getBoundingClientRect();
        path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + time + ' ease-in-out';
        path.style.strokeDashoffset = '0';
    };

    var animate_fill = function ( path, time, color ){
        path.getBoundingClientRect();
        path.style.strokeWidth = '0';
        path.style.transition = path.style.WebkitTransition = 'fill ' + time + ' ease-in-out';
        path.style.fill = color;
    };

    animate_dash( document.querySelector('#noders .letter_nde'), '5s' );
    animate_dash( document.querySelector('#noders .letter_o'), '3s' );
    animate_dash( document.querySelector('#noders .letter_r'), '2.5s' );
    animate_dash( document.querySelector('#noders .letter_s_1'), '2s' );
    animate_dash( document.querySelector('#noders .letter_s_2'), '2s' );

    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_nde'), '0', '#ffffff' ); } , 2500 );
    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_o'), '0', '#8EC74E' ); } , 2500 );
    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_r'), '0', '#ffffff' ); } , 2500 );
    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_s_1'), '0', '#ffffff' ); } , 2500 );
    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_s_2'), '0', '#8EC74E' ); } , 2500 );

    var map_style = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#b5cbe4"}]},{"featureType":"landscape","stylers":[{"color":"#efefef"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#83a5b0"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#bdcdd3"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e3eed3"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
    var map_center = new google.maps.LatLng( 19.4128709,-99.1664372 );
    
    var map_options = {
        zoom: 16,
        zoomControl: true,
        panControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        center: map_center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: map_style
    };
    var map = new google.maps.Map( document.getElementById('place_map'), map_options );

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng( 19.41309,-99.16531 ),
        map: map,
        icon: '/static/img/marker_map.png',
        flat: true
    });


})();