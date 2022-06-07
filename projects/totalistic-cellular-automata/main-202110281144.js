(() => {
  // lib.js
  var getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  };
  var getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  var shuffle = (arr) => arr.map((value) => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
  var totalisticStates = (colors) => 3 * colors - 2;
  var maxState = (colors) => colors - 1;
  var tableStrRegexp = (colors) => new RegExp(`^[0-${maxState(colors)}]{${totalisticStates(colors)}}$`);
  var tableStrToArray = (colors) => (str) => {
    const re = tableStrRegexp(colors);
    if (!re.test(str))
      return null;
    return str.split("").map((c) => Number(c));
  };
  var tableArrayToStr = (arr) => arr.join("");
  var randomTable = (colors) => () => Array.from({ length: totalisticStates(colors) }, () => getRandomIntInclusive(0, maxState(colors)));
  var randomBalancedTable = (colors) => () => {
    const states = Array.from({ length: colors }, (_, i) => ({ value: i, count: 1 }));
    const shuffledStates = shuffle(states);
    let remaining = totalisticStates(colors) - colors;
    shuffledStates.slice(1).forEach((stateObj) => {
      const inc = getRandomIntInclusive(0, remaining);
      stateObj.count += inc;
      remaining -= inc;
    });
    shuffledStates[0].count += remaining;
    const table = shuffledStates.flatMap((stateObj) => new Array(stateObj.count).fill(stateObj.value));
    return shuffle(table);
  };
  var PALETTE_SEPARATOR = "_";
  var paletteColorRegexp = new RegExp("^([0-9]|[a-f]){6}$");
  var testPaletteStr = (colors) => (str) => {
    if (str === null)
      return false;
    const paletteColors = str.split(PALETTE_SEPARATOR);
    if (paletteColors.length !== colors)
      return false;
    return paletteColors.every((colorStr) => paletteColorRegexp.test(colorStr));
  };
  var paletteStrToArray = (colors) => (str) => {
    if (!testPaletteStr(colors)(str))
      return null;
    return str.split(PALETTE_SEPARATOR).map((paletteColor) => `#${paletteColor}`);
  };
  var paletteArrayToStr = (arr) => arr.map((colorHex) => colorHex.substring(1)).join(PALETTE_SEPARATOR);
  var randomPaletteColor = () => {
    const n = Math.floor(Math.random() * 16777215);
    const hex = n.toString(16);
    const paddedHex = hex.padStart(6, "0");
    return "#" + paddedHex;
  };
  var randomPalette = (colors) => () => Array.from({ length: colors }, () => randomPaletteColor());
  var rowStrRegexp = (colors) => new RegExp(`^[0-${maxState(colors)}]+$`);
  var rowStrToArray = (colors) => (str) => {
    const re = rowStrRegexp(colors);
    if (!re.test(str))
      return null;
    return str.split("").map((c) => Number(c));
  };
  var rowArrayToStr = (arr) => arr.join("");
  var randomRow = (colors) => (len) => Array.from({ length: len }, () => getRandomInt(0, colors));
  var newRow = (row, table) => {
    const len = row.length;
    return row.map((cur, i) => {
      const prev = i > 0 ? row[i - 1] : row[len - 1];
      const next = i < len - 1 ? row[i + 1] : row[0];
      const sum = prev + cur + next;
      return table[sum];
    });
  };
  var createGrid = (rows, table, firstRow) => {
    let row = firstRow;
    let grid = [];
    for (let r = 0; r < rows; r++) {
      grid.push(row);
      row = newRow(row, table);
    }
    return grid;
  };
  var drawGrid = (canvas, grid, cellSize, palette) => {
    const ctx = canvas.getContext("2d");
    grid.forEach((row, r) => {
      row.forEach((val, c) => {
        const x = c * cellSize;
        const y = r * cellSize;
        ctx.fillStyle = palette[val];
        ctx.fillRect(x, y, cellSize, cellSize);
      });
    });
  };
  var totatlisticCellularAutomatonFunctions = (colors) => ({
    tableStrToArray: tableStrToArray(colors),
    tableArrayToStr,
    randomTable: randomTable(colors),
    randomBalancedTable: randomBalancedTable(colors),
    paletteStrToArray: paletteStrToArray(colors),
    paletteArrayToStr,
    randomPalette: randomPalette(colors),
    rowStrToArray: rowStrToArray(colors),
    rowArrayToStr,
    randomRow: randomRow(colors),
    createGrid,
    drawGrid
  });
  var resizeCanvas = (canvas, width, height) => {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width;
    canvas.height = height;
  };
  var automatonPermalinkURL = (baseUrl, props) => {
    const url = new URL(baseUrl);
    const searchParams = new URLSearchParams();
    searchParams.set("colors", props.colors);
    searchParams.set("cellSize", props.cellSize);
    searchParams.set("rows", props.rows);
    searchParams.set("columns", props.columns);
    searchParams.set("table", props.funcs.tableArrayToStr(props.table));
    searchParams.set("palette", props.funcs.paletteArrayToStr(props.palette));
    searchParams.set("firstRow", props.funcs.rowArrayToStr(props.firstRow));
    url.search = searchParams.toString();
    url.hash = "";
    return url;
  };
  var chunkArray = (arr, chunkSize) => {
    const len = Math.ceil(arr.length / chunkSize);
    return Array.from({ length: len }, (_, i) => {
      const j = i * chunkSize;
      return arr.slice(j, j + chunkSize);
    });
  };

  // index.js
  var COLORS_MIN = 2;
  var COLORS_MAX = 10;
  var COLORS_DEFAULT = 4;
  var ROWS_MIN = 10;
  var ROWS_MAX = 1e3;
  var ROWS_DEFAULT = 150;
  var COLUMNS_MIN = 10;
  var COLUMNS_MAX = 1e3;
  var COLUMNS_DEFAULT = 150;
  var CELL_SIZE_MIN = 1;
  var CELL_SIZE_MAX = 20;
  var CELL_SIZE_DEFAULT = 5;
  var parseIntParam = (value, min, max, deflt) => {
    const n = parseInt(value);
    if (Number.isNaN(n))
      return deflt;
    if (n < min)
      return min;
    if (n > max)
      return max;
    return n;
  };
  var parseColorsParam = (colors) => parseIntParam(colors, COLORS_MIN, COLORS_MAX, COLORS_DEFAULT);
  var parseCellSizeParam = (cellSize) => parseIntParam(cellSize, CELL_SIZE_MIN, CELL_SIZE_MAX, CELL_SIZE_DEFAULT);
  var parseRowsParam = (rows) => parseIntParam(rows, ROWS_MIN, ROWS_MAX, ROWS_DEFAULT);
  var parseColumnsParam = (columns) => parseIntParam(columns, COLUMNS_MIN, COLUMNS_MAX, COLUMNS_DEFAULT);
  var parseTableParam = (table, automatonFuncs) => {
    const tableArray = automatonFuncs.tableStrToArray(table);
    if (tableArray) {
      return [tableArray, false];
    } else {
      return [automatonFuncs.randomBalancedTable(), true];
    }
  };
  var parsePaletteParam = (palette, automatonFuncs) => {
    const paletteArray = automatonFuncs.paletteStrToArray(palette);
    if (paletteArray) {
      return [paletteArray, false];
    } else {
      return [automatonFuncs.randomPalette(), true];
    }
  };
  var parseFirstRowParam = (firstRow, columns, automatonFuncs) => {
    const firstRowArray = automatonFuncs.rowStrToArray(firstRow);
    if (firstRowArray && firstRowArray.length === columns) {
      return firstRowArray;
    } else {
      return automatonFuncs.randomRow(columns);
    }
  };
  var PALETTE_COLORS_PER_ROW = 4;
  var addPaletteColorInputs = (palette) => {
    const colorInputs = palette.map((paletteColor) => {
      const input = document.createElement("input");
      input.setAttribute("type", "color");
      input.setAttribute("class", "sidebar__color-input");
      input.setAttribute("value", paletteColor);
      return input;
    });
    const chunkedColorInputs = chunkArray(colorInputs, PALETTE_COLORS_PER_ROW);
    const colorInputRows = chunkedColorInputs.map((chunk) => {
      const row = document.createElement("div");
      row.setAttribute("class", "sidebar__palette-row");
      chunk.forEach((colorInput) => row.appendChild(colorInput));
      return row;
    });
    document.querySelector("#palette-container").replaceChildren(...colorInputRows);
  };
  var disablePaletteColorInputs = (disabled) => {
    document.querySelectorAll(".sidebar__color-input").forEach((input) => input.disabled = disabled);
  };
  var paletteArrayFromColorInputs = () => {
    const colorInputs = document.querySelectorAll(".sidebar__color-input");
    return [...colorInputs].map((input) => input.value);
  };
  var automatonPropsFromUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const colors = parseColorsParam(urlParams.get("colors"));
    const automatonFuncs = totatlisticCellularAutomatonFunctions(colors);
    const cellSize = parseCellSizeParam(urlParams.get("cellSize"));
    const rows = parseRowsParam(urlParams.get("rows"));
    const columns = parseColumnsParam(urlParams.get("columns"));
    const [table, isRandomTable] = parseTableParam(urlParams.get("table"), automatonFuncs);
    const [palette, isRandomPalette] = parsePaletteParam(urlParams.get("palette"), automatonFuncs);
    const firstRow = parseFirstRowParam(urlParams.get("firstRow"), columns, automatonFuncs);
    return { colors, cellSize, rows, columns, table, isRandomTable, palette, isRandomPalette, firstRow, funcs: automatonFuncs };
  };
  var automatonPropsFromForm = () => {
    const colors = parseColorsParam(document.querySelector("#colors").value);
    const automatonFuncs = totatlisticCellularAutomatonFunctions(colors);
    const cellSize = parseCellSizeParam(document.querySelector("#cell-size").value);
    const rows = parseRowsParam(document.querySelector("#rows").value);
    const columns = parseColumnsParam(document.querySelector("#columns").value);
    const randomTableChecked = document.querySelector("#random-table").checked;
    const tableStr = randomTableChecked ? "" : document.querySelector("#table").value;
    const [table, isRandomTable] = parseTableParam(tableStr, automatonFuncs);
    const randomPaletteChecked = document.querySelector("#random-palette").checked;
    const paletteStr = randomPaletteChecked ? "" : automatonFuncs.paletteArrayToStr(paletteArrayFromColorInputs());
    const [palette, isRandomPalette] = parsePaletteParam(paletteStr, automatonFuncs);
    const firstRow = automatonFuncs.randomRow(columns);
    return { colors, cellSize, rows, columns, table, isRandomTable, palette, isRandomPalette, firstRow, funcs: automatonFuncs };
  };
  var generateAutomaton = (props) => {
    const { cellSize, rows, columns, table, palette, firstRow, funcs } = props;
    const grid = funcs.createGrid(rows, table, firstRow);
    const canvas = document.getElementById("canvas");
    const width = columns * cellSize;
    const height = rows * cellSize;
    resizeCanvas(canvas, width, height);
    funcs.drawGrid(canvas, grid, cellSize, palette);
  };
  var generateAutomatonFromUrlParams = () => {
    const props = automatonPropsFromUrlParams();
    generateAutomaton(props);
    return props;
  };
  var generateAutomatonFromForm = () => {
    const props = automatonPropsFromForm();
    generateAutomaton(props);
    return props;
  };
  var updateForm = (props) => {
    document.querySelector("#colors").value = props.colors;
    document.querySelector("#cell-size").value = props.cellSize;
    document.querySelector("#rows").value = props.rows;
    document.querySelector("#columns").value = props.columns;
    document.querySelector("#table").value = props.funcs.tableArrayToStr(props.table);
    document.querySelector("#table").disabled = props.isRandomTable;
    document.querySelector("#random-table").checked = props.isRandomTable;
    document.querySelector("#random-palette").checked = props.isRandomPalette;
    addPaletteColorInputs(props.palette);
    disablePaletteColorInputs(props.isRandomPalette);
    document.querySelector("#first-row").value = props.funcs.rowArrayToStr(props.firstRow);
  };
  var updatePermalink = (props) => {
    const permalink = document.querySelector("#permalink");
    permalink.setAttribute("href", automatonPermalinkURL(document.location.href, props).href);
  };
  var addSidebarToggleButtonClickHandler = () => {
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector(".sidebar__toggle-button");
    toggleButton.onclick = function() {
      sidebar.classList.toggle("sidebar--large");
      toggleButton.classList.toggle("sidebar__toggle-button--close");
    };
  };
  var addRandomTableCheckboxChangeHandler = () => {
    document.querySelector("#random-table").addEventListener("change", (event) => {
      document.querySelector("#table").disabled = event.target.checked;
    });
  };
  var addRandomPaletteCheckboxChangeHandler = () => {
    document.querySelector("#random-palette").addEventListener("change", (event) => {
      disablePaletteColorInputs(event.target.checked);
    });
  };
  var addGenerateAutomatonButtonClickHandler = () => {
    document.querySelector("#generate-automaton").addEventListener("click", () => {
      const automatonProps = generateAutomatonFromForm();
      updateForm(automatonProps);
      updatePermalink(automatonProps);
    });
  };
  window.addEventListener("DOMContentLoaded", () => {
    const automatonProps = generateAutomatonFromUrlParams();
    updateForm(automatonProps);
    updatePermalink(automatonProps);
    addSidebarToggleButtonClickHandler();
    addRandomTableCheckboxChangeHandler();
    addRandomPaletteCheckboxChangeHandler();
    addGenerateAutomatonButtonClickHandler();
  });
})();
