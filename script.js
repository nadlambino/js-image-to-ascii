const fileSelector = document.getElementById('file-selector');
const fileSelectorContainer = document.getElementById('file-selector-container');
const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");
const asciiImage = document.getElementById('ascii');
const MAXIMUM_WIDTH = 100;
const MAXIMUM_HEIGHT = 100;
const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const rampLength = grayRamp.length;

const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

const getFontRatio = () => {
    const pre = document.createElement('pre');
    pre.style.display = 'inline';
    pre.textContent = ' ';

    document.body.appendChild(pre);
    const { width, height } = pre.getBoundingClientRect();
    document.body.removeChild(pre);

    return height / width;
};

const fontRatio = getFontRatio();

const convertToGrayScales = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);
    const grayScales = [];

    for (let i = 0 ; i < imageData.data.length ; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const grayScale = toGrayScale(r, g, b);
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;

        grayScales.push(grayScale);
    }

    context.putImageData(imageData, 0, 0);

    return grayScales;
};

const clampDimensions = (width, height) => {
    const rectifiedWidth = Math.floor(getFontRatio() * width);

    if (height > MAXIMUM_HEIGHT) {
        const reducedWidth = Math.floor(rectifiedWidth * MAXIMUM_HEIGHT / height);
        return [reducedWidth, MAXIMUM_HEIGHT];
    }

    if (width > MAXIMUM_WIDTH) {
        const reducedHeight = Math.floor(height * MAXIMUM_WIDTH / rectifiedWidth);
        return [MAXIMUM_WIDTH, reducedHeight];
    }

    return [rectifiedWidth, height];
};

fileSelector.onchange = (e) => {
    const file = e.target.files[0];

    readSelectedFile(file)
};

const readSelectedFile = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
            const [width, height] = clampDimensions(image.width, image.height);

            canvas.width = width;
            canvas.height = height;

            context.drawImage(image, 0, 0, width, height);
            const grayScales = convertToGrayScales(context, width, height);

            drawAscii(grayScales, width);
        }

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
    fileSelectorContainer.style.display = "none";
}

const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];

const drawAscii = (grayScales, width) => {
    const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
        let nextChars = getCharacterForGrayScale(grayScale);
        if ((index + 1) % width === 0) {
            nextChars += '\n';
        }

        return asciiImage + nextChars;
    }, '');

    asciiImage.textContent = ascii;
    let imageWidth = asciiImage.getBoundingClientRect().width
    let windowWidth = window.innerWidth;
    if (imageWidth > windowWidth) {
        let ratio = ((windowWidth / imageWidth) - 0.15).toFixed(1)
        asciiImage.style.fontSize = `4px`;
    }
};

fileSelectorContainer.addEventListener('click', () => {
    fileSelector.click();
});

asciiImage.addEventListener('click', () => {
    fileSelector.click();
})

fileSelectorContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    fileSelectorContainer.classList.remove('active-dropzone')
    let file;

    if (e.dataTransfer.items) {
        const item = e.dataTransfer.items[0];
        if (item.kind === 'file') {
            file = item.getAsFile();
        }
    } else {
        file = e.dataTransfer.files[0];
    }

    readSelectedFile(file);
})

fileSelectorContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileSelectorContainer.classList.add('active-dropzone')
})
