/*___       __ _      _ _   _
 |   \ ___ / _(_)_ _ (_) |_(_)___ _ _  ___
 | |) / -_)  _| | ' \| |  _| / _ \ ' \(_-<
 |___/\___|_| |_|_||_|_|\__|_\___/_||_/__/
 */

/** @typedef {{
 *      answer:     string?,
 *      question:   string,
 *      options:    Object<string>,
 *      warn:       {
 *          challenge:  string,
 *          answer:     string
 *      }?
 *  }} HelpNode
 */

/** @typedef {{
 *      nodes:  Object<HelpNode>,
 *      info:   Object<string>
 *  }} SupportFile
 */


/* ___ _     _          _
  / __| |___| |__  __ _| |___
 | (_ | / _ \ '_ \/ _` | (_-<
  \___|_\___/_.__/\__,_|_/__/
 */

/** @type {Object<SupportFile>}*/
let supportFiles={};
let language = navigator.language.substr(0,2) || navigator.userLanguage.substr(0,2);
let warnAnswer;
let lastUrl=window.location.href;


/*_  _         _
 | \| |___  __| |___
 | .` / _ \/ _` / -_)
 |_|\_\___/\__,_\___|
 */

/**
 * Finds the current nodes key
 * @return {string}
 */
const getKey=()=>{
    //find what page to load
    let url=window.location.href;
    let end=url.indexOf('#');
    let key="start";
    if (end>0) key = url.substr(end + 1);
    if (supportFiles.en.nodes[key]===undefined) key="start";      //if page doesn't exist go to start(references english and not language because of fall back)
    return key;
}

/**
 * Loads and displays a node
 * @param {string}  key
 */
const showNode=(key)=>{
    //load node
    let node=(supportFiles[language]!==undefined)?supportFiles[language].nodes[key]:supportFiles.en.nodes[key]||supportFiles[language].nodes["done_no_help"];//find page.  If missing fall back to english then couldn't help

    //build nodes html
    $("#answer").html(node.answer||"");
    $("#question").html(node.question||"");
    let html="";
    for (let key in node.options) {
        html+='<button class="option" key="'+key+'"><span>'+node.options[key]+'</span></button>';
    }
    $("#options").html(html);
    if (node.warn!==undefined) {
        $("#warnText").html(node.warn.challenge);
        warnAnswer=node.warn.answer;
        $(".shadow").show();
    } else {
        $(".shadow").hide();
    }

    //add the page to url
    let url=window.location.href;
    let last=url;
    let end=url.indexOf('#');
    if (end>0) url = url.substr(0,end); //remove everything after and including # if present
    url+="#"+key;
    if (url!==last) window.location.href=url;
    lastUrl=url;
}

//back to start
$(document).on("click", "#dgb-d", () => {
    document.location.href = "./";
})

//handle option click
$(document).on('click','.option',function(){
    let key=$(this).attr('key');
    $("#window").fadeOut(100,() => {
        showNode(key);
        $("#window").fadeIn(300, () => $("#window").animate({scrollTop:0}, "smooth"));
    });
});

$(document).on('keyup',"#warnConfirm",function(){
    if ($("#warnConfirm").val().toLowerCase()===warnAnswer.toLowerCase()) {
        $(".shadow").hide();
    }
});



/*___                      ___  _      _
 | _ \___ _ __ _  _ _ __  |   \(_)__ _| |___  __ _ _  _ ___
 |  _/ _ \ '_ \ || | '_ \ | |) | / _` | / _ \/ _` | || / -_)
 |_| \___/ .__/\_,_| .__/ |___/|_\__,_|_\___/\__, |\_,_\___|
         |_|       |_|                       |___/
 */
const popup = $("#popup-dialogue");

/**
 * Shows an info alert
 * @param key
 */
const infoAlert=(key)=>{
    let html = "";
    let info = supportFiles[language].info[key]||supportFiles.en.info[key];
    html += "<button class='popup-close'>×</button>";
    html += "<p>"+info+"</p>";
    popup.html(html);
    popup.css({"max-height":"70%", "max-width":"75%", "padding":"5px"});
}

//handle info link clicks
$(document).on("click", "a.popup-info", function(e) {
    e.preventDefault();
    let key = $(this).attr('key');
    infoAlert(key);
});

//handle info closes
$(document).on("click", "button.popup-close", function() {
    popup.css({"max-height":"0%", "max-width":"0%", "padding":"0"});
});




/*_
 | |   __ _ _ _  __ _ _  _ __ _ __ _ ___
 | |__/ _` | ' \/ _` | || / _` / _` / -_)
 |____\__,_|_||_\__, |\_,_\__,_\__, \___|
                |___/          |___/
 */

/**
 * Loads a support file
 * @param {string}  languageCode - 2 digit language code
 * @return {Promise<boolean>}
 */
const loadSupportFile=async(languageCode)=>{
    return new Promise(resolve=> {                              //create promise
        if (supportFiles[languageCode] === undefined) {                      //only load if not already loaded
            $.getJSON(`answers-${languageCode}.json`).then(data => {    //download file
                supportFiles[languageCode] = data;                           //save language data
                console.log(`${languageCode} loaded`);
                resolve(true);                                     //resolve the promise
            },()=>{
                console.log(`${languageCode} failed to load`);
                language="en";                                          //on failure to load language revert back to english
                resolve(false);                                   //resolve the promise
            });
        } else {
            resolve(true);                                        //already loaded so resolve the promise
        }
    });
}

//load initial languages and display
let languagesToLoad=[loadSupportFile("en")];                //if an entry is missing it falls back to english so must always load
if (language!=="en") languagesToLoad.push(loadSupportFile(language));   //if users default language is not english try to load it also
Promise.all(languagesToLoad).then(()=>{                                 //load languages
    console.log(supportFiles);
    $("#language").val(language);                                       //set the language selector to whatever language it was at load
    showNode(getKey());                                                 //display first page
    $("#question, #options").fadeIn(300);
});

//handle language change
$("#language").on('change',async()=>{
    language=$("#language").val();
    let success=await loadSupportFile(language);
    if (success) showNode(getKey());
});




/*___                           _   __       ___          _
 | __|__ _ ___ __ ____ _ _ _ __| | / _|___  | _ ) __ _ __| |__
 | _/ _ \ '_\ V  V / _` | '_/ _` | > _|_ _| | _ \/ _` / _| / /
 |_|\___/_|  \_/\_/\__,_|_| \__,_| \_____|  |___/\__,_\__|_\_\
 */
setInterval(()=>{
    if (lastUrl!==window.location.href) showNode(getKey());
},200);