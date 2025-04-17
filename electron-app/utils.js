// Utility functions for formatting and summary logic
function formatDistance(meters) {
    if (meters == null || isNaN(meters)) return '';
    return `${(meters / 1000).toFixed(2)} km / ${(meters / 1609.34).toFixed(2)} mi`;
}

function formatDuration(seconds) {
    if (seconds == null || isNaN(seconds)) return '';
    seconds = Math.round(seconds);
    if (seconds < 60) return `${seconds} sec`;
    if (seconds < 3600) return `${Math.floor(seconds/60)} min ${seconds%60} sec`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h} hr${h > 1 ? 's' : ''} ${m} min`;
}

function patchSummaryFields(obj) {
    // Always convert to human-readable, even if already present
    // Support both snake_case and camelCase keys
    if (obj.total_distance != null) {
        obj.total_distance = formatDistance(Number(obj.total_distance));
    }
    if (obj.totalDistance != null) {
        obj.totalDistance = formatDistance(Number(obj.totalDistance));
    }
    if (obj.total_timer_time != null) {
        obj.total_timer_time = formatDuration(Number(obj.total_timer_time));
    }
    if (obj.totalTimerTime != null) {
        obj.totalTimerTime = formatDuration(Number(obj.totalTimerTime));
    }
    if (obj.total_elapsed_time != null) {
        obj.total_elapsed_time = formatDuration(Number(obj.total_elapsed_time));
    }
    if (obj.totalElapsedTime != null) {
        obj.totalElapsedTime = formatDuration(Number(obj.totalElapsedTime));
    }
    if (obj.duration != null) {
        obj.duration = formatDuration(Number(obj.duration));
    }
    if (obj.avg_speed != null) {
        obj.avg_speed = (Number(obj.avg_speed) * 3.6).toFixed(2) + ' km/h / ' + (Number(obj.avg_speed) * 2.23694).toFixed(2) + ' mph';
    }
    if (obj.avgSpeed != null) {
        obj.avgSpeed = (Number(obj.avgSpeed) * 3.6).toFixed(2) + ' km/h / ' + (Number(obj.avgSpeed) * 2.23694).toFixed(2) + ' mph';
    }
    if (obj.max_speed != null) {
        obj.max_speed = (Number(obj.max_speed) * 3.6).toFixed(2) + ' km/h / ' + (Number(obj.max_speed) * 2.23694).toFixed(2) + ' mph';
    }
    if (obj.maxSpeed != null) {
        obj.maxSpeed = (Number(obj.maxSpeed) * 3.6).toFixed(2) + ' km/h / ' + (Number(obj.maxSpeed) * 2.23694).toFixed(2) + ' mph';
    }
    if (obj.enhanced_avg_speed != null) {
        obj.enhanced_avg_speed = (Number(obj.enhanced_avg_speed) * 3.6).toFixed(2) + ' km/h / ' + (Number(obj.enhanced_avg_speed) * 2.23694).toFixed(2) + ' mph';
    }
    if (obj.enhancedAvgSpeed != null) {
        obj.enhancedAvgSpeed = (Number(obj.enhancedAvgSpeed) * 3.6).toFixed(2) + ' km/h / ' + (Number(obj.enhancedAvgSpeed) * 2.23694).toFixed(2) + ' mph';
    }
    if (obj.enhanced_max_speed != null) {
        obj.enhanced_max_speed = (Number(obj.enhanced_max_speed) * 3.6).toFixed(2) + ' km/h / ' + (Number(obj.enhanced_max_speed) * 2.23694).toFixed(2) + ' mph';
    }
    if (obj.enhancedMaxSpeed != null) {
        obj.enhancedMaxSpeed = (Number(obj.enhancedMaxSpeed) * 3.6).toFixed(2) + ' km/h / ' + (Number(obj.enhancedMaxSpeed) * 2.23694).toFixed(2) + ' mph';
    }
    // Timestamps: convert to readable date/time if not already a string
    if (obj.timestamp != null && typeof obj.timestamp === 'number') {
        obj.timestamp = new Date(obj.timestamp * 1000).toString();
    }
    if (obj.start_time != null && typeof obj.start_time === 'number') {
        obj.start_time = new Date(obj.start_time * 1000).toString();
    }
    if (obj.startTime != null && typeof obj.startTime === 'number') {
        obj.startTime = new Date(obj.startTime * 1000).toString();
    }
}

function displayTables(dataFrames) {
    console.log('[DEBUG] displayTables called', dataFrames);
    const aq = window.aq;
    const container = document.getElementById("content-data");
    container.innerHTML = "";
    const keys = Object.keys(dataFrames);
    console.log('[DEBUG] Table keys:', keys);
    keys.sort((a, b) => (a === "recordMesgs" ? -1 : b === "recordMesgs" ? 1 : 0));
    keys.forEach((key, index) => {
        try {
            const table = aq.from(dataFrames[key]);
            console.log(`[DEBUG] Rendering table for key: ${key}, rows:`, table.numRows());
            renderTable(container, key, table, index);
        } catch (e) {
            console.error(`[ERROR] Failed to render table for key: ${key}`, e);
        }
    });
}

function renderTable(container, title, table, index) {
    const tableId = "datatable_" + index;
    const section = document.createElement("div");
    section.classList.add("table-section");
    const header = document.createElement("div");
    header.classList.add("table-header");
    const leftSpan = document.createElement("span");
    leftSpan.textContent = title;
    const rightContainer = document.createElement("div");
    rightContainer.style.display = "flex";
    rightContainer.style.alignItems = "center";
    rightContainer.style.gap = "10px";
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy as CSV";
    copyButton.classList.add("copy-btn");
    copyButton.onclick = (event) => {
        event.stopPropagation();
        copyTableAsCSV(table, title);
    };
    const icon = document.createElement("span");
    icon.textContent = "➕";
    rightContainer.appendChild(copyButton);
    rightContainer.appendChild(icon);
    header.appendChild(leftSpan);
    header.appendChild(rightContainer);
    header.onclick = () => {
        const content = document.getElementById(tableId + "_content");
        const currentDisplay = window.getComputedStyle(content).display;
        const isVisible = currentDisplay === "block";
        content.style.display = isVisible ? "none" : "block";
        icon.textContent = isVisible ? "➕" : "➖";
    };
    const content = document.createElement("div");
    content.classList.add("table-content");
    content.id = tableId + "_content";
    content.style.display = "none";
    const tableElement = document.createElement("table");
    tableElement.id = tableId;
    tableElement.classList.add("display");
    tableElement.innerHTML = table.toHTML({ limit: Infinity });
    content.appendChild(tableElement);
    section.appendChild(header);
    section.appendChild(content);
    container.appendChild(section);
    $(document).ready(function () {
        setTimeout(() => {
            try {
                if ($.fn.DataTable) {
                    console.log(`[DEBUG] Initializing DataTable for #${tableId}`);
                    $("#" + tableId).DataTable({
                        paging: false,
                        searching: true,
                        ordering: true,
                        autoWidth: true,
                    });
                } else {
                    console.error('[ERROR] DataTables.js is not loaded');
                }
            } catch (e) {
                console.error(`[ERROR] DataTable init failed for #${tableId}`, e);
            }
        }, 100);
    });
}

function copyTableAsCSV(table, title) {
    const rows = table.objects().map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
            const cell = row[key];
            newRow[key] = (typeof cell === 'object' && cell !== null) ? JSON.stringify(cell) : cell;
        });
        return newRow;
    });
    const flattenedTable = window.aq.from(rows);
    const csvString = flattenedTable.toCSV({ header: true });
    navigator.clipboard.writeText(csvString)
        .then(() => console.log("Copied CSV to clipboard!"))
        .catch(err => console.error("Failed to copy CSV:", err));
}

function renderChart() {
    const chartContainer = document.getElementById("content-chart");
    chartContainer.innerHTML = '<div id="vega-container"></div>';
    if (globalData && globalData.recordMesgs) {
        const aq = window.aq;
        const recordTable = aq.from(globalData.recordMesgs);
        const columnsToFold = recordTable.columnNames().filter(col => col !== "timestamp");
        const folded = recordTable.fold(columnsToFold, { as: ["key", "value"] });
        const spec = {
            "config": {
                "background": "#181a20",
                "text": {
                    "color": "#e0e0e0",
                    "fontSize": 14
                },
                "title": {
                    "anchor": "middle",
                    "fontWeight": "normal",
                    "titleFontWeight": "normal",
                    "labelFontWeight": "normal",
                    "fontSize": 30,
                    "titleFontSize": 16,
                    "labelFontSize": 14,
                    "color": "#e0e0e0",
                    "titleColor": "#e0e0e0",
                    "labelColor": "#e0e0e0",
                    "tickColor": "#888",
                    "domainColor": "#888"
                },
                "header": {
                    "titleFontSize": 22,
                    "labelFontSize": 18,
                    "color": "#e0e0e0",
                    "titleColor": "#e0e0e0",
                    "labelColor": "#e0e0e0",
                    "fontWeight": "normal",
                    "titleFontWeight": "normal",
                    "labelFontWeight": "normal"
                },
                "view": {
                    "height": 800,
                    "width": 800,
                    "strokeWidth": 0,
                    "fill": "#23263a"
                },
                "axis": {
                    "domain": true,
                    "domainColor": "#888",
                    "domainWidth": 1,
                    "gridWidth": 1,
                    "labelAngle": 0,
                    "tickSize": 5,
                    "gridCap": "round",
                    "gridDash": [2, 4],
                    "fontWeight": "normal",
                    "titleFontWeight": "normal",
                    "labelFontWeight": "normal",
                    "fontSize": 30,
                    "titleFontSize": 16,
                    "labelFontSize": 14,
                    "color": "#e0e0e0",
                    "titleColor": "#e0e0e0",
                    "labelColor": "#e0e0e0",
                    "tickColor": "#888"
                },
                "axisX": {
                    "titleAnchor": "end",
                    "titleAlign": "center"
                },
                "axisY": {
                    "titleAnchor": "end",
                    "titleAngle": 0,
                    "titleAlign": "center",
                    "titleY": -15,
                    "titleX": 0
                },
                "legend": {
                    "fontWeight": "normal",
                    "titleFontWeight": "normal",
                    "labelFontWeight": "normal",
                    "fontSize": 30,
                    "titleFontSize": 16,
                    "labelFontSize": 14,
                    "color": "#e0e0e0",
                    "titleColor": "#e0e0e0",
                    "labelColor": "#e0e0e0",
                    "tickColor": "#888",
                    "domainColor": "#888"
                }
            },
            "data": { "values": folded.objects() },
            "facet": {
                "row": {
                    "field": "key",
                    "header": {
                        "labelOrient": "right",
                        "labelAngle": 0
                    },
                    "type": "nominal"
                }
            },
            "spec": {
                "layer": [
                    {
                        "mark": {
                            "type": "line",
                            "color": "#1f77b4"
                        },
                        "encoding": {
                            "opacity": {
                                "value": 0.2
                            },
                            "x": {
                                "field": "timestamp",
                                "title": "Elapsed time (seconds)",
                                "type": "temporal"
                            },
                            "y": {
                                "field": "value",
                                "scale": {
                                    "zero": false
                                },
                                "title": "",
                                "type": "quantitative"
                            }
                        },
                        "name": "view_11"
                    },
                    {
                        "mark": {
                            "type": "line",
                            "color": "#1f77b4"
                        },
                        "encoding": {
                            "opacity": {
                                "value": 1
                            },
                            "x": {
                                "field": "timestamp",
                                "type": "temporal"
                            },
                            "y": {
                                "field": "value",
                                "scale": {
                                    "zero": false
                                },
                                "type": "quantitative"
                            }
                        },
                        "transform": [
                            {
                                "filter": {
                                    "param": "param_11"
                                }
                            }
                        ]
                    },
                    {
                        "mark": {
                            "type": "rule",
                            "color": "firebrick",
                            "strokeDash": [5, 5]
                        },
                        "encoding": {
                            "x": {
                                "aggregate": "min",
                                "field": "timestamp",
                                "type": "temporal"
                            },
                            "x2": {
                                "aggregate": "max",
                                "field": "timestamp"
                            },
                            "y": {
                                "aggregate": "min",
                                "field": "value",
                                "scale": {
                                    "zero": false
                                },
                                "type": "quantitative"
                            }
                        },
                        "transform": [
                            {
                                "filter": {
                                    "param": "param_11"
                                }
                            }
                        ]
                    },
                    {
                        "mark": {
                            "type": "text",
                            "color": "#1f77b4",
                            "dx": 0,
                            "dy": -50,
                            "size": 20
                        },
                        "encoding": {
                            "text": {
                                "aggregate": "mean",
                                "field": "value",
                                "format": ".3f",
                                "type": "quantitative"
                            },
                            "x": {
                                "aggregate": "mean",
                                "field": "timestamp",
                                "type": "temporal"
                            },
                            "y": {
                                "aggregate": "min",
                                "field": "value",
                                "scale": {
                                    "zero": false
                                },
                                "type": "quantitative"
                            }
                        },
                        "transform": [
                            {
                                "filter": {
                                    "param": "param_11"
                                }
                            }
                        ]
                    },
                    {
                        "mark": {
                            "type": "text",
                            "color": "firebrick",
                            "dx": 0,
                            "dy": -10,
                            "size": 14
                        },
                        "encoding": {
                            "text": {
                                "aggregate": "count",
                                "field": "value",
                                "format": ".3f",
                                "type": "quantitative"
                            },
                            "x": {
                                "aggregate": "mean",
                                "field": "timestamp",
                                "type": "temporal"
                            },
                            "y": {
                                "aggregate": "min",
                                "field": "value",
                                "scale": {
                                    "zero": false
                                },
                                "type": "quantitative"
                            }
                        },
                        "transform": [
                            {
                                "filter": {
                                    "param": "param_11"
                                }
                            }
                        ]
                    },
                    {
                        "mark": {
                            "type": "text",
                            "color": "firebrick",
                            "dx": -20,
                            "dy": -10,
                            "size": 14
                        },
                        "encoding": {
                            "text": {
                                "aggregate": "min",
                                "field": "timestamp",
                                "formatType": "time",
                                "timeUnit": "hoursminutesseconds",
                                "type": "temporal"
                            },
                            "x": {
                                "aggregate": "min",
                                "field": "timestamp",
                                "type": "temporal"
                            },
                            "y": {
                                "aggregate": "min",
                                "field": "value",
                                "scale": {
                                    "zero": false
                                },
                                "type": "quantitative"
                            }
                        },
                        "transform": [
                            {
                                "filter": {
                                    "param": "param_11"
                                }
                            }
                        ]
                    },
                    {
                        "mark": {
                            "type": "text",
                            "color": "firebrick",
                            "dx": 20,
                            "dy": -10,
                            "size": 14
                        },
                        "encoding": {
                            "text": {
                                "aggregate": "max",
                                "field": "timestamp",
                                "formatType": "time",
                                "timeUnit": "hoursminutesseconds",
                                "type": "temporal"
                            },
                            "x": {
                                "aggregate": "max",
                                "field": "timestamp",
                                "type": "temporal"
                            },
                            "y": {
                                "aggregate": "min",
                                "field": "value",
                                "scale": {
                                    "zero": false
                                },
                                "type": "quantitative"
                            }
                        },
                        "transform": [
                            {
                                "filter": {
                                    "param": "param_11"
                                }
                            }
                        ]
                    }
                ],
                "height": 200,
                "width": 800
            },
            "params": [
                {
                    "name": "param_11",
                    "select": {
                        "type": "interval",
                        "encodings": [
                            "x"
                        ]
                    },
                    "views": [
                        "view_11"
                    ]
                }
            ],
            "resolve": {
                "scale": {
                    "x": "independent",
                    "y": "independent"
                }
            },
            "spacing": 25,
            "$schema": "https://vega.github.io/schema/vega-lite/v5.20.1.json"
        };
        vegaEmbed("#vega-container", spec).catch(console.error);
    } else {
        chartContainer.innerHTML = "<p>No recordMesgs data available for chart.</p>";
    }
}

function renderMap() {
    const mapContainer = document.getElementById("content-map");
    mapContainer.innerHTML = '<div id="leaflet-map" style="height: 800px;"></div>';
    const map = L.map('leaflet-map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    if (globalData && globalData.recordMesgs) {
        const coords = globalData.recordMesgs
            .filter(row => row.positionLat != null && row.positionLong != null)
            .map(row => [Number(row.positionLat / 2 ** 31 * 180), Number(row.positionLong / 2 ** 31 * 180)]);
        if (coords.length > 0) {
            const polyline = L.polyline(coords, { color: 'blue' }).addTo(map);
            map.fitBounds(polyline.getBounds());
        } else {
            mapContainer.innerHTML = '<p>No location data available to display map.</p>';
        }
    } else {
        mapContainer.innerHTML = '<p>No location data available to display map.</p>';
    }
}

function renderSummary(data) {
    const container = document.getElementById("content-summary");
    container.innerHTML = "";
    let summaryRows = [];
    // Main summary table logic
    if (data.sessionMesgs && data.sessionMesgs.length > 0) {
        const raw = { ...data.sessionMesgs[0] };
        patchSummaryFields(raw);
        if (raw.total_ascent != null) {
            raw.total_ascent_ft = (raw.total_ascent * 3.28084).toFixed(0) + ' ft';
        }
        if (raw.total_descent != null) {
            raw.total_descent_ft = (raw.total_descent * 3.28084).toFixed(0) + ' ft';
        }
        summaryRows = [raw];
    } else if (data.recordMesgs && data.recordMesgs.length > 0) {
        const aq = window.aq;
        const table = aq.from(data.recordMesgs);
        const stats = {
            total_records: table.numRows(),
            start_time: table.get(0, 'timestamp'),
            end_time: table.get(table.numRows() - 1, 'timestamp'),
        };
        if (table.columnNames().includes('distance')) {
            const dist = table.get(table.numRows() - 1, 'distance');
            stats.total_distance = formatDistance(dist);
        }
        if (table.columnNames().includes('timestamp')) {
            const start = new Date(table.get(0, 'timestamp'));
            const end = new Date(table.get(table.numRows() - 1, 'timestamp'));
            const sec = Math.round((end - start) / 1000);
            stats.duration = formatDuration(sec);
        }
        if (table.columnNames().includes('speed')) {
            const avg = table.array('speed').reduce((a, b) => a + b, 0) / table.numRows();
            const max = Math.max(...table.array('speed'));
            stats.avg_speed = (avg * 3.6).toFixed(2) + ' km/h / ' + (avg * 2.23694).toFixed(2) + ' mph';
            stats.max_speed = (max * 3.6).toFixed(2) + ' km/h / ' + (max * 2.23694).toFixed(2) + ' mph';
        }
        if (table.columnNames().includes('altitude')) {
            const min = Math.min(...table.array('altitude'));
            const max = Math.max(...table.array('altitude'));
            stats.min_altitude_ft = (min * 3.28084).toFixed(0) + ' ft';
            stats.max_altitude_ft = (max * 3.28084).toFixed(0) + ' ft';
        }
        patchSummaryFields(stats);
        summaryRows = [stats];
    } else {
        container.innerHTML = '<p>No summary data available.</p>';
        return;
    }
    // Render main summary as a table with a title and inline copy button
    const summarySection = document.createElement('div');
    summarySection.style.marginBottom = '18px';
    const summaryHeaderBar = document.createElement('div');
    summaryHeaderBar.className = 'header-bar';
    const summaryTitle = document.createElement('h3');
    summaryTitle.textContent = 'Activity Summary';
    summaryTitle.style.margin = '0 12px 0 0';
    summaryHeaderBar.appendChild(summaryTitle);
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy as CSV';
    copyBtn.className = 'copy-btn';
    copyBtn.onclick = () => {
        if (summaryRows.length > 0) {
            const csv = [Object.keys(summaryRows[0]).join(",") + "\n" + Object.values(summaryRows[0]).join(",")];
            navigator.clipboard.writeText(csv.join("\n"));
        }
    };
    summaryHeaderBar.appendChild(copyBtn);
    summaryHeaderBar.style.display = 'flex';
    summaryHeaderBar.style.alignItems = 'center';
    summaryHeaderBar.style.gap = '10px';
    summarySection.appendChild(summaryHeaderBar);
    const table = document.createElement('table');
    table.classList.add('display');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');
    Object.keys(summaryRows[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    const dataRow = document.createElement('tr');
    Object.values(summaryRows[0]).forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        dataRow.appendChild(td);
    });
    tbody.appendChild(dataRow);
    table.appendChild(thead);
    table.appendChild(tbody);
    summarySection.appendChild(table);
    container.appendChild(summarySection);

    // Lap summary table
    if (data.lapMesgs && data.lapMesgs.length > 0) {
        const lapSection = document.createElement('div');
        lapSection.style.marginBottom = '18px';
        // Use all keys from first lap for header
        const lapKeys = Object.keys(data.lapMesgs[0]);
        // Patch all lap rows for human readable fields
        const patchedLaps = data.lapMesgs.map(lap => {
            const patched = { ...lap };
            patchSummaryFields(patched);
            return patched;
        });
        // Copy as CSV for lap summary
        const lapHeaderBar = document.createElement('div');
        lapHeaderBar.className = 'header-bar';
        const lapHeading = document.createElement('h3');
        lapHeading.textContent = 'Lap Summary';
        lapHeading.style.margin = '0 12px 0 0';
        lapHeaderBar.appendChild(lapHeading);
        const lapCopyBtn = document.createElement('button');
        lapCopyBtn.textContent = 'Copy as CSV';
        lapCopyBtn.className = 'copy-btn';
        lapCopyBtn.onclick = () => {
            const csvRows = [lapKeys.join(",")];
            patchedLaps.forEach(lap => {
                const row = lapKeys.map(key => lap[key]);
                csvRows.push(row.join(","));
            });
            navigator.clipboard.writeText(csvRows.join("\n"));
        };
        lapHeaderBar.appendChild(lapCopyBtn);
        lapHeaderBar.style.display = 'flex';
        lapHeaderBar.style.alignItems = 'center';
        lapHeaderBar.style.gap = '10px';
        lapSection.appendChild(lapHeaderBar);
        const lapTable = document.createElement('table');
        lapTable.classList.add('display');
        const lapThead = document.createElement('thead');
        const lapTbody = document.createElement('tbody');
        const lapHeaderRow = document.createElement('tr');
        lapKeys.forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            lapHeaderRow.appendChild(th);
        });
        lapThead.appendChild(lapHeaderRow);
        // Data rows
        patchedLaps.forEach(lap => {
            const lapRow = document.createElement('tr');
            lapKeys.forEach(key => {
                lapRow.appendChild(Object.assign(document.createElement('td'), { textContent: lap[key] }));
            });
            lapTbody.appendChild(lapRow);
        });
        lapTable.appendChild(lapThead);
        lapTable.appendChild(lapTbody);
        lapSection.appendChild(lapTable);
        container.appendChild(lapSection);
    }
}
window.renderSummary = renderSummary;

// Export for use in index.html
window.formatDistance = formatDistance;
window.formatDuration = formatDuration;
window.patchSummaryFields = patchSummaryFields;
window.displayTables = displayTables;
window.renderTable = renderTable;
window.copyTableAsCSV = copyTableAsCSV;
window.renderChart = renderChart;
window.renderMap = renderMap;
