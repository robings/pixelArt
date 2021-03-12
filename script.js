createDrawingGrid();
createPaletteGrid();
addEventListenersToGridElements();
addEventListenersToPaletteGrid();

var timeout;

document.getElementById('swapForeAndBackgroundColour').addEventListener('click', () => {
    let foregroundColour = document.getElementById('foregroundColour').value;
    let backgroundColour = document.getElementById('backgroundColour').value;
    document.getElementById('foregroundColour').value = backgroundColour;
    document.getElementById('backgroundColour').value = foregroundColour;
});

document.getElementById('clearDrawing').addEventListener('click', () => {
    let backgroundColour = convertHexToRgb(document.getElementById('backgroundColour').value);
    let interiorGridElements = document.querySelectorAll('.gridInterior');
    interiorGridElements.forEach (interiorGridElement => {
        interiorGridElement.style.backgroundColor = backgroundColour;
    })
});

document.getElementById('getDrawing').addEventListener('click', () => {
    let drawingGridData = getDrawingGridContent();
    downloadJson(drawingGridData);
});

document.getElementById('restoreDrawingFromPaste').addEventListener('click', () => {
    let data = document.getElementById('pastedData').value;
    if (!data) {
        displayError('Cannot restore from empty data')
        return;
    }

    let drawingGridData;

    try {
        drawingGridData = JSON.parse(data);
    } catch {
        displayError('Error parsing JSON data')
        return;
    }
    try {
        restoreDrawingGridContent(drawingGridData);
    } catch {
        displayError('Error when attempting to restore drawing from data')
    }
});

function createDrawingGrid() {
    let htmlBuild;

    for (let i=1; i<25; i++) {
        for (let j=1; j<25; j++) {
            htmlBuild = document.createElement('div');
            htmlBuild.className = 'gridInterior';
            htmlBuild.setAttribute('data-x', `${j}`);
            htmlBuild.setAttribute('data-y', `${i}`);
            document.getElementById('drawingGrid').appendChild(htmlBuild);
        }
    }
}

function createPaletteGrid() {
    let htmlBuild;
    const PALETTECOLOURS = [
        '#FFFFFF',
        '#000000',
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#00FFFF',
        '#FF00FF',
        '#FFFF00',
    ]

    for (let i=0; i<PALETTECOLOURS.length; i++) {
        htmlBuild = document.createElement('div');
        htmlBuild.className = 'paletteGrid';
        document.getElementById('palette').appendChild(htmlBuild);
    }

    let paletteGridElements = document.querySelectorAll('.paletteGrid');

    for (let i=0; i<PALETTECOLOURS.length; i++) {
        paletteGridElements[i].style.backgroundColor = PALETTECOLOURS[i];
    }
}

function addEventListenersToGridElements() {
    let interiorGridElements = document.querySelectorAll('.gridInterior');
    interiorGridElements.forEach (interiorGridElement => {
        interiorGridElement.addEventListener('click', (e)=>{
            let foregroundColour = convertHexToRgb(document.getElementById('foregroundColour').value);
            let backgroundColour = convertHexToRgb(document.getElementById('backgroundColour').value);
            let currentColour = window.getComputedStyle(e.target).backgroundColor;
            if(currentColour === foregroundColour) {
                e.target.style.backgroundColor=backgroundColour;               
            } else {
                e.target.style.backgroundColor=foregroundColour;
            }
        })
    })
}

function addEventListenersToPaletteGrid() {
    let paletteGridElements = document.querySelectorAll('.paletteGrid');
    paletteGridElements.forEach (paletteGridElement => {
        paletteGridElement.addEventListener('click', (e)=> {
            let paletteColour = convertRgbToHex(window.getComputedStyle(e.target).backgroundColor);
            document.getElementById('foregroundColour').value = paletteColour;
        })
    })
}

function convertHexToRgb(hexValue) {
    let valueToParse = hexValue.replace('#', '');
    let splitValuesToParse = valueToParse.match(/.{1,2}/g)
    var rgbSplit = [
        parseInt(splitValuesToParse[0], 16),
        parseInt(splitValuesToParse[1], 16),
        parseInt(splitValuesToParse[2], 16),
    ]

    return `rgb(${rgbSplit.join(', ')})`;
}

function convertRgbToHex(rgbValue) {
    let valueToParse = (rgbValue.replace('rgb(', '')).replace(')', '');
    let splitValuesToParse = valueToParse.split(', ').map((value)=> {
        return parseInt(value);
    });
    var hexSplit = [
        splitValuesToParse[0].toString(16).length == 1? '0' + splitValuesToParse[0].toString(16) : splitValuesToParse[0].toString(16),
        splitValuesToParse[1].toString(16).length == 1? '0' + splitValuesToParse[1].toString(16) : splitValuesToParse[1].toString(16),
        splitValuesToParse[2].toString(16).length == 1? '0' + splitValuesToParse[2].toString(16) : splitValuesToParse[2].toString(16),
    ]

    return `#${hexSplit.join('')}`;
}

function getDrawingGridContent() {
    var drawingGridArray = []

    let interiorGridElements = document.querySelectorAll('.gridInterior');

    interiorGridElements.forEach (interiorGridElement => {
        drawingGridArray.push(
            {
                x: interiorGridElement.dataset.x,
                y: interiorGridElement.dataset.y,
                colour: window.getComputedStyle(interiorGridElement).backgroundColor,
            }
        );
    })

    var drawingJson = JSON.stringify(drawingGridArray);

    return drawingJson;
}

function restoreDrawingGridContent(json) {
    let interiorGridElements = document.querySelectorAll('.gridInterior');
    for (i=0; i< interiorGridElements.length; i++) {
        interiorGridElements[i].style.backgroundColor = convertRgbToHex(json[i].colour);
    }
}

function downloadJson(jsonToDownload) {
    var tempElement = document.createElement('a');
    var file = new Blob([jsonToDownload], { type: 'text/plain'});
    tempElement.href = URL.createObjectURL(file);
    tempElement.setAttribute('download', 'myDrawing.json');
    document.body.appendChild(tempElement);
    tempElement.click();
    document.body.removeChild(tempElement);
}

function displayError(errorText) {
    if (timeout) {
        clearTimeout(timeout);
    }
    document.getElementById('errorText').textContent = errorText;
    document.getElementById('displayErrors').style.display = 'block';
    timeout = setTimeout(hideError, 5000);
}

function hideError() {
    document.getElementById('displayErrors').style.display = 'none';
}
