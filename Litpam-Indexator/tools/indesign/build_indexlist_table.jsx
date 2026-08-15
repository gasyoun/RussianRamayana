// build_indexlist_table.jsx — additive stage-[1] input builder (H2776, MG override 15-08-2026).
//
// Replaces the operator's manual "copy columns from Excel, paste into InDesign"
// step ONLY: creates a fresh document with the #IndexStyles paragraph-style group
// UseReadyTable.v.7.jsx requires, reads a TSV (term \t forms per line), converts
// it to the canonical 2-column table, threads extra pasteboard frames until no
// story overflows (UseReadyTable refuses overset), saves under saveAsPath, and
// leaves the document OPEN with the cursor in the first cell — exactly the state
// UseReadyTable.v.7.jsx expects. The authorial script itself is NOT modified.
//
// Params via app.scriptArgs: tsvPath, saveAsPath
// ExtendScript (ES3). Encoding: UTF-8 with BOM, CRLF.

(function () {
    function arg(name) {
        return app.scriptArgs.isDefined(name) ? app.scriptArgs.getValue(name) : "";
    }

    var tsvPath = arg("tsvPath");
    var saveAsPath = arg("saveAsPath");

    var f = new File(tsvPath);
    f.encoding = "UTF-8";
    if (!f.open("r")) throw new Error("cannot open tsv: " + tsvPath);
    var raw = f.read();
    f.close();
    // Normalize newlines to \r (InDesign paragraph ends) and drop a trailing one.
    raw = raw.replace(/\r\n/g, "\r").replace(/\n/g, "\r").replace(/\r+$/, "");

    var doc = app.documents.add();
    doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
    doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;

    // Paragraph styles UseReadyTable.v.7.jsx checks for (names from ForIndex.jsxinc).
    var grp = doc.paragraphStyleGroups.add({ name: "#IndexStyles" });
    var names = ["#Level1", "#Level2", "#Level3", "#Level4", "#PageShow"];
    for (var i = 0; i < names.length; i++) grp.paragraphStyles.add({ name: names[i] });

    var spread = doc.spreads[0];
    var frame = spread.textFrames.add();
    frame.geometricBounds = [0, 700, 9600, 1600]; // tall pasteboard frame, points
    frame.contents = raw;
    var story = frame.parentStory;
    story.texts[0].convertToTable("\t", "\r");

    // Thread more tall pasteboard frames until nothing is overset.
    var tail = frame;
    var added = 0;
    while (story.overflows && added < 40) {
        var nf = spread.textFrames.add();
        nf.geometricBounds = [0, 1700 + added * 950, 9600, 2600 + added * 950];
        tail.nextTextFrame = nf;
        tail = nf;
        added++;
    }
    if (story.overflows) throw new Error("still overset after " + added + " extension frames");

    var tbl = story.tables[0];
    var saveFile = new File(saveAsPath);
    doc.save(saveFile);

    // Cursor into the first cell — the state UseReadyTable requires.
    tbl.rows[0].cells[0].texts[0].insertionPoints[0].select();

    return "rows=" + tbl.rows.length + "|cols=" + tbl.columns.length + "|extraFrames=" + added + "|saved=" + saveFile.fsName;
})();
