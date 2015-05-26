<?php


$gexf_db = array();
$gexf_db["data/medq1/20141208_MED_01_bi.gexf"] = "data/medq1/01_medline-query1.db";

$gexf_db["data/medq2/20141128_MED_02_bi.gexf"] = "data/medq2/02_medline-query2.db";
$gexf_db["data/medq2/20141128_MED_03_bi.gexf"] = "data/medq2/02_medline-query2.db";
$gexf_db["data/medq2/20141208_MED_Author_name-ISItermsjulien_index.gexf"] = "data/medq2/02_medline-query2.db";
$gexf_db["data/20141128_GPs_03_bi.gexf"] = "data/00_grantproposals.db";
$gexf_db["data/20141215_GPs_04.gexf"] = "data/00_grantproposals.db";

# new stuff
$gexf_db["data/terrorism/terrorism_mono.gexf"] = "data/terrorism/data.db";
$gexf_db["data/terrorism/terrorism_bi.gexf"] = "data/terrorism/data.db";

$gexf= str_replace('"','',$_GET["gexf"]);

$mainpath=dirname(getcwd())."/";
$graphdb = $gexf_db[$gexf];


?>
