// DashInsteadWord.jsx

/*
Полиграфическая традиция оформления указателей предписывает заменять прочерками (длинными тире) совпадающие слова в следующих строках.
Например, исходный вид указателя
...
Особое решение 15, 94
Особое решение уравнения Клеро 64
Особое решение уравнения Лагранжа 63
...
должен быть преобразован в такой вид:
...
Особое решение 15, 94
— — уравнения Клеро 64
— — — Лагранжа 63
...
Если совпадение только в первом слове, то прочерки всё равно нужны, это позволит отличать двухуровневые указатели от одноуровневых.. 

Когда сопадающих слов в соседних строках много, что часто встречается в книгах по физике и математике, 
этот приём оформленния текста позволит сделать указатель заметно более компактным.
Данный скрипт берет на себя просмотр всех выделенных строк и замену совпадающих слов на прочерки.
Длина слова может быть любой, т.е. однобуквенные предлоги тоже считаются словами.
В этом расхождение, например, с оформлением указателя к тому собрания сочинений Д.И. Менделеева, там на с. 932 есть такой текст:
...
Платино-роданистые соединения XIV 831
— синеродистая кислота XIV 817
— синеродистый аммиак XIV 817
— — калий XIV 816
— — магний XIV 818
...
Синеродисто-калиевая соль XIII 610
— кобальтовая соль XIV 314
...
Очевидно, что там в первом случае прочерк для "Платино-", во втором для "Синеродисто-".
Можно полумать, как это учесть, если это, конечно, нужно. И в нужности как раз я сомневаюсь.
Пока, в этой версии, пусть будет учёт слов без анализа, является ли оно составным.

На всякий случай исходный вариант строки можно сохранить в примечании, оно помещается в конец строки.
Это выполняется, если переменная скрипта useNote будет в состоянии true, по умолчанию она установлена в false.
Может быть, потом появится обновление: для отмеченных редактором строк восстановить их прежний вид и сделать прочерки с учётом того, что слова могут быть составными.

В начале обработки на экране прогрессбар, как он исчезнет, значит, слова заменены на прочерки. 

Ctrl+Z - если надо вернуть вид текста.

*/

#include "../../ForIndex.jsxinc"

var dash = "—"; // стандартно прочерк -- это длинное тире.
var useNote = false;

var programTitul = "Прочерки на месте одинаковых слов";
var sel = app.selection[0];
if (sel == null || (sel.constructor.name != "Paragraph" && sel.constructor.name != "Text" && sel.constructor.name != "TextColumn" && sel.constructor.name != "TextStyleRange")) { // == null
    alert("Перед запуском скрипта должен быть выделен текст.",programTitul);
    exit();    
    } // == null
var paraN = sel.paragraphs.length;
var myStartOfFragment = sel.paragraphs[0].characters.firstItem().index;
var myEndOfFragment = sel.paragraphs[sel.paragraphs.length - 1].characters.lastItem().index;
sel.parent.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
sel = app.selection[0];
if (sel.paragraphs[0].words.length == 0) {
    alert("В первом абзаце выделения должен быть текст.",programTitul);
    exit();    
    }
var story = sel.parent;
var selStart = sel.characters[0].index;
var selEnd = sel.characters[-1].index;
var charsAfter = String(story.length - selStart - sel.length); // число символов после выделенной области до конца материала
var styleID = sel.paragraphs[0].appliedParagraphStyle.id;
var curString = "";
var sampleArr = [];
while (sampleArr.length > 0) sampleArr.pop();
var curLineArr = [];
while (curLineArr.length > 0) curLineArr.pop();
for (var w = 0; w < sel.paragraphs[0].words.length; w++) { // w++
        sampleArr.push(sel.paragraphs[0].words[w].contents); 
    } // w++
if (sampleArr.length == 0) {
    alert("В первом выделенном абзаце нет текста.",programTitul);
    exit();     
    }
app.doScript(changeWordToDash, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'changeWordToDash');
exit();
//////////////////
function changeWordToDash () { // changeWordToDash
pBar = new ProgressBar(programTitul);
pBar.reset("Замена совпавших букв на прочерки", paraN);   
for (var i = 1; i < paraN; i++, pBar.hit()) { // i++
    if (sel.paragraphs[i].words.length == 0) {
        // пустая строка в указателе обнуляет массив со словами предыдущей строки.
        // Следующая строка станет эталонной
        while (sampleArr.length > 0) sampleArr.pop();
        continue;
        }
    if (sel.paragraphs[i].appliedParagraphStyle.id != styleID) { // styleID
        // смена абзацного стиля = выбор строки другого уровня индекса делает эту строку эталонной для поиска совпадающих слов
        styleID = sel.paragraphs[i].appliedParagraphStyle.id;
        while (sampleArr.length > 0) sampleArr.pop();
         for (var q = 0; q < sel.paragraphs[i].words.length; q++) { sampleArr.push(sel.paragraphs[i].words[q].contents); }
        continue;        
        } // styleID
    while (curLineArr.length > 0) curLineArr.pop();
    for (var q = 0; q < sel.paragraphs[i].words.length; q++) { curLineArr.push(sel.paragraphs[i].words[q].contents); }
    if (useNote) { // useNote
        sel.paragraphs[i].insertionPoints[-2].select();
        var notePisition = app.selection[0];
        var noteMarker = notePisition.notes.add();
        noteMarker.texts[0].contents = sel.paragraphs[i].contents;
        } // useNote
    for (var w = 0; w < sampleArr.length; w++) { // w++
        if (curLineArr[w] != sampleArr[w]) break; // завершение цикла w++
        else { /// else
            sel.paragraphs[i].words[0].contents = dash; // всегда замена слова с индексом [0] на прочерк. 
            // Дело в том, что если в строке несколько прочерков в начале строки, они не считаются словами. Так что индекс ноль остаётся неизменным.       
            selEnd = story.length - Number(charsAfter) - 1;
            story.characters.itemByRange(selStart, selEnd).select();
            sel = app.selection[0]; // переопределили выделение после замены слова на прочерк    
            story.recompose();
            } /// else
        } // w++
    while (sampleArr.length > 0) sampleArr.pop();
    for (var w = 0; w < curLineArr.length; w++) { sampleArr[w] = curLineArr[w]; }   
    } // i++
pBar.close();
} // changeWordToDash





////////////////