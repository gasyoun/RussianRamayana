// SplitStory.jsx
// вариант непосредственного перемещения текста

// Статья проходит из фрейма в фрейм, и этот скрипт её делит на стыке фреймов.
// Надо выделить текст в конце одного фрейма и в начале другого.
// Не обрабатывается случай, когда абзац находится в обоих фреймах.
// Снятие выделения с текста означает завершение работы скрипта.
// Надо идти по тексту от конца к началу.
// Интеллектуальная перекомпоновка текста (Установки > Текст) выключается
// app.activeDocument.textPreferences.smartTextReflow = false,
// и включение этой опции закомметировано:
// повторное включение заметно удлиняет время мельтешения курсора.
// поэтому лучше на время обработки глав оставить эту опцию выключенной,
// и включить после завершения этой работы.
// восстановление вёрстки до запуска скрипта -- Ctrl+Z

// Михаил Иванюшин, 2021  |   dotextok.ru   |   dotextok@gmail.com

mySel = app.selection[0];
if (mySel == null && mySel.constructor.name != "Text") {
    alert("Выберите текст, общий для двух фреймов.");
    exit();
    }
if (mySel.characters[0].parentTextFrames[0].characters[-1].paragraphs[0].index == mySel.characters[-1].parentTextFrames[0].characters[0].paragraphs[0].index) {
    alert("Не обрабатывается случай, когда абзац находится в обоих фреймах.");
    exit();    
    }
var firstFrame = mySel.characters[0].parentTextFrames[0];
var secondFrame = mySel.characters[-1].parentTextFrames[0];
var tmpPage = app.activeWindow.activePage;
if (firstFrame.id == secondFrame.id) {
    alert("В выделении должен быть текст двух фреймов.");
    exit();     
    }
app.doScript(splitAction_move, ScriptLanguage.JAVASCRIPT, [], UndoModes.ENTIRE_SCRIPT, 'splitAction');
exit();
//////////
function splitAction_move() { // splitAction
var story = mySel.parent;
var index= mySel.characters[-1].parentTextFrames[0].characters[0].index;
var usedSmartTextReflow = app.activeDocument.textPreferences.smartTextReflow;
app.activeDocument.textPreferences.smartTextReflow = false;
firstFrame.nextTextFrame = null;
secondFrame.previousTextFrame = null; // это странно, но текстовый поток разрывается надёжно только когда есть эти два присвоения = null.  Когда только одна операция присвоения - null, был случай, что этого не хватило.
story.characters.itemByRange(index, story.length-1).move( LocationOptions.AT_END, secondFrame.insertionPoints[0]);
app.activeWindow.activePage = tmpPage;
// app.activeDocument.textPreferences.smartTextReflow = usedSmartTextReflow; 
app.activeDocument.select(NothingEnum.nothing);
return;
} // splitAction

