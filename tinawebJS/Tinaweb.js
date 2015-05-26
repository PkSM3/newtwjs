// Function.prototype.index
(function(reComments, reParams, reNames) {
  Function.prototype.index = function(arrParamNames) {
    var fnMe = this;
    arrParamNames = arrParamNames
      || (((fnMe + '').replace(reComments, '')
           .match(reParams)[1] || '')
          .match(reNames) || []);
    return function(namedArgs) {
      var args = [], i = arrParamNames.length;
      args[i] = namedArgs;
      while(i--) {
        args[i] = namedArgs[arrParamNames[i]];
      }
      return fnMe.apply(this, args);
    };
  };
})(
  /\/\*[\s\S]*?\*\/|\/\/.*?[\r\n]/g,
  /\(([\s\S]*?)\)/,
  /[$\w]+/g
);

// for new SigmaUtils
function sigmaLimits( sigmacanvas ) {    
    pw=$( sigmacanvas ).width();
    ph=$( sigmacanvas ).height();
    
    sidebar=$('#leftcolumn').width();
    anchototal=$('#fixedtop').width();
    altototal=$('#leftcolumn').height();
    altofixtop=$('#fixedtop').height()
    altodeftop=$('#defaultop').height()
    $( sigmacanvas ).width(anchototal-sidebar);
    $( sigmacanvas ).height(altototal-altofixtop-altodeftop-4);
    
    pw=$( sigmacanvas ).width();
    ph=$( sigmacanvas ).height();
    return "new canvas! w:"+pw+" , h:"+ph;
}



SelectionEngine = function() {
    // Selection Engine!! finally...
    this.SelectorEngine_part01 = (function(cursorsize, area ) {
        var clickedNodes = []
        if(cursorsize>0) {
            clickedNodes = this.SelectThis2( area )
        } else {
            clickedNodes = partialGraph._core.graph.nodes.filter(function(n) {
                            return !!n['hover'];
                        }).map(function(n) {
                            return n.id;
                        });
        }
        return clickedNodes.map(Number);
    }).index();

    this.SelectorEngine_part02 = (function( addvalue , clicktype , prevsels , currsels ) {
        
        print("Add[]:")
        print(addvalue)
        print("clicktype:")
        print(clicktype)
        print("prevsels:")
        print(prevsels)
        print("currsels:")
        print(currsels)
        print(" - - - - - - ")

        var buffer = Object.keys(prevsels).map(Number).sort(this.sortNumber);
        var targeted = currsels.map(Number).sort(this.sortNumber);

        if(clicktype=="double" && targeted.length==0) return [];
        
        // if(targeted.length>0) {
        if(buffer.length>0) {
            if(JSON.stringify(buffer)==JSON.stringify(targeted)) {
                // this is just effective for Add[ ] ...
                // If previous selection is equal to the current one, you've nothing :D
                cancelSelection(false);
                return [];
            }
            var inter = this.intersect_safe(buffer,targeted)
            if(inter.length>0) {
                var blacklist = {} , whitelist = {};
                for(var i in inter) blacklist[inter[i]]=true;
                for(var i in buffer){
                    e = buffer[i]
                    if(!blacklist[e]) {
                        whitelist[e] = true;
                    }
                }
                for(var i in targeted){
                    e = targeted[i]
                    if(!blacklist[e]) {
                        whitelist[e] = true;
                    }
                }
                targeted = Object.keys(whitelist).map(Number);
            } else {// inter = 0 ==> click in other portion of the graph (!= current selection)
                // Union! 
                if(addvalue) {
                    targeted = targeted.concat(buffer.filter(function (item) {
                        return targeted.indexOf(item) < 0;
                    }));
                }
                return targeted; 
            }
        } else return targeted;
        // }

        return targeted;
    }).index();

    this.SelectorEngine = (function( cursorsize , area , addvalue , clicktype , prevsels , currsels ) {
        var targeted = []
        var buffer = Object.keys(prevsels).map(Number).sort(this.sortNumber);
        
        if( isUndef(currsels) ) { // bunch of nodes from a click in the map
            if(cursorsize>0) {
                targeted = this.SelectThis2( area )
            } else {
                targeted = partialGraph._core.graph.nodes.filter(function(n) {
                                return !!n['hover'];
                            }).map(function(n) {
                                return n.id;
                            });
            }
        } else { // OR one node from the tagcloud or a bunch of nodes from the searchbar
            currsels = currsels.map(Number).sort(this.sortNumber);
            if(addvalue) {
                targeted = currsels.concat(buffer.filter(function (item) {
                    return currsels.indexOf(item) < 0;
                }));
            } else targeted = currsels; 
            return targeted;
        }
        
        targeted = targeted.map(Number)

        if(clicktype=="double" && targeted.length==0) return [];
        
        targeted = targeted.sort(this.sortNumber);

        if(targeted.length>0) {
            if(buffer.length>0) {
                if(JSON.stringify(buffer)==JSON.stringify(targeted)) {
                    // this is just effective for Add[ ] ...
                    // If previous selection is equal to the current one, you've nothing :D
                    cancelSelection(false);
                    return [];
                }
                var inter = this.intersect_safe(buffer,targeted)
                if(inter.length>0) {
                    var blacklist = {} , whitelist = {};
                    for(var i in inter) blacklist[inter[i]]=true;
                    for(var i in buffer){
                        e = buffer[i]
                        if(!blacklist[e]) {
                            whitelist[e] = true;
                        }
                    }
                    for(var i in targeted){
                        e = targeted[i]
                        if(!blacklist[e]) {
                            whitelist[e] = true;
                        }
                    }
                    targeted = Object.keys(whitelist).map(Number);
                } else {// inter = 0 ==> click in other portion of the graph (!= current selection)
                    // Union! 
                    if(addvalue) {
                        targeted = targeted.concat(buffer.filter(function (item) {
                            return targeted.indexOf(item) < 0;
                        }));
                    }
                    return targeted; 
                }
            } else return targeted;
        }

        return targeted;
    }).index();

    this.search = function(string) {
        var id_node = '';
        var results = find(string)

        var coincd=[]
        for(var i in results) {
            coincd.push(results[i].id)
        }
        var targeted = SelectorEngine( {
                        addvalue:checkBox, 
                        clicktype:"simple", 
                        prevsels:selections,
                        currsels:coincd
                    } )
        if(targeted.length>0) {
            cancelSelection(false);
            MultipleSelection2(targeted);
        }
        partialGraph.draw();

        $("input#searchinput").val("");
        $("input#searchinput").autocomplete( "close" );
    }

    this.sortNumber = function(a,b) {
        return a - b;
    }

    this.intersect_safe = function(a, b) {
        var ai=0, bi=0;
        var result = new Array();

        while( ai < a.length && bi < b.length ) {
            if      (a[ai] < b[bi] ){ ai++; }
            else if (a[ai] > b[bi] ){ bi++; }
            else /* they're equal */ {
                result.push(a[ai]);
                ai++;
                bi++;
            }
        }
        return result;
    }

    this.SelectThis2 = function( area ) {
        var x1 = area.x1;
        var y1 = area.y1;

        //Multiple selection
        var counter=0;
        var actualSel=[];
        partialGraph.iterNodes(function(n){
            if(!n.hidden){
                distance = Math.sqrt(
                    Math.pow((x1-parseInt(n.displayX)),2) +
                    Math.pow((y1-parseInt(n.displayY)),2)
                    );
                if(parseInt(distance)<=cursor_size) {
                    counter++;
                    actualSel.push(n.id);                                
                }
            }
        });
        return actualSel;
    }

    this.MultipleSelection2 = (function(nodes,nodesDict,edgesDict) {

        pr("IN SelectionEngine.MultipleSelection2:")
        print(nodes)
        greyEverything(); 


        var typeNow = partialGraph.states.slice(-1)[0].type.map(Number).join("|")

        // Dictionaries of: selection+neighbors

        var nodes_2_colour = (nodesDict)? nodesDict : {};
        var edges_2_colour = (edgesDict)? edgesDict : {};

        selections = {}

        var ndsids=[]
        if(nodes) {
            if(! $.isArray(nodes)) ndsids.push(nodes);
            else ndsids=nodes;
            for(var i in ndsids) {
                s = ndsids[i];
                neigh = Relations[typeNow][s]
                if(neigh) {
                    for(var j in neigh) {
                        t = neigh[j]
                        nodes_2_colour[t]=false;
                        edges_2_colour[s+";"+t]=true;
                        edges_2_colour[t+";"+s]=true;
                    }
                }
            }
            for(var i in ndsids) {
                nodes_2_colour[ndsids[i]]=true;
                selections[ndsids[i]]=1; // to delete please
            }
        }

        for(var i in nodes_2_colour) {
            if(i) {
                n = partialGraph._core.graph.nodesIndex[i]
                if(n) {
                    n.color = n.attr['true_color'];
                    n.attr['grey'] = 0;
                    if(nodes_2_colour[i]) {
                        n.active = nodes_2_colour[i];
                        selections[i]=1
                    }
                }
            }
        }
        for(var i in edges_2_colour) {
            an_edge = partialGraph._core.graph.edgesIndex[i]
            if(!isUndef(an_edge) && !an_edge.hidden){
                an_edge.color = an_edge.attr['true_color'];
                an_edge.attr['grey'] = 0;
            }
        }


        var thenewsels = Object.keys(selections).map(Number)
        partialGraph.states.slice(-1)[0].selections = thenewsels;
        partialGraph.states.slice(-1)[0].setState( { sels: thenewsels} )

        overNodes=true; 

        partialGraph.draw();

        updateLeftPanel_fix();

        // RefreshState("")
    }).index()
};

TinaWebJS = function ( sigmacanvas ) {
    this.sigmacanvas = sigmacanvas;

    this.init = function () {
        print("hola mundo")
    }

    this.getSigmaCanvas = function () {
        return this.sigmacanvas;
    }

    this.AdjustSigmaCanvas = function ( sigmacanvas ) {
        var canvasdiv = "";
        if( sigmacanvas ) canvasdiv = sigmacanvas;
        else canvasdiv = this.sigmacanvas;

        return sigmaLimits( canvasdiv );
    }

    this.SearchListeners = function () {

        var SelInst = new SelectionEngine();

        $.ui.autocomplete.prototype._renderItem = function(ul, item) {
            var searchVal = $("#searchinput").val();
            var desc = extractContext(item.desc, searchVal);
            return $('<li onclick=\'var s = "'+item.label+'"; search(s);$("#searchinput").val(strSearchBar);\'></li>')
            .data('item.autocomplete', item)
            .append("<a><span class=\"labelresult\">" + item.label + "</span></a>" )
            .appendTo(ul);
        };

        $('input#searchinput').autocomplete({
            source: function(request, response) {
                print("in autocomplete:")
                print(labels.length)
                print(" - - - - - - - - - ")
                matches = [];
                var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                var results = $.grep(labels, function(e) {
                    return matcher.test(e.label); //|| matcher.test(e.desc);
                });
                
                if (!results.length) {
                    $("#noresults").text("Pas de résultats");
                } else {
                    $("#noresults").empty();
                }
                matches = results.slice(0, maxSearchResults);
                response(matches);
                
            },
            minLength: minLengthAutoComplete
        }); 
       
        $('#searchinput').bind('autocompleteopen', function(event, ui) {
            $(this).data('is_open',true);
        });
        $('#searchinput').bind('autocompleteclose', function(event, ui) {
            $(this).data('is_open',false);
        });
        $("#searchinput").focus(function () {
            if ($(this).val() == strSearchBar) {
                $(this).val('');
            }
        });
        $("#searchinput").blur(function () {
            if ($(this).val() == '') {
                $(this).val(strSearchBar);
            }
        });
        
        // i've a list of coincidences and i press enter like a boss >:D
        $("#searchinput").keydown(function (e) {
            if (e.keyCode == 13 && $("input#searchinput").data('is_open') === true) {
                // Search has several results and you pressed ENTER
                if(!is_empty(matches)) {                
                    var coincidences = []
                    for(j=0;j<matches.length;j++){
                        coincidences.push(matches[j].id)
                    }
                    $.doTimeout(30,function (){
                        var targeted = SelInst.SelectorEngine( {
                                        addvalue:checkBox, 
                                        clicktype:"double", 
                                        prevsels:selections,
                                        currsels:coincidences
                                    } )

                        // tricky stuff for simulating a multiple selection D:
                        // ... to be improved in the future ...
                        var prev_cursor_size = cursor_size;
                        if(targeted.length>0) {
                            cursor_size = (cursor_size==0)? 1 : cursor_size;
                            cancelSelection(false);
                            SelInst.MultipleSelection2({nodes:targeted});
                            cursor_size = prev_cursor_size;
                        }
                        partialGraph.draw();

                        $("input#searchinput").val("");
                        $("input#searchinput").autocomplete( "close" );
                    });
                    //$("input#searchinput").trigger('autocompleteclose');
                }
            }
        });
        
        // i was navigating (with the up|down) sur the coincidences-list and i pressed enter!
        $("#searchinput").keyup(function (e) {
            if (e.keyCode == 13 && $("input#searchinput").data('is_open') !== true) {
                var exfnd = exactfind( $("#searchinput").val() )
                if (exfnd!=null) {
                    pr("search KEY UP");
                    $.doTimeout(30,function (){

                            var targeted = SelInst.SelectorEngine( {
                                        addvalue:checkBox, 
                                        clicktype:"double", 
                                        prevsels:selections,
                                        currsels:[exfnd.id]
                                    } )
                            if(targeted.length>0) {
                                cancelSelection(false);
                                SelInst.MultipleSelection2({nodes:targeted});
                            }
                            partialGraph.draw();
                            
                            $("input#searchinput").val("");
                            $("input#searchinput").autocomplete( "close" );
                    });     
                }
            }
        });
    }

    this.initListeners = function (categories, partialGraph) {
        
        var SelInst = new SelectionEngine();

        $("#semLoader").hide();

        $("#closeloader").click();

        var body=document.getElementsByTagName('body')[0];
        body.style.paddingTop="41px";

        $('.etabs').click(function(){
            $.doTimeout(500,function () {
                $("#opossiteNodes").readmore({maxHeight:200}); 
                $("#sameNodes").readmore({maxHeight:200}); 
            });
        });

        $("#changetype").click(function(){
            pr("")
            pr(" ############  changeTYPE click");
            partialGraph.stopForceAtlas2();
            changeType();

            $.doTimeout(500,function (){
                $('.etabs a[href="#tabs1"]').trigger('click');
            });

            pr(" ############  / changeTYPE click");
            pr("")
        });

        $("#changelevel").click(function(){
            pr("")
            pr(" ############  changeLEVEL click");

            changeLevel();
            // $("#tabs1").click()

            pr(" ############  / changeLEVEL click");
            pr("")
        });

        //  ===  un/hide leftpanel  === //
        $("#aUnfold").click(function(e) {
            //SHOW leftcolumn
            sidebar = $("#leftcolumn");
            fullwidth=$('#fixedtop').width();
            e.preventDefault();
            // $("#wrapper").toggleClass("active");
            if(parseFloat(sidebar.css("right"))<0){            
                $("#aUnfold").attr("class","rightarrow"); 
                sidebar.animate({
                    "right" : sidebar.width()+"px"
                }, { duration: 400, queue: false }); 

                $("#ctlzoom").animate({
                        "right": (sidebar.width()+10)+"px"
                }, { duration: 400, queue: false }); 
                   
                // $('#sigma-example').width(fullwidth-sidebar.width());
                $('#sigma-example').animate({
                        "width": fullwidth-sidebar.width()+"px"
                }, { duration: 400, queue: false }); 
                setTimeout(function() {
                      partialGraph.resize();
                      partialGraph.refresh();
                }, 400);
            } 
            else {
                //HIDE leftcolumn
                $("#aUnfold").attr("class","leftarrow");
                sidebar.animate({
                    "right" : "-" + sidebar.width() + "px"
                }, { duration: 400, queue: false });

                $("#ctlzoom").animate({
                        "right": "0px"
                }, { duration: 400, queue: false }); 

                    // $('#sigma-example').width(fullwidth);
                $('#sigma-example').animate({
                        "width": fullwidth+"px"
                },{ duration: 400, queue: false });
                setTimeout(function() {
                      partialGraph.resize();
                      partialGraph.refresh();
                }, 400);   
            }   
        });

        startMiniMap();

        pushSWClick("social");

        cancelSelection(false);

        $("#tips").html(getTips());

        showMeSomeLabels(6);
        
        // updateDownNodeEvent(false);
        
        $("#saveAs").click(function() {        
            $('#savemodal').modal('show');
        });

        this.SearchListeners();

        // button CENTER
        $("#lensButton").click(function () {
            partialGraph.position(0,0,1);
            partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8);
            partialGraph.refresh();
            // partialGraph.startForceAtlas2();
        });

        $('#sigma-example').dblclick(function(event) {// using SelectionEngine
            var area = {}
            area.x1 = partialGraph._core.mousecaptor.mouseX;
            area.y1 = partialGraph._core.mousecaptor.mouseY;

            targeted = SelInst.SelectorEngine_part01({
                            cursorsize:cursor_size, 
                            area:area 
                        })
            
            if(targeted.length>0) {
                var finalSelection = SelInst.SelectorEngine_part02( { 
                                            addvalue:checkBox ,
                                            clicktype:(checkBox)?"simple":"double",
                                            prevsels:selections,
                                            currsels:targeted 
                                        }); 
                cancelSelection(false);
                SelInst.MultipleSelection2( {nodes:finalSelection} )

            } else cancelSelection(false);

            partialGraph.draw();
            trackMouse();
        });

        $("#sigma-example")
            .mousemove(function(){
                if(!isUndef(partialGraph)) {
                    if(cursor_size>0) trackMouse();
                }
            })
            .contextmenu(function(){
                return false;
            })
            .mousewheel(onGraphScroll)
            .mousedown(function(e) { // using SelectionEngine
                //left click!<- normal click
                if(e.which==1){
                    partialGraph.dispatch(
                        e['type'] == 'mousedown' ?
                        'downgraph' :
                        'upgraph'
                    );
                    var area = {}
                    area.x1 = partialGraph._core.mousecaptor.mouseX;
                    area.y1 = partialGraph._core.mousecaptor.mouseY;
                    var targeted = SelInst.SelectorEngine( {
                                        cursorsize:cursor_size, 
                                        area:area,
                                        addvalue:checkBox, 
                                        clicktype:"simple", 
                                        prevsels:selections
                                    } )
                    if(targeted.length>0) {
                        cancelSelection(false);
                        SelInst.MultipleSelection2( {nodes:targeted} )
                    }
                    partialGraph.draw();
                    trackMouse();
                }
            });

        $("#zoomSlider").slider({
            orientation: "vertical",
            value: partialGraph.position().ratio,
            min: sigmaJsMouseProperties.minRatio,
            max: sigmaJsMouseProperties.maxRatio,
            range: "min",
            step: 0.1,
            slide: function( event, ui ) {
                // pr("*******lalala***********")
                // pr(partialGraph.position().ratio)
                // pr(sigmaJsMouseProperties.minRatio)
                // pr(sigmaJsMouseProperties.maxRatio)
                partialGraph.zoomTo(
                    partialGraph._core.width / 2, 
                    partialGraph._core.height / 2, 
                    ui.value);
            }
        });

        $("#zoomPlusButton").click(function () {
            partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, partialGraph._core.mousecaptor.ratio * 1.5);
            $("#zoomSlider").slider("value",partialGraph.position().ratio);
            return false;
        });

        $("#zoomMinusButton").click(function () {
            partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, partialGraph._core.mousecaptor.ratio * 0.5);
            $("#zoomSlider").slider("value",partialGraph.position().ratio);
            return false;
        });

        $("#edgesButton").click(function () {
            fa2enabled=true;
            if(!isUndef(partialGraph.forceatlas2)) {

                if(partialGraph.forceatlas2.active) {
                    partialGraph.stopForceAtlas2();
                    partialGraph.draw();
                    return;
                } else {
                    partialGraph.startForceAtlas2();
                    return;
                }

            } else {
                partialGraph.startForceAtlas2();
                return;
            } 
        });


        NodeWeightFilter ( categories , "#slidercat0nodesweight" ,  categories[0],  "type" ,"size");

        EdgeWeightFilter("#slidercat0edgesweight", "label" , "nodes1", "weight");

        $("#category1").hide();

        //finished
        $("#slidercat0nodessize").freshslider({
            step:1,
            min:1,
            max:25,
            value:1,
            bgcolor:"#27c470",
            onchange:function(value){
                $.doTimeout(100,function (){
                       partialGraph.iterNodes(function (n) {
                           if(Nodes[n.id].type==catSoc) {
                               n.size = parseFloat(Nodes[n.id].size) + parseFloat((value-1))*0.3;
                               sizeMult[catSoc] = parseFloat(value-1)*0.3;
                           }
                       });
                       partialGraph.draw();
                });
            }
        }); 

        //finished
        $("#slidercat1nodessize").freshslider({
            step:1,
            min:1,
            max:25,
            value:1,
            bgcolor:"#FFA500",
            onchange:function(value){
                $.doTimeout(100,function (){
                       partialGraph.iterNodes(function (n) {
                           if(Nodes[n.id].type==catSem) {
                               n.size = parseFloat(Nodes[n.id].size) + parseFloat((value-1))*0.3;
                               sizeMult[catSem] = parseFloat(value-1)*0.3;
                           }
                       });
                       partialGraph.draw();
                });
            }
        }); 

        //finished
        $("#unranged-value").freshslider({
            step: 1,
            min:cursor_size_min,
            max:cursor_size_max,
            value:cursor_size,
            onchange:function(value){
                // console.log("en cursorsize: "+value);
                cursor_size=value;
                if(cursor_size==0) partialGraph.draw();
            }
        });

        if( categories.length==1 ) {
            $("#changetype").hide();
            $("#taboppos").remove();
            $.doTimeout(500,function () {
                $('.etabs a[href="#tabs2"]').trigger('click');
            });
        }
    }

};

