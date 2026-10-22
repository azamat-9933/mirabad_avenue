// Billing period pages (templates/portal/billing_periods.html, billing_period_sheet.html).
// Labels come from billing.period_sheet.LABELS; app.js leaves these pages alone (data-stat-synced).
(() => {
    const labelsNode = document.getElementById("bp-labels");
    const labels = labelsNode ? JSON.parse(labelsNode.textContent || "{}") : {};
    const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const DAY_MS = 86400000;

    const currentLang = () => {
        try {
            return window.localStorage.getItem("hydroflow-lang") || "en";
        } catch {
            return "en";
        }
    };
    const t = (key, lang = currentLang()) => labels[key]?.[lang] || labels[key]?.en || key;

    const applyLabels = (lang) => {
        document.querySelectorAll("[data-pt]").forEach((element) => {
            element.textContent = t(element.dataset.pt, lang);
        });
        document.querySelectorAll("[data-pt-title]").forEach((element) => {
            element.setAttribute("title", t(element.dataset.ptTitle, lang));
        });
        document.querySelectorAll("[data-bp-export]").forEach((link) => {
            const url = new URL(link.getAttribute("href"), window.location.href);
            url.searchParams.set("lang", lang);
            link.setAttribute("href", `${url.pathname}${url.search}`);
        });
    };
    applyLabels(currentLang());
    document.addEventListener("hydroflow:language-changed", (event) => applyLabels(event.detail?.lang || currentLang()));

    // 1234567.5 -> "1 234 567,5", as the server formats amounts.
    const grouped = (value) => {
        const fixed = Math.abs(value).toFixed(2).replace(/\.?0+$/, "");
        const [integer, fraction] = fixed.split(".");
        const text = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return `${value < 0 ? "-" : ""}${text}${fraction ? `,${fraction}` : ""}`;
    };
    // "1 234,5" -> 1234.5; empty -> null; not a number -> NaN.
    const parseNumber = (text) => {
        const clean = String(text || "").replace(/[\s  ]/g, "").replace(",", ".");
        if (!clean) return null;
        const value = Number(clean);
        return Number.isFinite(value) ? value : NaN;
    };
    const isNumber = (value) => value !== null && !Number.isNaN(value);
    const parseDay = (text) => (text ? new Date(`${text}T00:00:00Z`) : null);
    const isoDay = (day) => day.toISOString().slice(0, 10);

    // ── list page: the Create window ──
    const createForm = document.querySelector("[data-bp-create-form]");
    if (createForm) {
        const nameInput = createForm.querySelector("[data-bp-name]");
        const startInput = createForm.querySelector("[data-bp-start]");
        const endInput = createForm.querySelector("[data-bp-end]");
        const daysOutput = createForm.querySelector("[data-bp-days]");
        let nameTouched = false;
        let endTouched = false;
        const syncDays = () => {
            const start = parseDay(startInput.value);
            const end = parseDay(endInput.value);
            daysOutput.textContent = start && end && end >= start ? String(Math.round((end - start) / DAY_MS) + 1) : "—";
        };
        nameInput.addEventListener("input", () => {
            nameTouched = true;
        });
        endInput.addEventListener("input", () => {
            endTouched = true;
            syncDays();
        });
        // A new start date suggests the month's name and its last day, until those are typed by hand.
        startInput.addEventListener("input", () => {
            const start = parseDay(startInput.value);
            if (start) {
                if (!nameTouched) nameInput.value = `${start.getUTCFullYear()}-${MONTHS_UZ[start.getUTCMonth()]}`;
                const end = parseDay(endInput.value);
                if (!endTouched || !end || end < start) {
                    endInput.value = isoDay(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)));
                }
            }
            syncDays();
        });
        syncDays();
        if (document.querySelector("[data-open-create]")) {
            window.setTimeout(() => document.querySelector("[data-modal-open='bp-create-modal']")?.click(), 0);
        }
    }

    // ── sheet page ──
    let dirty = false;
    const saveButton = document.querySelector("[data-bp-save]");
    const markChanged = (row) => {
        dirty = true;
        row?.classList.add("is-changed");
        saveButton?.classList.add("is-dirty");  // typed values not saved yet
    };

    const heatingTable = document.querySelector("[data-bp-heating]");
    if (heatingTable) {
        const periodStart = parseDay(heatingTable.dataset.periodStart);
        const periodEnd = parseDay(heatingTable.dataset.periodEnd);
        const rangeDays = (fromText, untilText) => {
            const from = parseDay(fromText);
            if (!from) return 0;
            const first = from > periodStart ? from : periodStart;
            const until = parseDay(untilText) || periodEnd;
            const last = until < periodEnd ? until : periodEnd;
            return last < first ? 0 : Math.round((last - first) / DAY_MS) + 1;
        };
        heatingTable.querySelectorAll("[data-bp-row]").forEach((row) => {
            const from = row.querySelector("[data-bp-from]");
            const until = row.querySelector("[data-bp-until]");
            const days = row.querySelector("[data-bp-days-given]");
            const rangeCell = row.querySelector("[data-bp-range]");
            const areaCell = row.querySelector("[data-bp-heated-area]");
            const area = Number(row.dataset.area || 0);
            if (!from || !until || !days) return;
            const showArea = () => {
                const given = Number(days.value) || 0;
                areaCell.textContent = grouped(area * Math.min(given, Number(rangeCell.textContent) || 0));
            };
            // Days equal to the whole range follow the dates; days typed by hand stay as typed.
            let previousRange = Number(rangeCell.textContent) || 0;
            const onDates = () => {
                const range = rangeDays(from.value, until.value);
                if (!from.value) {
                    days.value = "";
                } else if (days.value === "" || Number(days.value) === previousRange) {
                    days.value = String(range);
                }
                previousRange = range;
                rangeCell.textContent = String(range);
                showArea();
                markChanged(row);
            };
            from.addEventListener("change", onDates);
            until.addEventListener("change", onDates);
            days.addEventListener("input", () => {
                showArea();
                markChanged(row);
            });
        });
    }

    const hotWaterTable = document.querySelector("[data-bp-hot-water]");
    if (hotWaterTable) {
        hotWaterTable.querySelectorAll("[data-bp-row]").forEach((row) => {
            const start = row.querySelector("[data-bp-start-reading]");
            const end = row.querySelector("[data-bp-end-reading]");
            const used = row.querySelector("[data-bp-consumption]");
            if (!start || !end) return;
            const onReadings = () => {
                const startValue = parseNumber(start.value) ?? parseNumber(start.getAttribute("placeholder"));
                const endValue = parseNumber(end.value);
                used.textContent = isNumber(startValue) && isNumber(endValue) && endValue >= startValue ? grouped(endValue - startValue) : "—";
                markChanged(row);
            };
            start.addEventListener("input", onReadings);
            end.addEventListener("input", onReadings);
        });
    }

    // Save stores the table. Closing and reopening send the table too (with the hidden status), so
    // what was typed is saved before the period closes.
    const sheetForm = document.querySelector("[data-bp-sheet-form]");
    const statusTarget = sheetForm?.querySelector("[data-bp-status-target]");
    sheetForm?.addEventListener("submit", () => {
        dirty = false;  // leaving the sheet with typed, unsaved values asks first; saving does not
    });
    const submitWithStatus = (status) => {
        if (!sheetForm || !statusTarget) return;
        statusTarget.value = status;
        dirty = false;
        sheetForm.submit();
    };

    // Closing charges every resident: the handle has to be dragged all the way (a click on the track does
    // nothing), then the window asks once more. Let go early, or cancel, and it slides back.
    const closeSlider = document.querySelector("[data-bp-close-slider]");
    if (closeSlider) {
        const handle = closeSlider.querySelector("[data-bp-close-handle]");
        const modal = document.getElementById("bp-close-modal");
        let progress = 0;
        let drag = null;
        let confirmed = false;
        const travel = () => Math.max(1, closeSlider.clientWidth - handle.offsetWidth - 4);
        const show = (value, animate = false) => {
            progress = Math.min(1, Math.max(0, value));
            closeSlider.classList.toggle("is-animating", animate);
            closeSlider.style.setProperty("--bp-close-progress", String(progress));
            handle.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
        };
        const ask = () => {
            show(1, true);
            document.querySelector("[data-bp-close-opener]")?.click();
        };
        handle.addEventListener("pointerdown", (event) => {
            drag = { x: event.clientX, from: progress };
            handle.setPointerCapture(event.pointerId);
            closeSlider.classList.add("is-dragging");
        });
        handle.addEventListener("pointermove", (event) => {
            if (drag) show(drag.from + (event.clientX - drag.x) / travel());
        });
        const release = () => {
            if (!drag) return;
            drag = null;
            closeSlider.classList.remove("is-dragging");
            if (progress >= 0.97) ask();
            else show(0, true);
        };
        handle.addEventListener("pointerup", release);
        handle.addEventListener("pointercancel", release);
        handle.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") {
                show(progress + 0.1, true);
                if (progress >= 0.97) ask();
            } else if (event.key === "ArrowLeft" || event.key === "Home") {
                show(0, true);
            } else {
                return;
            }
            event.preventDefault();
        });
        modal?.querySelector("[data-bp-close-confirm]")?.addEventListener("click", (event) => {
            confirmed = true;
            event.currentTarget.disabled = true;
            submitWithStatus("closed");
        });
        // Cancel, the cross, Esc or a click outside close the window: the handle slides back.
        if (modal) {
            new MutationObserver(() => {
                if (modal.getAttribute("aria-hidden") === "true" && !confirmed) show(0, true);
            }).observe(modal, { attributes: true, attributeFilter: ["aria-hidden"] });
        }
    }

    // Reopening keeps the balances as they are; closing again posts only the differences.
    document.querySelector("[data-bp-reopen]")?.addEventListener("click", () => {
        if (window.confirm(t("reopen_confirm"))) submitWithStatus("open");
    });
    window.addEventListener("beforeunload", (event) => {
        if (!dirty) return;
        event.preventDefault();
        event.returnValue = "";
    });

    // Expenses and gas meter windows: add, drop and remove rows; the gas cost follows the readings.
    const syncGasRow = (row) => {
        const start = row.querySelector("[data-bp-gas-start]");
        const end = row.querySelector("[data-bp-gas-end]");
        const price = row.querySelector("[data-bp-gas-price]");
        if (!start || !end || !price) return;
        const startValue = parseNumber(start.value) ?? parseNumber(start.getAttribute("placeholder"));
        const endValue = parseNumber(end.value);
        const priceValue = parseNumber(price.value);
        const used = isNumber(startValue) && isNumber(endValue) && endValue >= startValue ? endValue - startValue : null;
        row.querySelector("[data-bp-gas-used]").textContent = used === null ? "—" : grouped(used);
        row.querySelector("[data-bp-gas-cost]").textContent = used === null || !isNumber(priceValue) ? "—" : grouped(used * priceValue);
    };
    document.querySelectorAll("[data-bp-rows-form]").forEach((form) => {
        const body = form.querySelector("[data-bp-rows]");
        const template = form.querySelector("[data-bp-row-template]");
        form.querySelector("[data-bp-add-row]")?.addEventListener("click", () => {
            body.querySelector("[data-bp-empty-row]")?.remove();
            const row = template.content.firstElementChild.cloneNode(true);
            row.querySelectorAll("[data-pt-title]").forEach((element) => element.setAttribute("title", t(element.dataset.ptTitle)));
            body.appendChild(row);
            row.querySelector("input")?.focus();
        });
        form.addEventListener("click", (event) => {
            event.target.closest("[data-bp-drop-row]")?.closest("tr")?.remove();
        });
        form.addEventListener("change", (event) => {
            const remove = event.target.closest("[data-bp-remove]");
            if (remove) remove.closest("tr")?.classList.toggle("is-removed", remove.checked);
        });
        form.addEventListener("input", (event) => {
            const row = event.target.closest("[data-bp-gas-row]");
            if (row) syncGasRow(row);
        });
    });

    // Deleting a period asks first.
    document.querySelectorAll("[data-bp-confirm]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            if (!window.confirm(t(form.dataset.bpConfirm))) event.preventDefault();
        });
    });
})();
