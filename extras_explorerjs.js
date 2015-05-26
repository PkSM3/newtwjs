/*
 * Customize as you want ;)
 */


function newPopup(url) {
	popupWindow = window.open(url,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no')
}


function callGeomapADEME(){
    db=getCurrentDBforCurrentGexf();
    db=JSON.stringify(db);
    if(is_empty(selections)){
        jsonparams='["all"]';
    } else {
        jsonparams=JSON.stringify(getSelections());
        jsonparams = jsonparams.split('&').join('__and__');
    }    
    pr('in callGeomap: db='+db+'&query='+jsonparams);
    initiateMap(db,jsonparams,"geomap/");
}

function callGeomap(){
    db=JSON.stringify('community.db');
    if(is_empty(selections)){
        // jsonparams='["all"]';
        jsonparams='["unique_id"]&unique_id='+egonode[getUrlParam.nodeidparam];
    } else {

        N=getNodesByAtt(catSoc).length;

        nodesA = []
        nodesB = []
        socneigh = []
        for(var i in selections) {
            if(Nodes[i].type==catSoc) nodesA.push(i);
            if(Nodes[i].type==catSem) nodesB.push(i);
        }

        if(nodesA.length==0 && nodesB.length>0) socneigh = getArrSubkeys(opos,"key");
        if(nodesA.length>0 && nodesB.length>0) socneigh = getNeighs(nodesB,bipartiteN2D);

        kSels = {}

        for(var i in nodesA) {
            kSels[nodesA[i]] = 1;
        }
        for(var i in socneigh) {
            kSels[socneigh[i]] = 1;
        }

        k=Object.keys(kSels).length;

        // cats=(categoriesIndex.length);
        // arr={};
        // if(cats==2 && swclickActual=="social") {
        //     N=Object.keys(partialGraph._core.graph.nodes.filter(function(n){return n.type==catSoc})).length;
        //     arr=nodes1;
        // }
        // if(cats==2 && swclickActual=="semantic") {
        //     N=Object.keys(partialGraph._core.graph.nodes.filter(function(n){return n.type==catSem})).length;
        //     arr=nodes2;
        // }
        // if(cats==1)
        //     N=Object.keys(Nodes).length;
    
        // temp=getNeighs(Object.keys(selections),arr);
        // sel_plus_neigh=Object.keys(temp);
        // k=sel_plus_neigh.length;
        // // if(N==k) jsonparams='["all"]';
        pr ("N: "+N+" -  k: "+k)
        if(N==k) jsonparams='["unique_id"]&unique_id='+getUrlParam.nodeidparam;
        else jsonparams=JSON.stringify(Object.keys(kSels));
        
        //jsonparams=JSON.stringify(getSelections());
        //jsonparams = jsonparams.split('&').join('__and__');
    }
    pr('in callGeomap: db='+db+'&query='+jsonparams);
    initiateMap(db,jsonparams,"geomap2/");
    // $("#ctlzoom").hide();
    // $("#CurrentView").hide();
}

function clickInCountry( CC ) {
    // pr("in extras.js: you've clicked "+CC)
    var results = []
    
    for(var i in Nodes) {
        if( !isUndef(Nodes[i].CC) && Nodes[i].CC==CC) results.push(i)
    }

    $.doTimeout(20,function (){

        if(swclickActual=="social") {
            MultipleSelection(results , false); //false-> dont apply deselection algorithm
            return;
        }

        if(swclickActual=="semantic") {
            var oposresults = getNeighs2( results , bipartiteD2N );
            MultipleSelection(oposresults , false);
            return;
        }

    });
}

function callTWJS(){
    //    db=getCurrentDBforCurrentGexf();
    //    db=JSON.stringify(db);
    //    if(is_empty(selections)){
    //        jsonparams='["all"]';
    //    } else {
    //        jsonparams=JSON.stringify(getSelections());
    //        jsonparams = jsonparams.split('&').join('__and__');
    //    }    
    //    pr('in callGeomap: db='+db+'&query='+jsonparams);
    //    initiateMap(db,jsonparams,"geomap/"); //From GEOMAP submod
    $("#ctlzoom").show();
    $("#CurrentView").show();
}

function selectionToMap(){
    db=getCurrentDBforCurrentGexf();
    db=JSON.stringify(db);
    param='geomap/?db='+db+'';
    if(is_empty(selections)){
        newPopup('geomap/?db='+db+'&query=["all"]');
    } else {
        pr("selection to geomap:");
        jsonparams=JSON.stringify(getSelections());
        jsonparams = jsonparams.split('&').join('__and__');
        pr('geomap/?db='+db+'&query='+jsonparams);
        newPopup('geomap/?db='+db+'&query='+jsonparams);
    }
}

//DataFolderMode
function getCurrentDBforCurrentGexf(){
    folderID=dataFolderTree["gexf_idfolder"][decodeURIComponent(getUrlParam.file)];
    dbsRaw = dataFolderTree["folders"][folderID];
    dbsPaths=[];
    for(var i in dbsRaw){
        dbs = dbsRaw[i]["dbs"];
        for(var j in dbs){
            dbsPaths.push(i+"/"+dbs[j]);
        }
        break;
    }
    return dbsPaths;
}

//DataFolderMode
function getGlobalDBs(){
    graphdb=dataFolderTree["folders"];
    for(var i in graphdb){
        for(var j in graphdb[i]){
            if(j=="data") {
                maindbs=graphdb[i][j]["dbs"];
                for(var k in maindbs){
                    return jsonparams+"/"+maindbs[k];
                }
            }
        }
    }
}

//DataFolderMode
function getTopPapers_old(type){
    if(getAdditionalInfo){
        jsonparams=JSON.stringify(getSelections());
        //jsonparams = jsonparams.replaceAll("&","__and__");
        jsonparams = jsonparams.split('&').join('__and__');
        dbsPaths=getCurrentDBforCurrentGexf();
        //dbsPaths.push(getGlobalDBs());
        dbsPaths=JSON.stringify(dbsPaths);
        thisgexf=JSON.stringify(decodeURIComponent(getUrlParam.file));
        image='<img style="display:block; margin: 0px auto;" src="'+'API_pasteur/img/ajax-loader.gif"></img>';
        $("#topPapers").show();
        $("#topPapers").html(image);
        $.ajax({
            type: 'GET',
            url: 'API_pasteur/info_div.php',
            data: "type="+type+"&bi="+bi+"&query="+jsonparams+"&dbs="+dbsPaths+"&gexf="+thisgexf,
            //contentType: "application/json",
            //dataType: 'json',
            success : function(data){ 
                pr('API_pasteur/info_div.php?'+"type="+type+"&bi="+bi+"&query="+jsonparams+"&gexf="+thisgexf+"&index="+field[thisgexf]);
                $("#topPapers").html(data);
                $("#topPapers").show();
            },
            error: function(){ 
                pr('Page Not found: getTopPapers()');
            }
        });
    }
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




    var div_info = "";                      
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
        if(att_s.indexOf("cluster")>-1) the_method = "colorsBy"
        div_info += '<li><a href="#" onclick=\''+the_method+'("'+att_s+'")\'>By '+att_s+'('+att_c+')'+'</a></li>'
        pr('<li><a href="#" onclick=\''+the_method+'("'+att_s+'")\'>By '+att_s+'('+att_c+')'+'</a></li>')
    }
    div_info += '  </ul>'
    div_info += ' </li>'
    div_info += '</ul>'

    $( div_info ).insertAfter(".colorgraph_div");
    $( ".colorgraph_div" ).remove();
}











var Frecs = []
var Frecs_Color = {}
var Frecs_Size = {}

function TwitterTimeSlider( manualflag ) {
    //twittertimeslider_div
    if ( !isUndef(manualflag) && !twittertimeline ) twittertimeline = manualflag;
    if(!twittertimeline) return;

    console.log("now im in twittertimeline: "+twittertimeline)


    //     [ HTML and Libraries Stuff ]
        loadCSS("http://localhost/ion.rangeSlider-master/css/ion.rangeSlider.css");
        // loadCSS("http://localhost/ion.rangeSlider-master/style.min.css");
        loadCSS("http://localhost/ion.rangeSlider-master/demo_rangeslider.css");
        loadCSS("http://localhost/ion.rangeSlider-master/css/skin2.css");
        loadJS("http://localhost/ion.rangeSlider-master/js/ion.rangeSlider.min.js");
        var div_info = "";
        div_info += '      <input id="range_09" />';
        $( "#heatgraph" ).html(div_info);
        var timeline_div = $("#heatgraph").offset()
        var newleft = timeline_div.left-50*2;
        div_info = '  <div id="playstop" style="width: 50px; height:50px; position:absolute; top:'+timeline_div.top+'px; left:'+newleft+'px;">';
        div_info += '      <a href="#"> <img id="theplay" height="50px" src="libs/img2/play-circled2.png"></img> </a>';
        div_info += '  </div>';
        $( div_info ).insertAfter("#heatgraph");
    //     [ / HTML and Libraries Stuff ]


    //loading:  data/colorchange1.json
    $.ajax({
        type: 'GET',
        url: 'data/colorchange1.json',
        contentType: "application/json",
        async:false,
        //dataType: 'json',
        success : function(data){ 
            Frecs = data;
        },
        error: function(){ 
            pr('Page Not found: ColoringGraph()');
        }
    });
    // output: Frecs

    //not finished yet (slider events)
    $("#range_09").ionRangeSlider({
        grid: true,
        from: 0,
        values: Frecs.timesteps,
        
        keyboard: true,
        onStart: function (data) {
            console.log("onStart");
        },
        onChange: function (data) {
            console.log("onChange");
        },
        onFinish: function (data) {
            console.log("onFinish");
        },
        onUpdate: function (data) {
            console.log("onUpdate");
        }
    });

    var $range = $("#range_09");
    var slider = $range.data("ionRangeSlider");



    // Saving the distribution numbers as uniques (in a Dict).
    var real_min=1000000, real_max=-1;
    for(var i in Frecs.nodes) {
        var occs = Frecs.nodes[i];
        for(var j in occs) {
            if(occs[j]>0) {
                Frecs_Color[occs[j]] = true;
                Frecs_Size[occs[j]] = true;
                if (occs[j]<real_min) real_min = occs[j];
                if (occs[j]>real_max) real_max = occs[j];
            }
        }
    }
    // output: Frecs_Color <- Dict[value] = true



    var Min_color = 0;
    var Max_color = 255;
    var Min_size = 2;
    var Max_size = 8;
    for(var i in Frecs_Color) {
        var newval_color = Math.round( Min_color+(Number(i)-real_min)*( (Max_color-Min_color)/(real_max-real_min) ) );
        var hex_color = rgbToHex(255, (255-newval_color) , 0);
        Frecs_Color[i] = hex_color

        var newval_size = Math.round( Min_size+(Number(i)-real_min)*( (Max_size-Min_size)/(real_max-real_min) ) );
        Frecs_Size[i] = newval_size;
        pr( "orig: "+i+" | newval: "+newval_size)
    }
    Frecs_Color[0] = "#ffffff";
    Frecs_Size[0] = 1;
    // output: Frecs_Color <- Dict[value] = equivalent_hexcolor


    // Establishing the first coloring corresponding to t = 0 (0->1) 
    for(var i in Frecs.nodes) {
        var occs = Frecs.nodes[i];
        partialGraph._core.graph.nodesIndex[find(i)[0].id].color = Frecs_Color[occs[0]];
        partialGraph._core.graph.nodesIndex[find(i)[0].id].size = Frecs_Size[occs[0]];
    }

    partialGraph.draw();


    // ColoringGraph2();
    $("#playstop").click(function(){
        $("#playstop").attr('disabled', true);
        $("#theplay").css("opacity",0.4);
        ColoringGraph2();
    });


}


//     [   Twitter + HeatGraph   ]

function blendColors(source, target, balance) {
    var bal = Math.min(Math.max(balance,0),1);
    var nbal = 1-bal;
    var r1,g1,b1,r2,g2,b2;
    r1 = source["r"];
    g1 = source["g"];
    b1 = source["b"];
    r2 = target["r"];
    g2 = target["g"];
    b2 = target["b"];

    return {
            r : Math.floor(r1*nbal + r2*bal),
            g : Math.floor(g1*nbal + g2*bal),
            b : Math.floor(b1*nbal + b2*bal)
           };
}  

// uses: Frecs , Frecs_Color, blendColors()
function Colorer( t , step_size ) {
    var results = []
    var a = t, b=(t+1);
    // pr("tiempos t="+a+"|t="+b)
    for(var factor=0; factor < 1; factor=factor+step_size) {
        // pr("\tfactor: "+factor)
        var result = []
        for(var i in Frecs.nodes) {
            var occs = Frecs.nodes[i];
            if (occs[a]!=occs[b]) {
                var hex_source = Frecs_Color[occs[a]]
                var hex_target = Frecs_Color[occs[b]]
                var rgb_source = hex2rga(hex_source)
                var rgb_target = hex2rga(hex_target)
                // pr("\t\t"+rgb_source+" vs "+rgb_target)
                var source = { "r":rgb_source[0], "g":rgb_source[1], "b": rgb_source[2] }
                var target = { "r":rgb_target[0], "g":rgb_target[1], "b": rgb_target[2] }
                var rgb_trans = blendColors(source, target, factor);
                var rgb = rgbToHex ( rgb_trans["r"] , rgb_trans["g"] , rgb_trans["b"] )
                // pr("\t\t"+i+" -> "+rgb)
                // partialGraph._core.graph.nodesIndex[find(i)[0].id].color = rgb;
                var thefactor = factor*(occs[b]-occs[a]);
                var result_dict = {
                    "t":Number(b),
                    "n_id": Number(find(i)[0].id),
                    "col": rgb ,
                    "factor": (occs[b]>occs[a])?factor:(factor*-1)
                    // "size": 1
                }
                console.log( result_dict )
                result.push ( result_dict )
            }
        }
        results.push (result)
    }
    return results;
}

var min_buff = -1
function UpdateTimeSlider(value) {
    console.log("UpdateTimeSlider() the val: "+value)
    min_buff = value;
    var $range = $("#range_09");
    var slider = $range.data("ionRangeSlider");
    slider.update({ from: value });
}

// uses: Colorer() , Frecs.timesteps.length
function ColoringGraph2() {

    var step_size = 0.07
    var N = Frecs.timesteps.length;

    var results = []
    for(var t=0; t<(N-1) ; t++) {
        var result = Colorer( t , step_size );
        results = results.concat( result );
    }
    // pr(results)

    for(var i=0; i<results.length ; i++) {
          (function(i){

            window.setTimeout(function() {  
                // console.log(results[i][0])
                if(results[i][0]["t"]>min_buff) UpdateTimeSlider( results[i][0]["t"] );            
                for(var k in results[i]) {
                    var id = results[i][k]["n_id"];
                    var color = results[i][k]["col"];
                    var incrm = results[i][k]["factor"]
                    partialGraph._core.graph.nodesIndex[id].color = color;
                    partialGraph._core.graph.nodesIndex[id].size = ((partialGraph._core.graph.nodesIndex[id].size+incrm)<1)?1:partialGraph._core.graph.nodesIndex[id].size+incrm;
                }
                partialGraph.draw(2,2,2);
            }, i * 50);

          }(i));
    }
}

//     [  / Twitter + HeatGraph   ]






// function TwitterSelection() {

//     var query = []
//     var sels = partialGraph.states[1].selections
//     if (sels.length>0) {
//         for(var i in sels){
//             var s = Nodes[sels[i]].label
//             query.push(s)
//         }
//         // query = query.slice(0, 9)
//         finalquery = JSON.stringify(query)
//         $.ajax({
//             type: "GET",
//             url: "http://localhost:8080/aperotwitter",
//             data: "query="+finalquery,
//             contentType: "application/json",
//             dataType: "jsonp",
//             success : function(data, textStatus, jqXHR) {
//                 for(var i in data) {
//                     pr(data[i])
//                 }
//             },
//             error: function(exception) { 
//                 pr("exception!:"+exception.status)
//             }
//         });
//     }
// }

//For Pasteur
// function getTopPapers(type){
//     if(getAdditionalInfo){
//         jsonparams=JSON.stringify(getSelections());
//         bi=(Object.keys(categories).length==2)?1:0;
//         var APINAME = "API_pasteur/"
//         //jsonparams = jsonparams.replaceAll("&","__and__");
//         jsonparams = jsonparams.split('&').join('__and__');
//         //dbsPaths.push(getGlobalDBs());
//         thisgexf=JSON.stringify(decodeURIComponent(getUrlParam.file));
//         image='<img style="display:block; margin: 0px auto;" src="'+APINAME+'img/ajax-loader.gif"></img>';
//         $("#tab-container-top").show();
//         $("#topPapers").show();
//         $("#topPapers").html(image);
//         $.ajax({
//             type: 'GET',
//             url: APINAME+'info_div.php',
//             data: "type="+type+"&bi="+bi+"&query="+jsonparams+"&gexf="+thisgexf+"&index="+field[getUrlParam.file],
//             //contentType: "application/json",
//             //dataType: 'json',
//             success : function(data){ 
//                 pr(APINAME+'info_div.php?'+"type="+type+"&bi="+bi+"&query="+jsonparams+"&gexf="+thisgexf+"&index="+field[getUrlParam.file]);
//                 $("#topPapers").html(data);

//                 getTopProposals(type , jsonparams , thisgexf);
//             },
//             error: function(){ 
//                 pr('Page Not found: getTopPapers');
//             }
//         });
//     }
// }

//For CNRS
function getTopPapers(type){
    if(getAdditionalInfo){
        jsonparams=JSON.stringify(getSelections());
        bi=(Object.keys(categories).length==2)?1:0;
        var APINAME = "API_CNRS/"
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

function getTopProposals(type , jsonparams , thisgexf) {

    type = "semantic";
    if(swclickActual=="social") {
        nodesA = []
        nodesB = []
        socneigh = []
        for(var i in selections) {
            if(Nodes[i].type==catSoc) nodesA.push(i);
            if(Nodes[i].type==catSem) nodesB.push(i);
        }

        if(nodesA.length>0 && nodesB.length==0) socneigh = getArrSubkeys(opos,"key");
        if(nodesA.length>0 && nodesB.length>0) socneigh = getNeighs(nodesA,bipartiteD2N);

        kSels = {}

        for(var i in nodesB) {
            kSels[nodesB[i]] = 1;
        }
        for(var i in socneigh) {
            kSels[socneigh[i]] = 1;
        }

        concepts = []
        for(var i in kSels) {
            concepts.push(Nodes[i].label)
        }
        jsonparams=JSON.stringify(concepts);

        jsonparams = jsonparams.split('&').join('__and__');
    }


    image='<img style="display:block; margin: 0px auto;" src="'+"API_pasteur/"+'img/ajax-loader.gif"></img>';
    $("#topProposals").show();
    $("#topProposals").html(image);
    $.ajax({
        type: 'GET',
        url: "API_pasteur/"+'info_div2.php',
        data: "type="+"semantic"+"&query="+jsonparams+"&gexf="+thisgexf,
        //contentType: "application/json",
        //dataType: 'json',
        success : function(data){ 
            pr("API_pasteur/"+'info_div2.php?'+"type="+"semantic"+"&query="+jsonparams+"&gexf="+thisgexf);
            $("#topProposals").html(data);
        },
        error: function(){ 
            pr('Page Not found: getTopProposals');
        }
    });
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


//JUST ADEME
function getChatFrame() {    
    content = '<div id="showChat" onclick="showhideChat();"><a href="#" id="aShowChat"> </a></div>';
    content += '<iframe src="'+ircUrl+'"'
    content += 'width="400" height="300"></iframe>';    
    $("#rightcolumn").html(content);
}


//JUST ADEME
function showhideChat(){
    
    cg = document.getElementById("rightcolumn");
    if(cg){
        if(cg.style.right=="-400px"){
            cg.style.right="0px";
        }
        else cg.style.right="-400px";
    }
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



//both obsolete
function closeDialog () {
    $('#windowTitleDialog').modal('hide'); 
}
function okClicked () {
    //document.title = document.getElementById ("xlInput").value;
    closeDialog ();
}
