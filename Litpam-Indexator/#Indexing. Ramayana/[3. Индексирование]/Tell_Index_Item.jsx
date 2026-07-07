// Tell_Index_Item.jsx

/*
    
Скрипт выводит информацию о попавшем в выделение маркере
Подробная информация на кнопке [?]

*/

#targetengine "Tell_Index_Item"

var ProgressBar = function(title) {
var w = new Window('palette', title, {x:0, y:0, width:840, height:30},{closeButton: true}),
pb = w.add('progressbar', {x:20, y:10, width:800, height:12});
w.center();
this.reset = function(maxValue) {
pb.value = 0;
pb.maxvalue = maxValue;
w.show();
w.update();
}
this.hit = function() {++pb.value; w.update();}
this.close = function() {w.close();}
} // ProgressBar
var programTitul = "Название маркера указателя";
////////
if(app.documents.length == 0) {
alert("Нет открытого документа.", programTitul);	
exit();    
}
if (app.activeDocument.indexes.length == 0) {
    alert("В этом файле нет указателя.",programTitul);
    exit();        
    }
var sel;
var topItem, _topItem, _topItem_, _top_Item_, topicName;
var name1, name2, name3;
var docIndex;
var topics;

var win = new Window ("palette", programTitul);
var infoLineGroup = win.add("group");
infoLineGroup.orientation = "row";
var getInfo = infoLineGroup.add("button", [0,0,28,28], ">|");
var infoField = infoLineGroup.add("edittext {justify: 'center'}", [0,0,300,28]);
infoField.enabled = false;
var info = infoLineGroup.add("button", [0,0,28,28], "?");
///
getInfo.onClick = function () { // getInfo
sel = app.selection[0];
if (sel == null || sel.hasOwnProperty("pointSize") != true || sel.constructor.name == "InsertionPoint") {
    alert("Должна быть выделена область текста.",programTitul);
    return;    
    }
if (app.activeDocument.indexes.length == 0) {
    alert("В этом файле нет указателя.",programTitul);
    exit();        
    }
docIndex = app.activeDocument.indexes[0];
topics = docIndex.topics.everyItem().getElements();
app.findGrepPreferences = app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "~I";     
var rez = sel.findGrep(); 
if (rez.length == 0) {
    alert("Маркер указателя не найден.",programTitul);
    return;       
   }
if (rez.length != 1) {
    alert("В выделенном тексте должен быть только один маркер указателя, а сейчас их найдено " + rez.length + ".",programTitul);
    return;        
   }
var selPosition = rez[0].index;
var sel_ID = sel.parent.id;
var topicFound = false;
pBar = new ProgressBar(programTitul);
pBar.reset(topics.length);
var rez;
infoField.text = "Ищем информацию об этом маркере...";
for (var t = 0; t < topics.length; t++, pBar.hit()) { // t++
    // это topics первого уровня. У них могут быть topics следующих уровней.
    if (topicFound == true) break;
    topicName = "";
    topItem = topics[t];
    name1 = topItem.name;
    topItem = topics[t];
    rez = getTopicName (topItem, topicName, sel_ID, selPosition);
    if (rez[0] == true) {
        infoField.text = rez[1];
        infoField.helpTip = rez[1];        
        topicFound = true;
        pBar.close();
        return;
        }
    // возможно, у первого уровня есть следующий уровень
    if (topItem.topics.length == 0) continue; // ниже уровней нет. Возврат в цикл t++
    topicName = name1 + " • ";
    for (var ii = 0; ii < topItem.topics.length; ii++) { // ii++
        _topItem = topItem.topics[ii];
        name2 = _topItem.name;
        rez = getTopicName (_topItem, topicName, sel_ID, selPosition);
        if (rez[0] == true) {
            infoField.text = rez[1];
            infoField.helpTip = rez[1];            
            topicFound = true;            
            pBar.close();
            return;
            } 
        // возможно, у второго уровня есть следующий уровень
        if (_topItem.topics.length == 0) continue; // ниже уровней нет. Возврат в цикл ii++  
        topicName = name1 + " • " + name2 + " • ";  // теперь в названии маркера будут две жирных точки    
        for (var iii = 0; iii < _topItem.topics.length; iii++) { // iii++     
            _topItem_ = _topItem.topics[iii];
            name3 = _topItem_.name;            
            rez = getTopicName (_topItem_, topicName, sel_ID, selPosition);
            if (rez[0] == true) {
                infoField.text = rez[1];
                infoField.helpTip = rez[1];                
                topicFound = true;            
                pBar.close();
                return;
                }  
            // возможно, у третьего уровня есть следующий уровень
            if (_topItem_.topics.length == 0) continue; // ниже уровней нет. Возврат в цикл iii++     
            topicName = name1 + " • " + name2 + " • " + name3 + " • ";  // теперь в названии маркера будут три жирных точки  
            for (var iiii = 0; iiii < _topItem_.topics.length; iiii++) { // iiii++     
                _top_Item_ = _topItem_.topics[iiii];
                rez = getTopicName (_top_Item_, topicName, sel_ID, selPosition);
                if (rez[0] == true) {
                    infoField.text = rez[1];
                    infoField.helpTip = rez[1];
                    topicFound = true;            
                    pBar.close();
                    return;
                    } 
                } // iiii++
            } // iii++
        } // ii++
    } // t++
/*
Обработка маркеров третьего и четвёртого уровней не проверялась.
Но не на чём проверить.      
*/
pBar.close();
infoField.text = topicName;
if (topicFound == false) infoField.text = "Ошибка поиска";
return;
}  // getInfo
///
function getTopicName (topItem, topicName, sel_ID, selPosition) { // getTopicName
var _topicName = topicName;
var topicFound = false;
var rez;
var pageRefNum = topItem.pageReferences.length;
for (var p = 0; p < pageRefNum; p++) { // p++
    if (topItem.pageReferences[p].sourceText.parentStory.id != sel_ID) continue;
    if (topItem.pageReferences[p].sourceText.index != selPosition) continue;
    topicFound = true;
    _topicName = _topicName + topItem.name;
    break;
    } // p++
return [topicFound, _topicName]; 
} // getTopicName
///
info.onClick = function () { // info
var inform = "Стандартное средство отображения информации об уровнях маркера указателя занимает на экране много места. И требуется несколько мелких движений мышью, чтобы выделить именно сам маркер. Это долго и неудобно. Поэтому сделан скрипт, занимающий на экране много меньше места и выводящий информацию в более удобном виде.\n\nКогда в выделении есть маркер индексного указателя,  то при нажатии на кнопку [>|] скрипт выводит в информационном поле название темы, к которой относится данный маркер.\n\nЕсли уровней два, т.е. тема и термин, то названия первого и второго уровней разделяются жирной точкой. И аналогично для маркера третьего уровня в названии будет две жирных точки, для четвёртого три.\n\nИногда эта информационная строка получается столь длинной, что не помещается в информационное поле. Но этот текст дублируется во всплывающей подсказке к информационному полю, там нет ограничения на длину строки и будет отображён весь текст.\n\nЕсли маркер выделен, но программа информации о нём не нашла, то будет выведено сообщение «Ошибка поиска». Используйте тогда стандартный инструмент отображения информации об уровнях маркера.";
alert(inform, programTitul);
} // info
///
win.show();
////