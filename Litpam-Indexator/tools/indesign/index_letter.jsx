// index_letter.jsx — additive minimal equivalent of ProcStoryOrDoс's theAction
// loop for ONE marker letter (H2776). Written because three InDesign-2026 DOM
// regressions break the authorial palette headless (everyItem().cells flatten,
// empty contents on everyItem chains, rows.itemByRange().select()) — per the
// H2589 guardrail this is the sanctioned "additive equivalent wrapper"; the
// authorial archive stays untouched.
//
// Reads the svodnaya table rows of one letter-span directly (row-by-row access
// works fine in 2026), builds the topic hierarchy (#Level1..4 paragraph styles),
// finds each black grep query in the pilot document (footnotes included) and
// adds CURRENT_PAGE page references. Matches on the pasteboard / in overset
// extension frames have no parentPage — they are skipped and logged, same as
// the authorial "[ ??? ]" branch. Rows with c1 != "№" get a topic but no page
// references. Existing topics of the letter are removed first (idempotent redo).
//
// Params via app.scriptArgs: letter, startRow, endRow, logPath, excludeFromPage,
// keepExisting (H2590 rebuild: optional, default "" == false -- skip the
// idempotent-redo drop-existing-topics-of-this-letter step below. Lets a
// single letter's row range be split across several short DoScript calls
// (each call is its own InDesign "long script" watchdog window) without the
// second+ chunk wiping the first chunk's just-added topics; pass "1" only for
// continuation chunks of the SAME letter within one rebuild run.)
// (H2590: excludeFromPage, optional -- skip any grep hit whose containing page
// number is >= this value. The original printed index block (old, unreplaced
// pages) is itself searchable body text that literally lists headwords with
// page numbers, so an unfiltered document-wide findGrep() picks up false-
// positive "occurrences" there. Confirmed live: 40% of Book II's topics had
// at least one contaminated reference into the old index pages before this
// fix. Page.name is compared numerically where possible; non-numeric page
// names (front matter, roman numerals) are never excluded by this filter.)
// ExtendScript ES3; UTF-8 BOM + CRLF.

(function () {
    function arg(n) { return app.scriptArgs.isDefined(n) ? app.scriptArgs.getValue(n) : ""; }
    var letter = arg("letter");
    var startRow = Number(arg("startRow"));
    var endRow = Number(arg("endRow"));
    var logPath = arg("logPath");
    var excludeFromPageArg = arg("excludeFromPage");
    var excludeFromPage = excludeFromPageArg !== "" ? Number(excludeFromPageArg) : null;
    var excludedByPageFilter = 0;
    var keepExisting = arg("keepExisting") == "1";

    var idoc = null, tdoc = null;
    for (var i = 0; i < app.documents.length; i++) {
        if (app.documents[i].name.indexOf("IndexList") != -1) idoc = app.documents[i];
        else if (app.documents[i].name.indexOf("pilot") != -1) tdoc = app.documents[i];
    }
    if (idoc == null || tdoc == null) throw new Error("need IndexList + pilot docs open");
    var tbl = null;
    for (var s = 0; s < idoc.stories.length && tbl == null; s++)
        if (idoc.stories[s].tables.length > 0) tbl = idoc.stories[s].tables[0];
    if (tbl == null) throw new Error("no table in IndexList doc");

    var ix = (tdoc.indexes.length > 0) ? tdoc.indexes[0] : tdoc.indexes.add();

    // idempotent redo: drop existing topics of this letter (skipped for a
    // keepExisting continuation chunk of an already-in-progress letter)
    var dropped = 0;
    if (!keepExisting) {
        for (var t = ix.topics.length - 1; t >= 0; t--) {
            var nm = String(ix.topics[t].name);
            if (nm.length > 1 && nm.charAt(0) == letter && nm.charAt(1) == "-") {
                try { ix.topics[t].remove(); dropped++; } catch (eD) {}
            }
        }
    }

    var logLines = ["index_letter " + letter + " rows " + startRow + "-" + endRow + " dropped=" + dropped];
    var parents = [null, null, null, null]; // topic objects for levels 1..4
    var made = 0, refs = 0, noPage = 0, notFound = 0, skipped = 0;

    app.findChangeGrepOptions.includeFootnotes = true;
    app.findChangeGrepOptions.includeHiddenLayers = false;
    app.findChangeGrepOptions.includeLockedLayersForFind = false;
    app.findChangeGrepOptions.includeLockedStoriesForFind = false;

    for (var r = startRow; r <= endRow; r++) {
        var c0 = String(tbl.rows[r].cells[0].texts[0].contents);
        var styleName = tbl.rows[r].cells[0].texts[0].appliedParagraphStyle.name; // #LevelN
        var lvl = Number(styleName.charAt(styleName.length - 1));
        if (isNaN(lvl) || lvl < 1 || lvl > 4) { skipped++; continue; }
        var wantPages = String(tbl.rows[r].cells[1].texts[0].contents) == "№"; // №
        var grep = String(tbl.rows[r].cells[2].texts[0].contents);
        var grepBlack = true;
        try { grepBlack = tbl.rows[r].cells[2].texts[0].fillColor.name == "Black"; } catch (eB) {}
        var charStyle = String(tbl.rows[r].cells[3].texts[0].contents);

        // topic at its level, parented by the level above
        var topic = null;
        try {
            if (lvl == 1) topic = ix.topics.add(c0);
            else if (parents[lvl - 2] != null) topic = parents[lvl - 2].topics.add(c0);
            else { skipped++; continue; }
        } catch (eT) {
            topic = (lvl == 1) ? ix.topics.itemByName(c0) : parents[lvl - 2].topics.itemByName(c0);
        }
        parents[lvl - 1] = topic;
        for (var pz = lvl; pz < 4; pz++) parents[pz] = null;
        made++;

        if (!wantPages) continue;
        if (grep == "" || grep == "Z" || !grepBlack) { skipped++; continue; }

        app.findGrepPreferences = NothingEnum.nothing;
        app.findGrepPreferences.findWhat = grep;
        if (charStyle != "") {
            try { app.findGrepPreferences.appliedCharacterStyle = charStyle; }
            catch (eS) { logLines.push("\tSTYLE? " + c0 + " [" + charStyle + "]"); }
        }
        var found = [];
        try { found = tdoc.findGrep(); }
        catch (eF) { logLines.push("\tGREP-ERR " + c0 + " :: " + eF.message); continue; }
        if (found.length == 0) { notFound++; logLines.push("\t" + c0 + " [ не найдено ]"); continue; }
        var refsAddedForThisRow = 0;
        for (var g = found.length - 1; g >= 0; g--) {
            var pageOk = false;
            var pageNum = null;
            try {
                pageOk = found[g].parentTextFrames.length > 0 && found[g].parentTextFrames[0].parentPage != null;
                if (pageOk) pageNum = Number(found[g].parentTextFrames[0].parentPage.name);
            }
            catch (eP) { pageOk = false; }
            if (!pageOk) { noPage++; continue; } // pasteboard / overset extension frames — как авторская ветка [ ??? ]
            if (excludeFromPage != null && !isNaN(pageNum) && pageNum >= excludeFromPage) {
                excludedByPageFilter++;
                continue; // false positive: hit lands inside the old printed index block itself
            }
            try {
                topic.pageReferences.add(found[g].insertionPoints[0], PageReferenceType.CURRENT_PAGE);
                refs++;
                refsAddedForThisRow++;
            } catch (eR) { logLines.push("\tREF-ERR " + c0 + " :: " + eR.message); }
        }
        if (refsAddedForThisRow == 0 && found.length > 0) {
            logLines.push("\t" + c0 + " [ только в исключённом диапазоне страниц (старый указатель) ]");
        }
    }
    app.findGrepPreferences = NothingEnum.nothing;

    if (logPath != "") {
        var lf = new File(logPath);
        lf.encoding = "UTF-8";
        lf.open("a");
        lf.write(logLines.join("\r\n") + "\r\n");
        lf.close();
    }
    "letter=" + letter + "|topics=" + made + "|refs=" + refs + "|excludedByPageFilter=" + excludedByPageFilter + "|notFound=" + notFound +
        "|noPage=" + noPage + "|skipped=" + skipped + "|dropped=" + dropped;
})();
