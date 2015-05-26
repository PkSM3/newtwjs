function watch(obj, prop, handler) { // make this a framework/global function
    var currval = obj[prop];
    function callback() {
        if (obj[prop] != currval) {
            var temp = currval;
            currval = obj[prop];
            handler(temp, currval);
        }
    }
    return callback;
}

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
var AjaxSync = (function(TYPE, URL, DATA, CT , DT) {
    var Result = []
    TYPE = (!TYPE)?"GET":"POST"
    if(DT && (DT=="jsonp" || DT=="json")) CT="application/json";
    // console.log(TYPE, URL, DATA, CT , DT)
    $.ajax({
            type: TYPE,
            url: URL,
            data: DATA,
            contentType: CT,
            dataType: DT,
            async: false,
            success : function(data, textStatus, jqXHR) {
                header = jqXHR.getResponseHeader("Content-Type")
                header = (header)?"json":"gexf";
                Result = { "OK":true , "format":header , "data":data };
            },
            error: function(exception) { 
                Result = { "OK":false , "format":false , "data":exception.status };
            }
        });
    return Result;
}).index();


var mainfile = "db.json";
var mainfile = "api.json";
var mainfile = [
    "data/2-Terms-Authors-300nodes.gexf",
    "data/0-terms-terms-MainNodes.gexf",
    "data/maziyar2.json",
    "data/3-Terms-Countries-300nodes.gexf",
    "data/noclimatechange_mnodes.gexf",
    "data/20150518t1052_phylograph.json",
    "data/phylograph_6.json",
    "data/maziyar.json",
    "data/20141128_GPs_03_bi.gexf",
    "data/example.json",
    "data/Elisa__Omodei.gexf",
    ];

var urlfile_override = (isUndef(getUrlParam.file))?false:true;
if(urlfile_override) mainfile.unshift( getUrlParam.file );

console.log("THE URL.FILE PARAM:")
console.log(mainfile)

var file = (Array.isArray(mainfile))?mainfile[0]:mainfile;

var RES = AjaxSync({ URL: file });

if(RES["OK"]) {

    var fileparam;// = { db|api.json , somefile.json|gexf }
    if(file=="db.json" || file=="api.json") fileparam = file;
    else  fileparam = RES["format"];

    start = new ParseCustom(  fileparam , RES["data"] );
    categories = start.scanFile(); //user should choose the order of categories
    pr("Categories: ")
    pr(categories)
    var possibleStates = makeSystemStates( categories )
    var initialState = buildInitialState( categories ) //[true,false]//

    dicts = start.makeDicts(categories);
    Nodes = dicts.nodes;
    Edges = dicts.edges;

    nodes1 = dicts.n1;//not used
    var catDict = dicts.catDict
    pr("CategoriesDict: ")
    pr(catDict)

    categoriesIndex = categories;//to_remove
    catSoc = categories[0];//to_remove
    catSem = (categories[1])?categories[1]:false;//to_remove

    for(var i in categories) {
        Filters[i] = {}
        Filters[i]["#slidercat"+i+"edgesweight"] = true;        
    } 
    
    // [ Initiating Sigma-Canvas ]
    var twjs_ = new TinaWebJS('#sigma-example'); 
    print( twjs_.AdjustSigmaCanvas() );
    $( window ).resize(function() { print(twjs_.AdjustSigmaCanvas()) });
    // [ / Initiating Sigma-Canvas ]

    print("categories: "+categories)
    print("initial state: "+initialState)

    // [ Poblating the Sigma-Graph ]
    var sigma_utils = new SigmaUtils();
    partialGraph = sigma.init(document.getElementById('sigma-example'))
        .drawingProperties(sigmaJsDrawingProperties)
        .graphProperties(sigmaJsGraphProperties)
        .mouseProperties(sigmaJsMouseProperties);
    partialGraph = sigma_utils.FillGraph(  initialState , catDict  , dicts.nodes , dicts.edges , partialGraph );
    partialGraph.states = []
    partialGraph.states[0] = false;
    partialGraph.states[1] = SystemStates;
    partialGraph.states[1].categories = categories
    partialGraph.states[1].categoriesDict = catDict;
    partialGraph.states[1].type = initialState;
    // [ / Poblating the Sigma-Graph ]






    partialGraph.states[1].setState = (function( type , level , sels , oppos ) {
        var bistate=false, typestring=false;
        print("IN THE SET STATE METHOD:")
        if(!isUndef(type)) {
            this.type = type;
            bistate= type.map(Number).reduce(function(a, b){return a+b;})
            typestring = type.map(Number).join("|")
        }
        if(!isUndef(level)) this.level = level;
        if(!isUndef(sels)) this.selections = sels;
        if(!isUndef(oppos)) this.opposites = oppos;
        print("")
        print(" % % % % % % % % % % ")
        // print("type: "+thetype.map(Number));
        print("bistate: "+bistate)
        print("level: "+level);
        print("selections: ");
        print(sels)
        print("selections2: ");
        print(sels.length)
        print("opposites: ");
        print(oppos)

        var present = partialGraph.states.slice(-1)[0]; // Last
        var past = partialGraph.states.slice(-2)[0] // avant Last
        print("previous level: "+past.level)
        print("new level: "+present.level)
        
        print(" % % % % % % % % % % ")
        print("")

        var bistate= this.type.map(Number).reduce(function(a, b){return a+b;})
        LevelButtonDisable(false);
        if(level && sels && sels.length==0)
            LevelButtonDisable(true);

        if(this.level==false && bistate>1)
            LevelButtonDisable(true)

        // print("printing the first state:")
        // first_state = partialGraph.states.slice(-1)[0].type;
        // for(var i in first_state) {
        //     if(first_state[i]) {
        //         for(var j in Filters[i])
        //             print(j)
        //     }
        // }

        print("printing the typestring:")
        print(typestring)

        if(typestring=="0|1") {
            $("#category0").hide();
            $("#category1").show();

            if($("#slidercat1nodesweight").html()=="") 
                NodeWeightFilter( this.categories , "#slidercat1nodesweight" ,  this.categories[1],  "type" ,"size");

            if($("#slidercat1edgesweight").html()=="")
                EdgeWeightFilter("#slidercat1edgesweight", "label" , "nodes2", "weight");


            if(present.level!=past.level) {
                NodeWeightFilter( this.categories , "#slidercat1nodesweight" ,  this.categories[1],  "type" ,"size");
                EdgeWeightFilter("#slidercat1edgesweight", "label" , "nodes2", "weight");
            }
        }

        if(typestring=="1|0") {
            $("#category0").show();
            $("#category1").hide();

            if($("#slidercat0nodesweight").html()=="") 
                NodeWeightFilter( this.categories , "#slidercat0nodesweight" ,  this.categories[0],  "type" ,"size");

            if($("#slidercat0edgesweight").html()=="")
                EdgeWeightFilter("#slidercat0edgesweight", "label" , "nodes1", "weight");

            if(present.level!=past.level) {
                NodeWeightFilter( this.categories , "#slidercat0nodesweight" ,  this.categories[0],  "type" ,"size");
                EdgeWeightFilter("#slidercat0edgesweight", "label" , "nodes1", "weight");
            }
        }

        if(typestring=="1|1") {
            $("#category0").show();
            $("#category1").show();
            // if(present.level!=past.level) {
            NodeWeightFilter ( this.categories , "#slidercat0nodesweight" ,  this.categories[0],  "type" ,"size");
            EdgeWeightFilter("#slidercat0edgesweight", "label" , "nodes1", "weight");
            NodeWeightFilter( this.categories , "#slidercat1nodesweight" ,  this.categories[1],  "type" ,"size");
            EdgeWeightFilter("#slidercat1edgesweight", "label" , "nodes2", "weight");
            // }
        }
    }).index();

    partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8).draw();

    // fa2enabled=true; partialGraph.zoomTo(partialGraph._core.width / 2, partialGraph._core.height / 2, 0.8).draw();
    // $.doTimeout(1,function(){
    //     fa2enabled=true; partialGraph.startForceAtlas2();
    //     $.doTimeout(10,function(){
    //         partialGraph.stopForceAtlas2();
    //     });
    // });

    twjs_.initListeners( categories , partialGraph);

} else alert("error: "+RES["data"])


console.log("finish")


