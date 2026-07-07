// AddHairSpace_File.jsx
/*
После двух символов, разделяющих слова -- 0x2D 0xAD -- добавляется волосяная шпация.
Похоже, этот разделитель является причиной, что второе слово не может попасть в индекс.
Поэтому попробуем пока в ручном режиме добавлять и убирать эту шпацию.
*/

var programTitul = "Добавление служебной волосяной шпации";

if (app.documents.length == 0) {
    alert("Нет открытого документа.", programTitul);
    exit();
    }
//~ var sel = app.selection[0];   
//~ if (sel == 0 || (sel.constructor.name != "InsertionPoint")) {
//~     alert("Курсор должен быть в материале." , programTitul);
//~     exit();
//~     }
//var story = sel.parentStory;
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "-­"; // дефис и неразрывный перенос
app.changeGrepPreferences.changeTo = "-­ "; // дефис и неразрывный перенос и волосяная шпация
var rez = app.activeDocument.changeGrep();
//var rez = story.findGrep();
//$.writeln(rez.length);
alert("Волосяная шпация добавлена в весь файл. " + rez.length , programTitul);
exit();
