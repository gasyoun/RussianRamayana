// resolve_overset.jsx — additive overset resolver for the Book-I pilot copy (H2776, step 6).
//
// The MANUAL pipeline's own guards refuse to run stages [1]/[3] while any story
// overflows. The three known overset stories (2019 title blurb, 2085 copyright,
// 12223 tagged c-/d- working story) were human-waived at the conversion gate
// (MG 15-08-2026, H2770 adjudication), so this script drains their overset into
// NEW text frames threaded onto the PASTEBOARD of the story's own spread:
// nothing on any page moves, no text is deleted, and the operation is reversible
// (delete the added frames and the overset returns). Frames are labeled
// "H2776-overset-extension" for later identification/removal.
//
// Params via app.scriptArgs (set by resolve_overset.py):
//   mode       "report" (no mutation) | "fix"
//   storyIds   comma-separated numeric story ids to fix; empty = all overflowing
//   reportPath absolute path of the report txt to (over)write
//
// ExtendScript (ES3). Encoding: UTF-8 with BOM, CRLF — per repo convention.

(function () {
    function arg(name) {
        var v = app.scriptArgs.isDefined(name) ? app.scriptArgs.getValue(name) : "";
        return v;
    }

    function esc(s) {
        return String(s).replace(/\|/g, "/").replace(/[\r\n]+/g, " ");
    }

    var mode = arg("mode") || "report";
    var reportPath = arg("reportPath");
    var idsRaw = arg("storyIds");
    var onlyIds = {};
    var restrict = false;
    if (idsRaw && idsRaw.length > 0) {
        restrict = true;
        var parts = idsRaw.split(",");
        for (var p = 0; p < parts.length; p++) onlyIds[parts[p]] = true;
    }

    var doc = app.activeDocument;
    var lines = [];
    lines.push("DOC=" + esc(doc.name));
    lines.push("MODE=" + mode);

    function visibleChars(story) {
        var n = 0;
        for (var c = 0; c < story.textContainers.length; c++) {
            n += story.textContainers[c].characters.length;
        }
        return n;
    }

    function frameHome(frame) {
        try {
            if (frame.parentPage !== null) return "page " + frame.parentPage.name;
        } catch (e) {}
        return "PASTEBOARD";
    }

    var fixedCount = 0;
    var stillOverset = 0;

    for (var i = 0; i < doc.stories.length; i++) {
        var story = doc.stories[i];
        if (!story.overflows) continue;
        var sid = String(story.id);
        var last = story.textContainers[story.textContainers.length - 1];
        var vis = visibleChars(story);
        var total = story.characters.length;
        lines.push(
            "OVERSET_STORY|" + esc(sid) + "|containers=" + story.textContainers.length +
            "|lastFrameAt=" + esc(frameHome(last)) + "|visibleChars=" + vis +
            "|totalChars=" + total + "|oversetChars=" + (total - vis) +
            "|head=" + esc(story.contents.toString().substr(0, 50))
        );
        if (mode !== "fix") { stillOverset++; continue; }
        if (restrict && !onlyIds[sid]) {
            lines.push("SKIPPED_NOT_WHITELISTED|" + esc(sid));
            stillOverset++;
            continue;
        }

        // Thread extension frames on the pasteboard of the last frame's spread
        // until the story no longer overflows (safety cap 12 frames).
        var spread;
        try {
            spread = (last.parentPage !== null) ? last.parentPage.parent : last.parent;
        } catch (e2) {
            spread = doc.spreads[0];
        }
        var added = 0;
        var tail = last;
        while (story.overflows && added < 12) {
            var nf = spread.textFrames.add();
            // Far left of the spread's pasteboard, generously sized, stacked downward.
            nf.geometricBounds = [added * 620, -1400, 600 + added * 620, -800];
            nf.label = "H2776-overset-extension";
            tail.nextTextFrame = nf;
            tail = nf;
            added++;
        }
        if (story.overflows) {
            lines.push("FIX_FAILED_STILL_OVERSET|" + esc(sid) + "|framesAdded=" + added);
            stillOverset++;
        } else {
            lines.push("FIXED|" + esc(sid) + "|framesAdded=" + added);
            fixedCount++;
        }
    }

    lines.push("FIXED_COUNT=" + fixedCount);
    lines.push("STILL_OVERSET_COUNT=" + stillOverset);

    if (reportPath && reportPath.length > 0) {
        var f = new File(reportPath);
        f.encoding = "UTF-8";
        f.open("w");
        f.write(lines.join("\r\n") + "\r\n");
        f.close();
    }

    return lines.join("\n");
})();
