// #GetAll-nill.jsx

/*
Собрали все строки с nil тегом

*/

#targetengine "GetAll"
#include "ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "nil";
if (app.documents.length == 0) {
    alert("Нет открытого документа.", programTitul);
    exit();
    }
var lines =[];
while (lines.length > 0) lines.pop();
var sel = app.selection[0];
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint") {
    alert("Курсор должен быть в материале.", programTitul);  
    job.value = false;
    exit();
    }
var story = sel.parentStory;
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "{nil}";
var found = story.findGrep();
if (found.length == 0) {
    alert("Ничего не найдено");
    exit();
    }
var pBar = new ProgressBar(programTitul);
pBar.reset("", found.length);
for (i = 0; i < found.length; i ++, pBar.hit()) { // i++
    var para = found[i].paragraphs[0];
    if (para.length < 5) continue;
    var paraindex = para.index;
    var paraLength = para.length;
    var prevContents = story.characters[paraindex-1].paragraphs[0].contents;
    var nextContents = story.characters[Number(paraindex) + Number(paraLength)].paragraphs[0].contents; 
    var curContents = para.contents;
    lines.push(prevContents);
    lines.push(curContents);
    lines.push(nextContents + "\r");   
    } // i++
pBar.close();
var rezFileName  = "Nil.txt";
var myScriptFile = myGetScriptPath();
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePath = decodeURI(myScriptFolder + "/" + rezFileName); 
var rezFile = new File (myFilePath);
var rezText = "" ;
rezText = lines.join("");
rezFile.open("w");
rezFile.writeln(rezText);
rezFile.close();
alert(decodeURI(myFilePath));
exit();
//////////////////
function myGetScriptPath() {
	try{
		return app.activeScript;
	}
	catch(myError){
		return File(myError.fileName);
	}
} //myGetScriptPath()

    
    
    
