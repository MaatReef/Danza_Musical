const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const eases = require('eases');
const color = require('canvas-sketch-util/color')
const risoColors = require('riso-colors');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

let audio;
let audioContext, audioData, sourceNode, analyserNode;
let manager;
let nimDb, maxDb;

const sketch = () => {
  
  const numCircles = 5;
  const numSlices = 9;
  const slice = Math.PI * 2 / numSlices;
  const radius = 200;

  const bins = [];
  const lineWidths = [];

  let lineWidth, bin, mapped;

  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors),
    random.pick(risoColors),
  ];
  const bgColor = random.pick(risoColors).hex
  const stroke = random.pick(risoColors).hex

  for (let i = 0; i < numCircles * numSlices; i++){
    bin = random.rangeFloor(4, 64);
    if (random.value() > 0.5) bin = 0;
    bins.push(bin);
    
  }

  for (let i = 0; i < numCircles; i++){
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * 200 + 20;
    lineWidths.push(lineWidth);
  }


  return ({ context, width, height }) => {
    
    // let fechaInicio = new Date('2022-07-08').getTime();     // -> Variar
    let fechaFin    = new Date('2024-1-1').getTime();

    let fechaInicio = new Date();

    let fechaInicio2 = fechaInicio.toISOString().split('T')[0];
    let fechaInicio3 = new Date(fechaInicio2)
    let diff = fechaFin - fechaInicio3;
    let dias = Math.trunc(diff/(1000*60*60*24));
                // (1000*60*60*24) --> milisegundos -> segundos -> minutos -> horas -> días
    // let mes = dias/30;

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    textoDias="Quedan " + dias + " oportunidades hasta el 2024"; //texto de prueba
    texto="Click Me"; //texto de prueba
    cancion="Canción: Forty Reasons to be Cheerful - Richard Mills y Tasmanian"; //texto de prueba
    context.beginPath() //iniciar ruta
    // context.textAlign = "start";
    // context.textBaseline = "middle";
    context.strokeStyle=stroke; //color externo
    context.fillStyle=stroke; //color de relleno
    context.font="bold 30px Verdana"; //estilo de texto
    context.fillText(texto,475,535); //texto con método fill
    context.fillText(textoDias,10,30); //texto con método fill
    context.fillText(cancion,10,1070); //texto con método fill
    context.fillStyle = 'white';
    if (!audioContext) return;

    analyserNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(width * 0.5, height * 0.5);
    
    let cradius = radius;
    

    for ( let i = 0; i < numCircles; i ++ ) {
      context.save();

      context.strokeStyle = stroke;  
      for ( let j = 0; j < numSlices; j ++ ) {
        context.rotate(slice);
        context.lineWidth = lineWidths[i];
    
        bin = bins[i * numSlices + j];
        if (!bin) continue;

        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);

        lineWidth = lineWidths[i] * mapped;
        if(lineWidth < 1) continue;

        context.lineWidth = lineWidth;

        context.beginPath();
        
        context.arc(0, 0, cradius + context.lineWidth * 0.5, 0, slice);

        
        context.strokeStyle = stroke;   
        
        context.stroke();

      }

      cradius += lineWidths[i];

      context.restore();
    }
    context.restore();
  };
};


const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) createAudio();

    if (audio.paused) {
      audio.play();
      manager.play();
    } else {
      audio.pause();
      manager.pause();
    };
  });
};


const createAudio = () => {
  audio = document.createElement('audio');
  audio.src = 'audio/Forty Reasons to be Cheerful.mp3';

  audioContext = new AudioContext();

  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512;
  analyserNode.smoothingTimeConstantialFactor = 0.9;
  sourceNode.connect(analyserNode);

  minDb = analyserNode.minDecibels;
  maxDb = analyserNode.maxDecibels;

  audioData = new Float32Array(analyserNode.frequencyBinCount);

  // console.log(audioData.length);
};

const getAverage = (data) => {
  let sum = 0;

  for(let i = 0; i < data.length; i++ ){
    sum += data[i];
  };

  return sum / data.length;
};

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();