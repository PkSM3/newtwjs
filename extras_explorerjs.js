/*
 * Customize as you want ;)
 */


function newPopup(url) {
	popupWindow = window.open(url,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no')
}


// Execution:    ChangeGraphAppearanceByAtt( true )
// It scans the existing node-attributes and t keeps only those which are Numeric.
//  then, add the button in the html with the sigmaUtils.clustersBy(x) listener.
function ChangeGraphAppearanceByAtt( manualflag ) {

    if ( !isUndef(manualflag) && !colorByAtt ) colorByAtt = manualflag;
    if(!colorByAtt) return;

    // Seeing all the possible attributes!
    var AttsDict = {}    
    var Atts_2_Exclude = {}
    var v_nodes = getVisibleNodes();
    for (var i in v_nodes) {
        if(!v_nodes[i].hidden) {

            var id = v_nodes[i].id;

            for(var a in Nodes[id].attributes) {
                var someatt = Nodes[id].attributes[a]

                // Identifying the attribute datatype: exclude strings and objects
                if ( ( typeof(someatt)=="string" && isNaN(Number(someatt)) ) || typeof(someatt)=="object" ) {
                    if (!Atts_2_Exclude[a]) Atts_2_Exclude[a]=0;
                    Atts_2_Exclude[a]++;
                } 
            }

            var possible_atts = [];
            if (!isUndef(Nodes[id].attributes)) 
                possible_atts = Object.keys(Nodes[id].attributes)

            if(!isUndef(v_nodes[i].degree))
                possible_atts.push("degree")
            possible_atts.push("clust_louvain")

            for(var a in possible_atts){
                if ( !AttsDict[ possible_atts[a] ] ) 
                    AttsDict[ possible_atts[a] ] = 0
                AttsDict[ possible_atts[a] ] ++;
            } 
            
        }
    }

    for(var i in Atts_2_Exclude) 
        delete AttsDict[i];

    var AttsDict_sorted = ArraySortByValue(AttsDict, function(a,b){
        return b-a
    });

    // console.log( "I AM IN ChangeGraphAppearanceByAtt( true )" )
    // console.log( AttsDict_sorted )


    var div_info = "";            

    if( $( ".colorgraph_div" ).length>0 )          
        div_info += '<ul id="colorGraph" class="nav navbar-nav navbar-right">'

    div_info += ' <li class="dropdown">'
    div_info += '<a href="#" class="dropdown-toggle" data-toggle="dropdown">'
    div_info += '        <img title="Set Colors" src="libs/img2/colors.png" width="20px"><b class="caret"></b></img>'
    div_info += '</a>'
    div_info += '  <ul class="dropdown-menu">'

    for (var i in AttsDict_sorted) {
        var att_s = AttsDict_sorted[i].key;
        var att_c = AttsDict_sorted[i].value;
        var the_method = "clustersBy"
        if(att_s.indexOf("clust")>-1) the_method = "colorsBy"
        div_info += '<li><a href="#" onclick=\''+the_method+'("'+att_s+'")\'>By '+att_s+'('+att_c+')'+'</a></li>'
        pr('<li><a href="#" onclick=\''+the_method+'("'+att_s+'")\'>By '+att_s+'('+att_c+')'+'</a></li>')
    }
    div_info += '  </ul>'
    div_info += ' </li>'

    console.log('$( ".colorgraph_div" ).length')
    console.log($( ".colorgraph_div" ).length)
    if( $( ".colorgraph_div" ).length>0 )   {
        div_info += '</ul>'
        $( div_info ).insertAfter(".colorgraph_div");
        $( ".colorgraph_div" ).remove();
    } else {
        $("#colorGraph").html(div_info)
    }
}


function RunLouvain() {

  var node_realdata = []
  var nodesV = getVisibleNodes()
  for(var n in nodesV)
    node_realdata.push( nodesV[n].id )

  var edge_realdata = []
  var edgesV = getVisibleEdges()
  for(var e in edgesV) {
    var st = edgesV[e].id.split(";")
    var info = {
        "source":st[0],
        "target":st[1],
        "weight":edgesV[e].weight
    }
    edge_realdata.push(info)
  }
    var community = jLouvain().nodes(node_realdata).edges(edge_realdata);  
    var results = community();
    for(var i in results)
        Nodes[i].attributes["clust_louvain"]=results[i]
}


function SomeEffect( ClusterCode ) {
    console.log( ClusterCode )

    var raw = ClusterCode.split("||")
    var Type=raw[0], Cluster=raw[1], clstID=Number(raw[2]);

    var present = partialGraph.states.slice(-1)[0]; // Last
    var type_t0 = present.type;    
    var str_type_t0 = type_t0.map(Number).join("|")
    console.log( "\t"+str_type_t0)


    greyEverything();

    var nodes_2_colour = {};
    var edges_2_colour = {};

    var nodesV = getVisibleNodes()
    for(var i in nodesV) {
        var n = nodesV[i]
        n.forceLabel = false;
        var node = Nodes[n.id]
        if ( node.type==Type && !isUndef(node.attributes[Cluster]) && node.attributes[Cluster]==clstID ) {
            // pr( n.id + " | " + Cluster + " : " + node.attributes[Cluster] )
            nodes_2_colour[n.id] = n.degree;
        }
    }


    for(var s in nodes_2_colour) {
        if(Relations[str_type_t0] && Relations[str_type_t0][s] ) {
            neigh = Relations[str_type_t0][s]
            if(neigh) {
                for(var j in neigh) {
                    t = neigh[j]
                    if( !isUndef(nodes_2_colour[t]) ) {
                        edges_2_colour[s+";"+t]=true;
                        edges_2_colour[t+";"+s]=true;
                    }
                }
            }
        }
    }


    for(var i in nodes_2_colour) {
        n = partialGraph._core.graph.nodesIndex[i]
        if(n) {
            n.color = n.attr['true_color'];
            n.attr['grey'] = 0;
        }
    }


    for(var i in edges_2_colour) {
        an_edge = partialGraph._core.graph.edgesIndex[i]
        if(!isUndef(an_edge) && !an_edge.hidden){
            // pr(an_edge)
            an_edge.color = an_edge.attr['true_color'];
            an_edge.attr['grey'] = 0;
        }
    }





    var nodes_2_label = ArraySortByValue(nodes_2_colour, function(a,b){
        return b-a
    });

    for(var n in nodes_2_label) {
        if(n==4) 
            break
        var ID = nodes_2_label[n].key
        partialGraph._core.graph.nodesIndex[ID].forceLabel = true;
    }



    overNodes=true;
    partialGraph.draw()
}


function set_ClustersLegend ( daclass ) {
    //partialGraph.states.slice(-1)[0].LouvainFait = true

    $("#legend_for_clusters").removeClass( "my-legend" )
    $("#legend_for_clusters").html("")

    var ClustNB_CurrentColor = {}
    var nodesV = getVisibleNodes()
    for(var i in nodesV) {
        n = nodesV[i]
        color = n.color
        type = Nodes[n.id].type
        clstNB = Nodes[n.id].attributes[daclass]
        ClustNB_CurrentColor[type+"||"+daclass+"||"+clstNB] = color
    }

    LegendDiv = ""
    LegendDiv += '    <div class="legend-title">Map Legend</div>'
    LegendDiv += '    <div class="legend-scale">'
    LegendDiv += '      <ul class="legend-labels">'

    if (daclass=="clust_louvain")
        daclass = "louvain"
    OrderedClustDicts = Object.keys(ClustNB_CurrentColor).sort()
    if( daclass.indexOf("clust")>-1 ) {
        for(var i in OrderedClustDicts) {
            var IDx = OrderedClustDicts[i]
            var raw = IDx.split("||")
            var Type = raw[0]
            var ClustType = raw[1]
            var ClustID = raw[2]
            var Color = ClustNB_CurrentColor[IDx]
            pr ( Color+" : "+ Clusters[Type][ClustType][ClustID] )
            var ColorDiv = '<span style="background:'+Color+';"></span>'
            LegendDiv += '<li onclick=\'SomeEffect("'+IDx+'")\'>'+ColorDiv+ Clusters[Type][ClustType][ClustID]+"</li>"+"\n"
        }
    } else {
        for(var i in OrderedClustDicts) {
            var IDx = OrderedClustDicts[i]
            var Color = ClustNB_CurrentColor[IDx]
            // pr ( Color+" : "+ Clusters[Type][ClustType][ClustID] )
            var ColorDiv = '<span style="background:'+Color+';"></span>'
            LegendDiv += '<li onclick=\'SomeEffect("'+IDx+'")\'>'+ColorDiv+ IDx+"</li>"+"\n"
        }

    }
    LegendDiv += '      </ul>'
    LegendDiv += '    </div>'
    

    $("#legend_for_clusters").addClass( "my-legend" );
    $("#legend_for_clusters").html( LegendDiv )
}


//For CNRS
function getTopPapers(type){
    if(getAdditionalInfo){
        jsonparams=JSON.stringify(getSelections());
        bi=(Object.keys(categories).length==2)?1:0;
        //jsonparams = jsonparams.replaceAll("&","__and__");
        jsonparams = jsonparams.split('&').join('__and__');
        //dbsPaths.push(getGlobalDBs());
        thisgexf=JSON.stringify(decodeURIComponent(getUrlParam.file));
        image='<img style="display:block; margin: 0px auto;" src="'+APINAME+'img/ajax-loader.gif"></img>';
        $("#tab-container-top").show();
        $("#topPapers").show();
        $("#topPapers").html(image);
        $.ajax({
            type: 'GET',
            url: APINAME+'info_div.php',
            data: "type="+type+"&bi="+bi+"&query="+jsonparams+"&gexf="+thisgexf+"&index="+field[getUrlParam.file],
            //contentType: "application/json",
            //dataType: 'json',
            success : function(data){ 
                pr(APINAME+'info_div.php?'+"type="+type+"&bi="+bi+"&query="+jsonparams+"&gexf="+thisgexf+"&index="+field[getUrlParam.file]);
                $("#topPapers").html(data);
            },
            error: function(){ 
                pr('Page Not found: getTopPapers');
            }
        });
    }
}


//FOR UNI-PARTITE
function selectionUni(currentNode){
    pr("\tin selectionUni:"+currentNode.id);
    if(checkBox==false && cursor_size==0) {
        highlightSelectedNodes(false);
        opossites = [];
        selections = [];
        partialGraph.refresh();
    }   
    
    if((typeof selections[currentNode.id])=="undefined"){
        selections[currentNode.id] = 1;
        currentNode.active=true;
    }
    else {
        delete selections[currentNode.id];               
        currentNode.active=false;
    }
    //highlightOpossites(nodes1[currentNode.id].neighbours);
    //        currentNode.color = currentNode.attr['true_color'];
    //        currentNode.attr['grey'] = 0;
    //        
    //
   

    partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8);
    partialGraph.refresh();
}

//JUST ADEME
function camaraButton(){
    $("#PhotoGraph").click(function (){
        
        //canvas=partialGraph._core.domElements.nodes;
        
        
        
        var nodesCtx = partialGraph._core.domElements.nodes;
        /*
        var edgesCtx = document.getElementById("sigma_edges_1").getContext('2d');
        
        var edgesImg = edgesCtx.getImageData(0, 0, document.getElementById("sigma_edges_1").width, document.getElementById("sigma_edges_1").height)
        
        nodesCtx.putImageData(edgesImg,0,0);
        
        
        
        
        //ctx.drawImage(partialGraph._core.domElements.edges,0,0)
        //var oCanvas = ctx;  
  */
        //div = document.getElementById("sigma_nodes_1").getContext('2d');
        //ctx = div.getContext("2d");
        //oCanvas.drawImage(partialGraph._core.domElements.edges,0,0);
        Canvas2Image.saveAsPNG(nodesCtx);
        
        /*
        Canvas2Image.saveAsJPEG(oCanvas); // will prompt the user to save the image as JPEG.   
        // Only supported by Firefox.  
  
        Canvas2Image.saveAsBMP(oCanvas);  // will prompt the user to save the image as BMP.  
  
  
        // returns an <img> element containing the converted PNG image  
        var oImgPNG = Canvas2Image.saveAsPNG(oCanvas, true);     
  
        // returns an <img> element containing the converted JPEG image (Only supported by Firefox)  
        var oImgJPEG = Canvas2Image.saveAsJPEG(oCanvas, true);   
                                                         
        // returns an <img> element containing the converted BMP image  
        var oImgBMP = Canvas2Image.saveAsBMP(oCanvas, true);   
  
  
        // all the functions also takes width and height arguments.   
        // These can be used to scale the resulting image:  
  
        // saves a PNG image scaled to 100x100  
        Canvas2Image.saveAsPNG(oCanvas, false, 100, 100);  
        */
    });
}

function getTips(){   
    param='';

    text = 
        "<br>"+
        "Basic Interactions:"+
        "<ul>"+
        "<li>Click on a node to select/unselect and get its information. In case of multiple selection, the button unselect clears all selections.</li>"+
        "<li>The switch button switch allows to change the view type.</li>"+
        "</ul>"+
        "<br>"+
        "Graph manipulation:"+
        "<ul>"+
        "<li>Link and node sizes indicate their strength.</li>"+
        "<li>To fold/unfold the graph (keep only strong links or weak links), use the 'edges filter' sliders.</li>"+
        "<li>To select a more of less specific area of the graph, use the 'nodes filter' slider.</li>"+
        "</ul>"+
        "<br>"+
        "Micro/Macro view:"+
        "<ul>"+
        "<li>To explore the neighborhood of a selection, either double click on the selected nodes, either click on the macro/meso level button. Zoom out in meso view return to macro view.</li>"+
        "<li>Click on the 'all nodes' tab below to view the full clickable list of nodes.</li>"+
        "</ul>";
        
    $("#tab-container").hide();
    $("#tab-container-top").hide();
    return text;
}



function draw1Circle(ctx , x , y , color) {    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}


function trackMouse() {
    if(!shift_key) {
        // $.doTimeout(300,function (){
            var ctx = partialGraph._core.domElements.mouse.getContext('2d');
            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, partialGraph._core.domElements.nodes.width, partialGraph._core.domElements.nodes.height);

            x = partialGraph._core.mousecaptor.mouseX;
            y = partialGraph._core.mousecaptor.mouseY;
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.fillStyle = "#71C3FF";
            ctx.globalAlpha = 0.5;  
            ctx.beginPath();
            
            if(partialGraph._core.mousecaptor.ratio>showLabelsIfZoom){
                for(var i in partialGraph._core.graph.nodesIndex){
                        n=partialGraph._core.graph.nodesIndex[i];
                        if(n.hidden==false){
                            distance = Math.sqrt(
                                Math.pow((x-parseInt(n.displayX)),2) +
                                Math.pow((y-parseInt(n.displayY)),2)
                                );
                            if(parseInt(distance)<=cursor_size) {
                                partialGraph._core.graph.nodesIndex[i].forceLabel=true;
                            } else {
                                if(typeof(n.neighbour)!=="undefined") {
                                    if(!n.neighbour) partialGraph._core.graph.nodesIndex[i].forceLabel=false;
                                } else partialGraph._core.graph.nodesIndex[i].forceLabel=false;
                            }
                        }
                }
                if(partialGraph.forceatlas2 && partialGraph.forceatlas2.count<=1) {
                    partialGraph.draw(2,2,2);
                }
            } else {
                for(var i in partialGraph._core.graph.nodesIndex){
                    n=partialGraph._core.graph.nodesIndex[i];
                    if(!n.hidden){
                        partialGraph._core.graph.nodesIndex[i].forceLabel=false;
                        if(typeof(n.neighbour)!=="undefined") {
                            if(!n.neighbour) partialGraph._core.graph.nodesIndex[i].forceLabel=false;
                            else partialGraph._core.graph.nodesIndex[i].forceLabel=true;
                        } else partialGraph._core.graph.nodesIndex[i].forceLabel=false;
                    }
                }
                if(partialGraph.forceatlas2 && partialGraph.forceatlas2.count<=1) {
                    partialGraph.draw(2,2,2);
                }
            }          
            ctx.arc(x, y, cursor_size, 0, Math.PI * 2, true);
            //ctx.arc(partialGraph._core.width/2, partialGraph._core.height/2, 4, 0, 2 * Math.PI, true);/*todel*/
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        // });
    }
}


//both obsolete
function closeDialog () {
    $('#windowTitleDialog').modal('hide'); 
}
function okClicked () {
    //document.title = document.getElementById ("xlInput").value;
    closeDialog ();
}
