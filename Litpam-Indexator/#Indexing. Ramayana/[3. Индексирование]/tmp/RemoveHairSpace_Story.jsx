// RemoveHairSpace_Story.jsx
/*
После двух символов, разделяющих слова -- 0x2D 0xAD -- добавлена волосяная шпация.
Это было сделано скриптом AddHairSpace.jsx.
Теперь эта шпация удаляется.
*/

var programTitul = "Удаление служебной волосяной шпации";

if (app.documents.length == 0) {
    alert("Нет открытого документа.", programTitul);
    exit();
    }
var sel = app.selection[0];   
if (sel == 0 || (sel.constructor.name != "InsertionPoint")) {
    alert("Курсор должен быть в материале." , programTitul);
    exit();
    }
var story = sel.parentStory;
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "-­ "; // дефис и неразрывный перенос и волосяная шпация
app.changeGrepPreferences.changeTo = "-­"; // дефис и неразрывный перенос
var rez = story.changeGrep();
alert("Волосяная шпация в материале далена. " + rez.length , programTitul);
exit();
