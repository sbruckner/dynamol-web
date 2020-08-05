import fetch from 'node-fetch';

var int8 = new Int8Array(4);
var int32 = new Int32Array(int8.buffer, 0, 1);
var uint32 = new Uint32Array(int8.buffer, 0, 1);
var float32 = new Float32Array(int8.buffer, 0, 1);

function intBitsToFloat(i) {
	int32[0] = i;
	return float32[0];
}

function uintBitsToFloat(i) {
	uint32[0] = i;
	return float32[0];
}

function floatBitsToInt(f) {
	float32[0] = f;
	return int32[0];
}

function floatBitsToUint(f) {
	float32[0] = f;
	return uint32[0];
}

async function* makeTextFileLineIterator(fileURL) {
    const utf8Decoder = new TextDecoder("utf-8");
    let response = await fetch(fileURL);
    let reader = response.body.getReader();
    let {value: chunk, done: readerDone} = await reader.read();
    chunk = chunk ? utf8Decoder.decode(chunk) : "";
  
    let re = /\r\n|\n|\r/gm;
    let startIndex = 0;
  
    for (;;) {
      let result = re.exec(chunk);
      if (!result) {
        if (readerDone) {
          break;
        }
        let remainder = chunk.substr(startIndex);
        ({value: chunk, done: readerDone} = await reader.read());
        chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : "");
        startIndex = re.lastIndex = 0;
        continue;
      }
      yield chunk.substring(startIndex, result.index);
      startIndex = re.lastIndex;
    }
    if (startIndex < chunk.length) {
      // last line didn't end in a newline char
      yield chunk.substr(startIndex);
    }
}  

export class Protein {
    public atomPositions : Float32Array;
    public atomCount : number;
    public minimumBounds : number[];
    public maximumBounds : number[];
    /*
    public activeElementRadii : Float32Array;
    public activeElementColors : Uint8Array;
    public activeElementColorsRadiiPacked : Uint8Array;
    public activeResidueColors : Uint8Array;
    public activeChainColors : Uint8Array;
    */

    constructor() {
        this.atomCount = 0;
        this.minimumBounds = [Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE];
        this.maximumBounds = [-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE];
    }

    

    async load() {

        const that = this;
        let atomPositions = [];
        let atomAttributes = [];
        
        let elementIdMap = Array(elementColors.length).fill(0);
        let residueIdMap = Array(residueColors.length).fill(0);
        let chainIdMap = Array(chainColors.length).fill(0);
    
        let activeElementIds = [0];
        let activeResidueIds = [0];
        let activeChainIds = [0];
    
        let elementCount = 1;              

        for await (let str of makeTextFileLineIterator("http://files.rcsb.org/download/4fyw.pdb")) {

            console.log(str);

            const recordName = str.substr(0,6).trim();

            if (recordName == "END") {
            }
            else if (recordName == "ATOM" || recordName == "HETATM") {
                const x = parseFloat(str.substr(30,8).trim());
                const y = parseFloat(str.substr(38,8).trim());
                const z = parseFloat(str.substr(46,8).trim());

                const residueName = str.substr(17, 3).trim();
                const chainName = str.substr(21, 1).trim();
                const elementName = str.substr(76, 2).trim();

                let elementId = 0;
                let residueId = 0;
                let chainId = 0;
                
                if (elementName in elementIds)
                {
                    elementId = elementIds[elementName];
                }

                if (residueName in residueIds)
                {
                    residueId = residueIds[residueName];
                }
    
                if (chainName in chainIds)
                {
                    chainId = chainIds[chainName];
                }

                that.minimumBounds[0] = Math.min(that.minimumBounds[0],x);
                that.minimumBounds[1] = Math.min(that.minimumBounds[1],y);
                that.minimumBounds[2] = Math.min(that.minimumBounds[2],z);

                that.maximumBounds[0] = Math.max(that.maximumBounds[0],x);
                that.maximumBounds[1] = Math.max(that.maximumBounds[1],y);
                that.maximumBounds[2] = Math.max(that.maximumBounds[2],z);

                const atomAttributes = elementId | (residueId << 8) | (chainId << 16); 
                atomPositions.push(x,y,z,uintBitsToFloat(atomAttributes));
            }
        
        }
        
        that.atomCount = atomPositions.length / 4;
        that.atomPositions = new Float32Array(atomPositions);            

        return true;
            //const request = http.get("http://files.rcsb.org/download/4FYW.pdb")..pipe();, (result) => { 

//        const decoder = new TextDecoder('utf-8');
/*
        fetch("http://files.rcsb.org/download/4FYW.pdb")
            .then(response => response.body)
            .then(body => {
                var reader = body.getReader();

                reader.read().then(({ done, value }) => {
                    console.log(decoder.decode(value));
*/
                    // When no more data needs to be consumed, close the stream
//                    if (done) {
//                        return;
//                    }
                    // Enqueue the next data chunk into our target stream
//                    controller.enqueue(value);
//                    return pump();
//                  });
/*
                var stream = byline(body);

                stream.on('data', function(line) {
                    console.log(line);
                  });    //                    console.log(result.data);*/
                  
    //            req.setEncoding('utf8');
            
    //          const LineByLineReader = require('line-by-line')
//                var lineReader = new LineByLineReader(reader);
/*                
                
                lineReader.on('error', function (error) {
                    console.log('err', error);
                    reject(error);
                });
                
                lineReader.on('line', function (str) {
                    console.log('line', str);

                    const recordName = str.substr(0,6).trim();

                    if (recordName == "END") {
                    }
                    else if (recordName == "ATOM" || recordName == "HETATM") {
                        const x = parseFloat(str.substr(30,8).trim());
                        const y = parseFloat(str.substr(38,8).trim());
                        const z = parseFloat(str.substr(46,8).trim());

                        const residueName = str.substr(17, 3).trim();
                        const chainName = str.substr(21, 1).trim();
                        const elementName = str.substr(76, 2).trim();

                        let elementId = 0;
                        let residueId = 0;
                        let chainId = 0;
                        
                        if (elementName in elementIds)
                        {
                            elementId = elementIds[elementName];
                        }

                        if (residueName in residueIds)
                        {
                            residueId = residueIds[residueName];
                        }
            
                        if (chainName in chainIds)
                        {
                            chainId = chainIds[chainName];
                        }
*/
/*            
                        let elementIndex = 0;
                        let residueIndex = 0;
                        let chainIndex = 0;

                        elementIndex = elementIdMap[elementId];
            
                        if (elementIndex == 0)
                        {
                            elementIndex = activeElementIds.length;
                            activeElementIds.push(elementId);				
                            elementIdMap[elementId] = elementIndex;
                        }
                    
                        chainIndex = chainIdMap[chainId];
            
                        if (chainIndex == 0)
                        {
                            chainIndex = activeChainIds.length;
                            activeChainIds.push(chainId);
                            chainIdMap[chainId] = chainIndex;
                        }                        
*/            
/*             
                        that.minimumBounds[0] = Math.min(that.minimumBounds[0],x);
                        that.minimumBounds[1] = Math.min(that.minimumBounds[1],y);
                        that.minimumBounds[2] = Math.min(that.minimumBounds[2],z);

                        that.maximumBounds[0] = Math.max(that.maximumBounds[0],x);
                        that.maximumBounds[1] = Math.max(that.maximumBounds[1],y);
                        that.maximumBounds[2] = Math.max(that.maximumBounds[2],z);

                        const atomAttributes = elementId | (residueId << 8) | (chainId << 16); 
                        atomPositions.push(x,y,z,uintBitsToFloat(atomAttributes));
                    }
                });
                
                lineReader.on('end', function () {
                    console.log('end');

                    that.atomCount = atomPositions.length / 4;
                    that.atomPositions = new Float32Array(atomPositions);
*/                    
/*
                    that.activeElementRadii = new Float32Array(activeElementIds.length);
                    that.activeElementColors = new Uint8Array(activeElementIds.length*3);
                    that.activeElementColorsRadiiPacked = new Uint8Array(activeElementIds.length*4);

                    for (let i = 0; i < activeElementIds.length; i++) {
                        that.activeElementRadii[i] = elementRadii[activeElementIds[i]];

                        that.activeElementColors[i*3+0] = elementColors[activeElementIds[i]][0];
                        that.activeElementColors[i*3+1] = elementColors[activeElementIds[i]][1];
                        that.activeElementColors[i*3+2] = elementColors[activeElementIds[i]][2];

                        that.activeElementColorsRadiiPacked[i*4+0] = elementColors[activeElementIds[i]][0];
                        that.activeElementColorsRadiiPacked[i*4+1] = elementColors[activeElementIds[i]][1];
                        that.activeElementColorsRadiiPacked[i*4+2] = elementColors[activeElementIds[i]][2];
                        that.activeElementColorsRadiiPacked[i*4+3] = elementRadii[activeElementIds[i]];
                    }

                    that.activeResidueColors = new Uint8Array(activeResidueIds.length*3);

                    for (let i = 0; i < activeResidueIds.length; i++) {
                        that.activeResidueColors[i*3+0] = residueColors[activeResidueIds[i]][0];
                        that.activeResidueColors[i*3+1] = residueColors[activeResidueIds[i]][1];
                        that.activeResidueColors[i*3+2] = residueColors[activeResidueIds[i]][2];
                    }

                    that.activeChainColors = new Uint8Array(activeChainIds.length*3);

                    for (let i = 0; i < activeChainIds.length; i++) {
                        that.activeChainColors[i*3+0] = chainColors[activeChainIds[i]][0];
                        that.activeChainColors[i*3+1] = chainColors[activeChainIds[i]][1];
                        that.activeChainColors[i*3+2] = chainColors[activeChainIds[i]][2];
                    }                    
*/
//                    resolve();
//                });
            
//            });
/*
            request.on('error', (e) => {
                console.log('problem with request', e);
                request.abort();
            });
        
            request.end();*/
//        });
    }

}

export const elementIds = { 
        "H":1,
        "He":2,
        "Li":3,
        "Be":4,
        "B":5,
        "C":6,
        "N":7,
        "O":8,
        "F":9,
        "Ne":10,
        "Na":11,
        "Mg":12,
        "Al":13,
        "Si":14,
        "P":15,
        "S":16,
        "Cl":17,
        "Ar":18,
        "K":19,
        "Ca":20,
        "Sc":21,
        "Ti":22,
        "V":23,
        "Cr":24,
        "Mn":25,
        "Fe":26,
        "Co":27,
        "Ni":28,
        "Cu":29,
        "Zn":30,
        "Ga":31,
        "Ge":32,
        "As":33,
        "Se":34,
        "Br":35,
        "Kr":36,
        "Rb":37,
        "Sr":38,
        "Y":39,
        "Zr":40,
        "Nb":41,
        "Mo":42,
        "Tc":43,
        "Ru":44,
        "Rh":45,
        "Pd":46,
        "Ag":47,
        "Cd":48,
        "In":49,
        "Sn":50,
        "Sb":51,
        "Te":52,
        "I":53,
        "Xe":54,
        "Cs":55,
        "Ba":56,
        "La":57,
        "Ce":58,
        "Pr":59,
        "Nd":60,
        "Pm":61,
        "Sm":62,
        "Eu":63,
        "Gd":64,
        "Tb":65,
        "Dy":66,
        "Ho":67,
        "Er":68,
        "Tm":69,
        "Yb":70,
        "Lu":71,
        "Hf":72,
        "Ta":73,
        "W":74,
        "Re":75,
        "Os":76,
        "Ir":77,
        "Pt":78,
        "Au":79,
        "Hg":80,
        "Tl":81,
        "Pb":82,
        "Bi":83,
        "Po":84,
        "At":85,
        "Rn":86,
        "Fr":87,
        "Ra":88,
        "Ac":89,
        "Th":90,
        "Pa":91,
        "U":92,
        "Np":93,
        "Pu":94,
        "Am":95,
        "Cm":96,
        "Bk":97,
        "Cf":98,
        "Es":99,
        "Fm":100,
        "Md":101,
        "No":102,
        "Lr":103,
        "Rf":104,
        "Db":105,
        "Sg":106,
        "Bh":107,
        "Hs":108,
        "Mt":109,
        "Ds":110,
        "Rg":111,
        "Cn":112,
        "H (WAT)":113,
        "O (WAT)":114,
        "D":115 
    };

export const elementRadii = [
        1.0, // 0 - default
        /*<vdw id = "1" radius = "*/1.200,
        /*<vdw id = "2" radius = "*/1.400,
        /*<vdw id = "3" radius = "*/1.820,
        /*<vdw id = "4" radius = "*/1.530,
        /*<vdw id = "5" radius = "*/1.920,
        /*<vdw id = "6" radius = "*/1.700,
        /*<vdw id = "7" radius = "*/1.550,
        /*<vdw id = "8" radius = "*/1.520,
        /*<vdw id = "9" radius = "*/1.470,
        /*<vdw id = "10" radius = "*/1.540,
        /*<vdw id = "11" radius = "*/2.270,
        /*<vdw id = "12" radius = "*/1.730,
        /*<vdw id = "13" radius = "*/1.840,
        /*<vdw id = "14" radius = "*/2.100,
        /*<vdw id = "15" radius = "*/1.800,
        /*<vdw id = "16" radius = "*/1.800,
        /*<vdw id = "17" radius = "*/1.750,
        /*<vdw id = "18" radius = "*/1.880,
        /*<vdw id = "19" radius = "*/2.750,
        /*<vdw id = "20" radius = "*/2.310,
        /*<vdw id = "21" radius = "*/2.110,
        /*<vdw id = "22" radius = "*/2.000,
        /*<vdw id = "23" radius = "*/2.000,
        /*<vdw id = "24" radius = "*/2.000,
        /*<vdw id = "25" radius = "*/2.000,
        /*<vdw id = "26" radius = "*/2.000,
        /*<vdw id = "27" radius = "*/2.000,
        /*<vdw id = "28" radius = "*/1.630,
        /*<vdw id = "29" radius = "*/1.400,
        /*<vdw id = "30" radius = "*/1.390,
        /*<vdw id = "31" radius = "*/1.870,
        /*<vdw id = "32" radius = "*/2.110,
        /*<vdw id = "33" radius = "*/1.850,
        /*<vdw id = "34" radius = "*/1.900,
        /*<vdw id = "35" radius = "*/1.850,
        /*<vdw id = "36" radius = "*/2.020,
        /*<vdw id = "37" radius = "*/3.030,
        /*<vdw id = "38" radius = "*/2.490,
        /*<vdw id = "39" radius = "*/2.000,
        /*<vdw id = "40" radius = "*/2.000,
        /*<vdw id = "41" radius = "*/2.000,
        /*<vdw id = "42" radius = "*/2.000,
        /*<vdw id = "43" radius = "*/2.000,
        /*<vdw id = "44" radius = "*/2.000,
        /*<vdw id = "45" radius = "*/2.000,
        /*<vdw id = "46" radius = "*/1.630,
        /*<vdw id = "47" radius = "*/1.720,
        /*<vdw id = "48" radius = "*/1.580,
        /*<vdw id = "49" radius = "*/1.930,
        /*<vdw id = "50" radius = "*/2.170,
        /*<vdw id = "51" radius = "*/2.060,
        /*<vdw id = "52" radius = "*/2.060,
        /*<vdw id = "53" radius = "*/1.980,
        /*<vdw id = "54" radius = "*/2.160,
        /*<vdw id = "55" radius = "*/3.430,
        /*<vdw id = "56" radius = "*/2.680,
        /*<vdw id = "57" radius = "*/2.000,
        /*<vdw id = "58" radius = "*/2.000,
        /*<vdw id = "59" radius = "*/2.000,
        /*<vdw id = "60" radius = "*/2.000,
        /*<vdw id = "61" radius = "*/2.000,
        /*<vdw id = "62" radius = "*/2.000,
        /*<vdw id = "63" radius = "*/2.000,
        /*<vdw id = "64" radius = "*/2.000,
        /*<vdw id = "65" radius = "*/2.000,
        /*<vdw id = "66" radius = "*/2.000,
        /*<vdw id = "67" radius = "*/2.000,
        /*<vdw id = "68" radius = "*/2.000,
        /*<vdw id = "69" radius = "*/2.000,
        /*<vdw id = "70" radius = "*/2.000,
        /*<vdw id = "71" radius = "*/2.000,
        /*<vdw id = "72" radius = "*/2.000,
        /*<vdw id = "73" radius = "*/2.000,
        /*<vdw id = "74" radius = "*/2.000,
        /*<vdw id = "75" radius = "*/2.000,
        /*<vdw id = "76" radius = "*/2.000,
        /*<vdw id = "77" radius = "*/2.000,
        /*<vdw id = "78" radius = "*/1.750,
        /*<vdw id = "79" radius = "*/1.660,
        /*<vdw id = "80" radius = "*/1.550,
        /*<vdw id = "81" radius = "*/1.960,
        /*<vdw id = "82" radius = "*/2.020,
        /*<vdw id = "83" radius = "*/2.070,
        /*<vdw id = "84" radius = "*/1.970,
        /*<vdw id = "85" radius = "*/2.020,
        /*<vdw id = "86" radius = "*/2.200,
        /*<vdw id = "87" radius = "*/3.480,
        /*<vdw id = "88" radius = "*/2.830,
        /*<vdw id = "89" radius = "*/2.000,
        /*<vdw id = "90" radius = "*/2.000,
        /*<vdw id = "91" radius = "*/2.000,
        /*<vdw id = "92" radius = "*/1.860,
        /*<vdw id = "93" radius = "*/2.000,
        /*<vdw id = "94" radius = "*/2.000,
        /*<vdw id = "95" radius = "*/2.000,
        /*<vdw id = "96" radius = "*/2.000,
        /*<vdw id = "97" radius = "*/2.000,
        /*<vdw id = "98" radius = "*/2.000,
        /*<vdw id = "99" radius = "*/2.000,
        /*<vdw id = "100" radius = "*/2.000,
        /*<vdw id = "101" radius = "*/2.000,
        /*<vdw id = "102" radius = "*/2.000,
        /*<vdw id = "103" radius = "*/2.000,
        /*<vdw id = "104" radius = "*/2.000,
        /*<vdw id = "105" radius = "*/2.000,
        /*<vdw id = "106" radius = "*/2.000,
        /*<vdw id = "107" radius = "*/2.000,
        /*<vdw id = "108" radius = "*/2.000,
        /*<vdw id = "109" radius = "*/2.000,
        /*<vdw id = "110" radius = "*/2.000,
        /*<vdw id = "111" radius = "*/2.000,
        /*<vdw id = "112" radius = "*/2.000,
        /*<vdw id = "113" radius = "*/1.200,
        /*<vdw id = "114" radius = "*/1.520,
        /*<vdw id = "115" radius = "*/1.200
    ];

export const elementColors = [
		[255.0/255.0, 255.0/255.0, 255.0/255.0],
		[255.0/255.0, 255.0/255.0, 255.0/255.0],
		[217.0/255.0, 255.0/255.0, 255.0/255.0],
		[204.0/255.0, 128.0/255.0, 255.0/255.0],
		[194.0/255.0, 255.0/255.0, 0.0/255.0],
		[255.0/255.0, 181.0/255.0, 181.0/255.0],
		[144.0/255.0, 144.0/255.0, 144.0/255.0],
		[48.0/255.0, 80.0/255.0, 248.0/255.0],
		[255.0/255.0, 13.0/255.0, 13.0/255.0],
		[144.0/255.0, 224.0/255.0, 80.0/255.0],
		[179.0/255.0, 227.0/255.0, 245.0/255.0],
		[171.0/255.0, 92.0/255.0, 242.0/255.0],
		[138.0/255.0, 255.0/255.0, 0.0/255.0],
		[191.0/255.0, 166.0/255.0, 166.0/255.0],
		[240.0/255.0, 200.0/255.0, 160.0/255.0],
		[255.0/255.0, 128.0/255.0, 0.0/255.0],
		[255.0/255.0, 255.0/255.0, 48.0/255.0],
		[31.0/255.0, 240.0/255.0, 31.0/255.0],
		[128.0/255.0, 209.0/255.0, 227.0/255.0],
		[143.0/255.0, 64.0/255.0, 212.0/255.0],
		[61.0/255.0, 255.0/255.0, 0.0/255.0],
		[230.0/255.0, 230.0/255.0, 230.0/255.0],
		[191.0/255.0, 194.0/255.0, 199.0/255.0],
		[166.0/255.0, 166.0/255.0, 171.0/255.0],
		[138.0/255.0, 153.0/255.0, 199.0/255.0],
		[156.0/255.0, 122.0/255.0, 199.0/255.0],
		[224.0/255.0, 102.0/255.0, 51.0/255.0],
		[240.0/255.0, 144.0/255.0, 160.0/255.0],
		[80.0/255.0, 208.0/255.0, 80.0/255.0],
		[200.0/255.0, 128.0/255.0, 51.0/255.0],
		[125.0/255.0, 128.0/255.0, 176.0/255.0],
		[194.0/255.0, 143.0/255.0, 143.0/255.0],
		[102.0/255.0, 143.0/255.0, 143.0/255.0],
		[189.0/255.0, 128.0/255.0, 227.0/255.0],
		[255.0/255.0, 161.0/255.0, 0.0/255.0],
		[166.0/255.0, 41.0/255.0, 41.0/255.0],
		[92.0/255.0, 184.0/255.0, 209.0/255.0],
		[112.0/255.0, 46.0/255.0, 176.0/255.0],
		[0.0/255.0, 255.0/255.0, 0.0/255.0],
		[148.0/255.0, 255.0/255.0, 255.0/255.0],
		[148.0/255.0, 224.0/255.0, 224.0/255.0],
		[115.0/255.0, 194.0/255.0, 201.0/255.0],
		[84.0/255.0, 181.0/255.0, 181.0/255.0],
		[59.0/255.0, 158.0/255.0, 158.0/255.0],
		[36.0/255.0, 143.0/255.0, 143.0/255.0],
		[10.0/255.0, 125.0/255.0, 140.0/255.0],
		[0.0/255.0, 105.0/255.0, 133.0/255.0],
		[192.0/255.0, 192.0/255.0, 192.0/255.0],
		[255.0/255.0, 217.0/255.0, 143.0/255.0],
		[166.0/255.0, 117.0/255.0, 115.0/255.0],
		[102.0/255.0, 128.0/255.0, 128.0/255.0],
		[158.0/255.0, 99.0/255.0, 181.0/255.0],
		[212.0/255.0, 122.0/255.0, 0.0/255.0],
		[148.0/255.0, 0.0/255.0, 148.0/255.0],
		[66.0/255.0, 158.0/255.0, 176.0/255.0],
		[87.0/255.0, 23.0/255.0, 143.0/255.0],
		[0.0/255.0, 201.0/255.0, 0.0/255.0],
		[112.0/255.0, 212.0/255.0, 255.0/255.0],
		[255.0/255.0, 255.0/255.0, 199.0/255.0],
		[217.0/255.0, 255.0/255.0, 199.0/255.0],
		[199.0/255.0, 255.0/255.0, 199.0/255.0],
		[163.0/255.0, 255.0/255.0, 199.0/255.0],
		[143.0/255.0, 255.0/255.0, 199.0/255.0],
		[97.0/255.0, 255.0/255.0, 199.0/255.0],
		[69.0/255.0, 255.0/255.0, 199.0/255.0],
		[48.0/255.0, 255.0/255.0, 199.0/255.0],
		[31.0/255.0, 255.0/255.0, 199.0/255.0],
		[0.0/255.0, 255.0/255.0, 156.0/255.0],
		[0.0/255.0, 230.0/255.0, 117.0/255.0],
		[0.0/255.0, 212.0/255.0, 82.0/255.0],
		[0.0/255.0, 191.0/255.0, 56.0/255.0],
		[0.0/255.0, 171.0/255.0, 36.0/255.0],
		[77.0/255.0, 194.0/255.0, 255.0/255.0],
		[77.0/255.0, 166.0/255.0, 255.0/255.0],
		[33.0/255.0, 148.0/255.0, 214.0/255.0],
		[38.0/255.0, 125.0/255.0, 171.0/255.0],
		[38.0/255.0, 102.0/255.0, 150.0/255.0],
		[23.0/255.0, 84.0/255.0, 135.0/255.0],
		[208.0/255.0, 208.0/255.0, 224.0/255.0],
		[255.0/255.0, 209.0/255.0, 35.0/255.0],
		[184.0/255.0, 184.0/255.0, 208.0/255.0],
		[166.0/255.0, 84.0/255.0, 77.0/255.0],
		[87.0/255.0, 89.0/255.0, 97.0/255.0],
		[158.0/255.0, 79.0/255.0, 181.0/255.0],
		[171.0/255.0, 92.0/255.0, 0.0/255.0],
		[117.0/255.0, 79.0/255.0, 69.0/255.0],
		[66.0/255.0, 130.0/255.0, 150.0/255.0],
		[66.0/255.0, 0.0/255.0, 102.0/255.0],
		[0.0/255.0, 125.0/255.0, 0.0/255.0],
		[112.0/255.0, 171.0/255.0, 250.0/255.0],
		[0.0/255.0, 186.0/255.0, 255.0/255.0],
		[0.0/255.0, 161.0/255.0, 255.0/255.0],
		[0.0/255.0, 143.0/255.0, 255.0/255.0],
		[0.0/255.0, 128.0/255.0, 255.0/255.0],
		[0.0/255.0, 107.0/255.0, 255.0/255.0],
		[84.0/255.0, 92.0/255.0, 242.0/255.0],
		[120.0/255.0, 92.0/255.0, 227.0/255.0],
		[138.0/255.0, 79.0/255.0, 227.0/255.0],
		[161.0/255.0, 54.0/255.0, 212.0/255.0],
		[179.0/255.0, 31.0/255.0, 212.0/255.0],
		[179.0/255.0, 31.0/255.0, 186.0/255.0],
		[179.0/255.0, 13.0/255.0, 166.0/255.0],
		[189.0/255.0, 13.0/255.0, 135.0/255.0],
		[199.0/255.0, 0.0/255.0, 102.0/255.0],
		[204.0/255.0, 0.0/255.0, 89.0/255.0],
		[209.0/255.0, 0.0/255.0, 79.0/255.0],
		[217.0/255.0, 0.0/255.0, 69.0/255.0],
		[224.0/255.0, 0.0/255.0, 56.0/255.0],
		[230.0/255.0, 0.0/255.0, 46.0/255.0],
		[235.0/255.0, 0.0/255.0, 38.0/255.0],
		[255.0/255.0, 255.0/255.0, 255.0/255.0],
		[255.0/255.0, 255.0/255.0, 255.0/255.0],
		[255.0/255.0, 255.0/255.0, 255.0/255.0],
		[255.0/255.0, 255.0/255.0, 255.0/255.0],
		[255.0/255.0, 255.0/255.0, 255.0/255.0],
        [255.0/255.0, 255.0/255.0, 255.0/255.0]        
    ];

export const elementColorsRadii = [
        [255.0/255.0, 255.0/255.0, 255.0/255.0, 1.0], 
        [255.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "1" radius = "*/1.200],
        [217.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "2" radius = "*/1.400],
        [204.0/255.0, 128.0/255.0, 255.0/255.0, /*<vdw id = "3" radius = "*/1.820],
        [194.0/255.0, 255.0/255.0, 0.0/255.0, /*<vdw id = "4" radius = "*/1.530],
        [255.0/255.0, 181.0/255.0, 181.0/255.0, /*<vdw id = "5" radius = "*/1.920],
        [144.0/255.0, 144.0/255.0, 144.0/255.0, /*<vdw id = "6" radius = "*/1.700],
        [48.0/255.0, 80.0/255.0, 248.0/255.0, /*<vdw id = "7" radius = "*/1.550],
        [255.0/255.0, 13.0/255.0, 13.0/255.0, /*<vdw id = "8" radius = "*/1.520],
        [144.0/255.0, 224.0/255.0, 80.0/255.0, /*<vdw id = "9" radius = "*/1.470],
        [179.0/255.0, 227.0/255.0, 245.0/255.0, /*<vdw id = "10" radius = "*/1.540],
        [171.0/255.0, 92.0/255.0, 242.0/255.0, /*<vdw id = "11" radius = "*/2.270],
        [138.0/255.0, 255.0/255.0, 0.0/255.0, /*<vdw id = "12" radius = "*/1.730],
        [191.0/255.0, 166.0/255.0, 166.0/255.0, /*<vdw id = "13" radius = "*/1.840],
        [240.0/255.0, 200.0/255.0, 160.0/255.0, /*<vdw id = "14" radius = "*/2.100],
        [255.0/255.0, 128.0/255.0, 0.0/255.0, /*<vdw id = "15" radius = "*/1.800],
        [255.0/255.0, 255.0/255.0, 48.0/255.0, /*<vdw id = "16" radius = "*/1.800],
        [31.0/255.0, 240.0/255.0, 31.0/255.0, /*<vdw id = "17" radius = "*/1.750],
        [128.0/255.0, 209.0/255.0, 227.0/255.0, /*<vdw id = "18" radius = "*/1.880],
        [143.0/255.0, 64.0/255.0, 212.0/255.0, /*<vdw id = "19" radius = "*/2.750],
        [61.0/255.0, 255.0/255.0, 0.0/255.0, /*<vdw id = "20" radius = "*/2.310],
        [230.0/255.0, 230.0/255.0, 230.0/255.0, /*<vdw id = "21" radius = "*/2.110],
        [191.0/255.0, 194.0/255.0, 199.0/255.0, /*<vdw id = "22" radius = "*/2.000],
        [166.0/255.0, 166.0/255.0, 171.0/255.0, /*<vdw id = "23" radius = "*/2.000],
        [138.0/255.0, 153.0/255.0, 199.0/255.0, /*<vdw id = "24" radius = "*/2.000],
        [156.0/255.0, 122.0/255.0, 199.0/255.0, /*<vdw id = "25" radius = "*/2.000],
        [224.0/255.0, 102.0/255.0, 51.0/255.0, /*<vdw id = "26" radius = "*/2.000],
        [240.0/255.0, 144.0/255.0, 160.0/255.0, /*<vdw id = "27" radius = "*/2.000],
        [80.0/255.0, 208.0/255.0, 80.0/255.0, /*<vdw id = "28" radius = "*/1.630],
        [200.0/255.0, 128.0/255.0, 51.0/255.0, /*<vdw id = "29" radius = "*/1.400],
        [125.0/255.0, 128.0/255.0, 176.0/255.0, /*<vdw id = "30" radius = "*/1.390],
        [194.0/255.0, 143.0/255.0, 143.0/255.0, /*<vdw id = "31" radius = "*/1.870],
        [102.0/255.0, 143.0/255.0, 143.0/255.0, /*<vdw id = "32" radius = "*/2.110],
        [189.0/255.0, 128.0/255.0, 227.0/255.0, /*<vdw id = "33" radius = "*/1.850],
        [255.0/255.0, 161.0/255.0, 0.0/255.0, /*<vdw id = "34" radius = "*/1.900],
        [166.0/255.0, 41.0/255.0, 41.0/255.0, /*<vdw id = "35" radius = "*/1.850],
        [92.0/255.0, 184.0/255.0, 209.0/255.0, /*<vdw id = "36" radius = "*/2.020],
        [112.0/255.0, 46.0/255.0, 176.0/255.0, /*<vdw id = "37" radius = "*/3.030],
        [0.0/255.0, 255.0/255.0, 0.0/255.0, /*<vdw id = "38" radius = "*/2.490],
        [148.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "39" radius = "*/2.000],
        [148.0/255.0, 224.0/255.0, 224.0/255.0, /*<vdw id = "40" radius = "*/2.000],
        [115.0/255.0, 194.0/255.0, 201.0/255.0, /*<vdw id = "41" radius = "*/2.000],
        [84.0/255.0, 181.0/255.0, 181.0/255.0, /*<vdw id = "42" radius = "*/2.000],
        [59.0/255.0, 158.0/255.0, 158.0/255.0, /*<vdw id = "43" radius = "*/2.000],
        [36.0/255.0, 143.0/255.0, 143.0/255.0, /*<vdw id = "44" radius = "*/2.000],
        [10.0/255.0, 125.0/255.0, 140.0/255.0, /*<vdw id = "45" radius = "*/2.000],
        [0.0/255.0, 105.0/255.0, 133.0/255.0, /*<vdw id = "46" radius = "*/1.630],
        [192.0/255.0, 192.0/255.0, 192.0/255.0, /*<vdw id = "47" radius = "*/1.720],
        [255.0/255.0, 217.0/255.0, 143.0/255.0, /*<vdw id = "48" radius = "*/1.580],
        [166.0/255.0, 117.0/255.0, 115.0/255.0, /*<vdw id = "49" radius = "*/1.930],
        [102.0/255.0, 128.0/255.0, 128.0/255.0, /*<vdw id = "50" radius = "*/2.170],
        [158.0/255.0, 99.0/255.0, 181.0/255.0, /*<vdw id = "51" radius = "*/2.060],
        [212.0/255.0, 122.0/255.0, 0.0/255.0, /*<vdw id = "52" radius = "*/2.060],
        [148.0/255.0, 0.0/255.0, 148.0/255.0, /*<vdw id = "53" radius = "*/1.980],
        [66.0/255.0, 158.0/255.0, 176.0/255.0, /*<vdw id = "54" radius = "*/2.160],
        [87.0/255.0, 23.0/255.0, 143.0/255.0, /*<vdw id = "55" radius = "*/3.430],
        [0.0/255.0, 201.0/255.0, 0.0/255.0, /*<vdw id = "56" radius = "*/2.680],
        [112.0/255.0, 212.0/255.0, 255.0/255.0, /*<vdw id = "57" radius = "*/2.000],
        [255.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "58" radius = "*/2.000],
        [217.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "59" radius = "*/2.000],
        [199.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "60" radius = "*/2.000],
        [163.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "61" radius = "*/2.000],
        [143.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "62" radius = "*/2.000],
        [97.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "63" radius = "*/2.000],
        [69.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "64" radius = "*/2.000],
        [48.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "65" radius = "*/2.000],
        [31.0/255.0, 255.0/255.0, 199.0/255.0, /*<vdw id = "66" radius = "*/2.000],
        [0.0/255.0, 255.0/255.0, 156.0/255.0, /*<vdw id = "67" radius = "*/2.000],
        [0.0/255.0, 230.0/255.0, 117.0/255.0, /*<vdw id = "68" radius = "*/2.000],
        [0.0/255.0, 212.0/255.0, 82.0/255.0, /*<vdw id = "69" radius = "*/2.000],
        [0.0/255.0, 191.0/255.0, 56.0/255.0, /*<vdw id = "70" radius = "*/2.000],
        [0.0/255.0, 171.0/255.0, 36.0/255.0, /*<vdw id = "71" radius = "*/2.000],
        [77.0/255.0, 194.0/255.0, 255.0/255.0, /*<vdw id = "72" radius = "*/2.000],
        [77.0/255.0, 166.0/255.0, 255.0/255.0, /*<vdw id = "73" radius = "*/2.000],
        [33.0/255.0, 148.0/255.0, 214.0/255.0, /*<vdw id = "74" radius = "*/2.000],
        [38.0/255.0, 125.0/255.0, 171.0/255.0, /*<vdw id = "75" radius = "*/2.000],
        [38.0/255.0, 102.0/255.0, 150.0/255.0, /*<vdw id = "76" radius = "*/2.000],
        [23.0/255.0, 84.0/255.0, 135.0/255.0, /*<vdw id = "77" radius = "*/2.000],
        [208.0/255.0, 208.0/255.0, 224.0/255.0, /*<vdw id = "78" radius = "*/1.750],
        [255.0/255.0, 209.0/255.0, 35.0/255.0, /*<vdw id = "79" radius = "*/1.660],
        [184.0/255.0, 184.0/255.0, 208.0/255.0, /*<vdw id = "80" radius = "*/1.550],
        [166.0/255.0, 84.0/255.0, 77.0/255.0, /*<vdw id = "81" radius = "*/1.960],
        [87.0/255.0, 89.0/255.0, 97.0/255.0, /*<vdw id = "82" radius = "*/2.020],
        [158.0/255.0, 79.0/255.0, 181.0/255.0, /*<vdw id = "83" radius = "*/2.070],
        [171.0/255.0, 92.0/255.0, 0.0/255.0, /*<vdw id = "84" radius = "*/1.970],
        [117.0/255.0, 79.0/255.0, 69.0/255.0, /*<vdw id = "85" radius = "*/2.020],
        [66.0/255.0, 130.0/255.0, 150.0/255.0, /*<vdw id = "86" radius = "*/2.200],
        [66.0/255.0, 0.0/255.0, 102.0/255.0, /*<vdw id = "87" radius = "*/3.480],
        [0.0/255.0, 125.0/255.0, 0.0/255.0, /*<vdw id = "88" radius = "*/2.830],
        [112.0/255.0, 171.0/255.0, 250.0/255.0, /*<vdw id = "89" radius = "*/2.000],
        [0.0/255.0, 186.0/255.0, 255.0/255.0, /*<vdw id = "90" radius = "*/2.000],
        [0.0/255.0, 161.0/255.0, 255.0/255.0, /*<vdw id = "91" radius = "*/2.000],
        [0.0/255.0, 143.0/255.0, 255.0/255.0, /*<vdw id = "92" radius = "*/1.860],
        [0.0/255.0, 128.0/255.0, 255.0/255.0, /*<vdw id = "93" radius = "*/2.000],
        [0.0/255.0, 107.0/255.0, 255.0/255.0, /*<vdw id = "94" radius = "*/2.000],
        [84.0/255.0, 92.0/255.0, 242.0/255.0, /*<vdw id = "95" radius = "*/2.000],
        [120.0/255.0, 92.0/255.0, 227.0/255.0, /*<vdw id = "96" radius = "*/2.000],
        [138.0/255.0, 79.0/255.0, 227.0/255.0, /*<vdw id = "97" radius = "*/2.000],
        [161.0/255.0, 54.0/255.0, 212.0/255.0, /*<vdw id = "98" radius = "*/2.000],
        [179.0/255.0, 31.0/255.0, 212.0/255.0, /*<vdw id = "99" radius = "*/2.000],
        [179.0/255.0, 31.0/255.0, 186.0/255.0, /*<vdw id = "100" radius = "*/2.000],
        [179.0/255.0, 13.0/255.0, 166.0/255.0, /*<vdw id = "101" radius = "*/2.000],
        [189.0/255.0, 13.0/255.0, 135.0/255.0, /*<vdw id = "102" radius = "*/2.000],
        [199.0/255.0, 0.0/255.0, 102.0/255.0, /*<vdw id = "103" radius = "*/2.000],
        [204.0/255.0, 0.0/255.0, 89.0/255.0, /*<vdw id = "104" radius = "*/2.000],
        [209.0/255.0, 0.0/255.0, 79.0/255.0, /*<vdw id = "105" radius = "*/2.000],
        [217.0/255.0, 0.0/255.0, 69.0/255.0, /*<vdw id = "106" radius = "*/2.000],
        [224.0/255.0, 0.0/255.0, 56.0/255.0, /*<vdw id = "107" radius = "*/2.000],
        [230.0/255.0, 0.0/255.0, 46.0/255.0, /*<vdw id = "108" radius = "*/2.000],
        [235.0/255.0, 0.0/255.0, 38.0/255.0, /*<vdw id = "109" radius = "*/2.000],
        [255.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "110" radius = "*/2.000],
        [255.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "111" radius = "*/2.000],
        [255.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "112" radius = "*/2.000],
        [255.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "113" radius = "*/1.200],
        [255.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "114" radius = "*/1.520],
        [255.0/255.0, 255.0/255.0, 255.0/255.0, /*<vdw id = "115" radius = "*/1.200]
];

export const residueIds = {
    "ALA":1,
    "ARG":2,
    "ASN":3,
    "ASP":4,
    "CYS":5,
    "GLN":6,
    "GLU":7,
    "GLY":8,
    "HIS":9,
    "ILE":10,
    "LEU":11,
    "LYS":12,
    "MET":13,
    "PHE":14,
    "PRO":15,
    "SER":16,
    "THR":17,
    "TRP":18,
    "TYR":19,
    "VAL":20,
    "ASX":21,
    "GLX":22,
    "other":23
    };

export const residueColors = [
    /* default */ [255.0/255.0,255.0/255.0,255.0/255.0 ,255.0/255.0],
    /* Ala */ [200.0/255.0, 200.0/255.0, 200.0/255.0 ,255.0/255.0],
    /* Arg */ [20.0/255.0, 90.0/255.0, 255.0/255.0 ,255.0/255.0],
    /* Asn */ [0.0/255.0, 220.0/255.0, 220.0/255.0 ,255.0/255.0],
    /* Asp */ [230.0/255.0, 10.0/255.0, 10.0/255.0 ,255.0/255.0],
    /* Cys */ [230.0/255.0, 230.0/255.0, 0.0/255.0 ,255.0/255.0],
    /* Gln */ [0.0/255.0, 220.0/255.0, 220.0/255.0 ,255.0/255.0],
    /* Glu */ [230.0/255.0, 10.0/255.0, 10.0/255.0 ,255.0/255.0],
    /* Gly */ [235.0/255.0, 235.0/255.0, 235.0/255.0 ,255.0/255.0],
    /* His */ [130.0/255.0, 130.0/255.0, 210.0/255.0 ,255.0/255.0],
    /* Ile */ [15.0/255.0, 130.0/255.0, 15.0/255.0 ,255.0/255.0],
    /* Leu */ [15.0/255.0, 130.0/255.0, 15.0/255.0 ,255.0/255.0],
    /* Lys */ [20.0/255.0, 90.0/255.0, 255.0/255.0 ,255.0/255.0],
    /* Met */ [230.0/255.0, 230.0/255.0, 0.0/255.0 ,255.0/255.0],
    /* Phe */ [50.0/255.0, 50.0/255.0, 170.0/255.0 ,255.0/255.0],
    /* Pro */ [220.0/255.0, 150.0/255.0, 130.0/255.0 ,255.0/255.0],
    /* Ser */ [250.0/255.0, 150.0/255.0, 0.0/255.0 ,255.0/255.0],
    /* Thr */ [250.0/255.0, 150.0/255.0, 0.0/255.0 ,255.0/255.0],
    /* Trp */ [180.0/255.0, 90.0/255.0, 180.0/255.0 ,255.0/255.0],
    /* Tyr */ [50.0/255.0, 50.0/255.0, 170.0/255.0 ,255.0/255.0],
    /* Val */ [15.0/255.0, 130.0/255.0, 15.0/255.0 ,255.0/255.0],
    /* Asx */ [255.0/255.0, 105.0/255.0, 180.0/255.0 ,255.0/255.0],
    /* Glx */ [255.0/255.0, 105.0/255.0, 180.0/255.0 ,255.0/255.0],
    /* other */ [190.0/255.0, 160.0/255.0, 110.0/255.0, 255.0/255.0]
];


export const chainIds = {
		"A":1.0/255.0,
		"a":2,
		"B":3,
		"b":4,
		"C":5,
		"c":6,
		"D":7,
		"d":8,
		"E":9,
		"e":10,
		"F":11,
		"f":12,
		"G":13,
		"g":14,
		"H":15,
		"h":16,
		"I":17,
		"i":18,
		"J":19,
		"j":20,
		"K":21,
		"k":22,
		"L":23,
		"l":24,
		"M":25,
		"m":26,
		"N":27,
		"n":28,
		"O":29,
		"o":30,
		"P":31,
		"p":32,
		"0":33,
		"Q":34,
		"q":35,
		"1":36,
		"R":37,
		"r":38,
		"2":39,
		"S":40,
		"s":41,
		"3":42,
		"T":43,
		"t":44,
		"4":45,
		"U":46,
		"u":47,
		"5":48,
		"V":49,
		"v":50,
		"6":51,
		"W":52,
		"w":53,
		"7":54,
		"X":55,
		"x":56,
		"8":57,
		"Y":58,
		"y":59,
		"9":60,
		"Z":61,
		"z":62,
		"none":63
	};

export const chainColors =[ 
		/* default */ [255.0/255.0,255.0/255.0,255.0/255.0,255.0/255.0],
		/* A */ [192.0/255.0,208.0/255.0,255.0/255.0,255.0/255.0],
		/* a */ [192.0/255.0,208.0/255.0,255.0/255.0,255.0/255.0],
		/* B */ [176.0/255.0,255.0/255.0,176.0/255.0,255.0/255.0],
		/* b */ [176.0/255.0,255.0/255.0,176.0/255.0,255.0/255.0],
		/* C */ [255.0/255.0,192.0/255.0,200.0/255.0,255.0/255.0],
		/* c */ [255.0/255.0,192.0/255.0,200.0/255.0,255.0/255.0],
		/* D */ [255.0/255.0,255.0/255.0,128.0/255.0,255.0/255.0],
		/* d */ [255.0/255.0,255.0/255.0,128.0/255.0,255.0/255.0],
		/* E */ [255.0/255.0,192.0/255.0,255.0/255.0,255.0/255.0],
		/* e */ [255.0/255.0,192.0/255.0,255.0/255.0,255.0/255.0],
		/* F */ [176.0/255.0,240.0/255.0,240.0/255.0,255.0/255.0],
		/* f */ [176.0/255.0,240.0/255.0,240.0/255.0,255.0/255.0],
		/* G */ [255.0/255.0,208.0/255.0,112.0/255.0,255.0/255.0],
		/* g */ [255.0/255.0,208.0/255.0,112.0/255.0,255.0/255.0],
		/* H */ [240.0/255.0,128.0/255.0,128.0/255.0,255.0/255.0],
		/* h */ [240.0/255.0,128.0/255.0,128.0/255.0,255.0/255.0],
		/* I */ [245.0/255.0,222.0/255.0,179.0/255.0,255.0/255.0],
		/* i */ [245.0/255.0,222.0/255.0,179.0/255.0,255.0/255.0],
		/* J */ [0.0/255.0,191.0/255.0,255.0/255.0,255.0/255.0],
		/* j */ [0.0/255.0,191.0/255.0,255.0/255.0,255.0/255.0],
		/* K */ [205.0/255.0,92.0/255.0,92.0/255.0,255.0/255.0],
		/* k */ [205.0/255.0,92.0/255.0,92.0/255.0,255.0/255.0],
		/* L */ [102.0/255.0,205.0/255.0,170.0/255.0,255.0/255.0],
		/* l */ [102.0/255.0,205.0/255.0,170.0/255.0,255.0/255.0],
		/* M */ [154.0/255.0,205.0/255.0,50.0/255.0,255.0/255.0],
		/* m */ [154.0/255.0,205.0/255.0,50.0/255.0,255.0/255.0],
		/* N */ [238.0/255.0,130.0/255.0,238.0/255.0,255.0/255.0],
		/* n */ [238.0/255.0,130.0/255.0,238.0/255.0,255.0/255.0],
		/* O */ [0.0/255.0,206.0/255.0,209.0/255.0,255.0/255.0],
		/* o */ [0.0/255.0,206.0/255.0,209.0/255.0,255.0/255.0],
		/* P */ [0.0/255.0,255.0/255.0,127.0/255.0,255.0/255.0],
		/* p */ [0.0/255.0,255.0/255.0,127.0/255.0,255.0/255.0],
		/* 0 */ [0.0/255.0,255.0/255.0,127.0/255.0,255.0/255.0],
		/* Q */ [60.0/255.0,179.0/255.0,113.0/255.0,255.0/255.0],
		/* q */ [60.0/255.0,179.0/255.0,113.0/255.0,255.0/255.0],
		/* 1 */ [60.0/255.0,179.0/255.0,113.0/255.0,255.0/255.0],
		/* R */ [0.0/255.0,0.0/255.0,139.0/255.0,255.0/255.0],
		/* r */ [0.0/255.0,0.0/255.0,139.0/255.0,255.0/255.0],
		/* 2 */ [0.0/255.0,0.0/255.0,139.0/255.0,255.0/255.0],
		/* S */ [189.0/255.0,183.0/255.0,107.0/255.0,255.0/255.0],
		/* s */ [189.0/255.0,183.0/255.0,107.0/255.0,255.0/255.0],
		/* 3 */ [189.0/255.0,183.0/255.0,107.0/255.0,255.0/255.0],
		/* T */ [0.0/255.0,100.0/255.0,0.0/255.0,255.0/255.0],
		/* t */ [0.0/255.0,100.0/255.0,0.0/255.0,255.0/255.0],
		/* 4 */ [0.0/255.0,100.0/255.0,0.0/255.0,255.0/255.0],
		/* U */ [128.0/255.0,0.0/255.0,0.0/255.0,255.0/255.0],
		/* u */ [128.0/255.0,0.0/255.0,0.0/255.0,255.0/255.0],
		/* 5 */ [128.0/255.0,0.0/255.0,0.0/255.0,255.0/255.0],
		/* V */ [128.0/255.0,128.0/255.0,0.0/255.0,255.0/255.0],
		/* v */ [128.0/255.0,128.0/255.0,0.0/255.0,255.0/255.0],
		/* 6 */ [128.0/255.0,128.0/255.0,0.0/255.0,255.0/255.0],
		/* W */ [128.0/255.0,0.0/255.0,128.0/255.0,255.0/255.0],
		/* w */ [128.0/255.0,0.0/255.0,128.0/255.0,255.0/255.0],
		/* 7 */ [128.0/255.0,0.0/255.0,128.0/255.0,255.0/255.0],
		/* X */ [0.0/255.0,128.0/255.0,128.0/255.0,255.0/255.0],
		/* x */ [0.0/255.0,128.0/255.0,128.0/255.0,255.0/255.0],
		/* 8 */ [0.0/255.0,128.0/255.0,128.0/255.0,255.0/255.0],
		/* Y */ [184.0/255.0,134.0/255.0,11.0/255.0,255.0/255.0],
		/* y */ [184.0/255.0,134.0/255.0,11.0/255.0,255.0/255.0],
		/* 9 */ [184.0/255.0,134.0/255.0,11.0/255.0,255.0/255.0],
		/* Z */ [178.0/255.0,34.0/255.0,34.0/255.0,255.0/255.0],
		/* z */ [178.0/255.0,34.0/255.0,34.0/255.0,255.0/255.0],
		/* none */ [255.0/255.0,255.0/255.0,255.0/255.0,255.0/255.0]
    ];

export const elementColorsRadiiArray = new Float32Array(elementColorsRadii.flat());
export const residueColorsArray = new Float32Array(residueColors.flat());
export const chainColorsArray = new Float32Array(chainColors.flat());