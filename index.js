import fs from 'fs'
import antlr4 from 'antlr4'
import grammarPythonLexer from './grammarPythonLexer.js'
import grammarPythonParser from './grammarPythonParser.js'

const nameFile = process.argv[2]

var input = fs.readFileSync(nameFile, 'UTF-8')
var chars = new antlr4.InputStream(input)
var lexer = new grammarPythonLexer(chars)
var tokens = new antlr4.CommonTokenStream(lexer)
var parser = new grammarPythonParser(tokens)

var errTokens = [];

parser.removeErrorListeners();
var minorErr = 0;
var deadCode = 0;
var majorErr = 0;
var errorList = [];

//gestion en fonction du type d'erreur
parser.addErrorListener({
    syntaxError: (recognizer, offendingSymbol, line, column, msg, err) => {
        console.error(`offendingSymbol: ${offendingSymbol}, line ${line}, col ${column}: ${msg}, err: ${err}`);
        errTokens.push(offendingSymbol)

        // console.log("################################## " + recognizer['_input'])
        // for(let el in recognizer){
        //     console.log("!!!!!!EL: " + el)
        // }
    }
});

parser.buildParseTrees = true
var tree = parser.file_input()
const totalLines = tree.stop.line;
const tokenIndex = tree.stop.tokenIndex-1;


if (tree.parser._syntaxErrors == 0) {
    console.log("aucune erreurs de syntax trouvé ! ")
    console.log("total lines: " + totalLines)
}
else {
    console.log("Nombre des erreurs: " + tree.parser._syntaxErrors)


    for (let err in parser._errHandler) {
        console.log("err: " + err + " " + parser._errHandler[err])
    }
}

// console.log("****************************")

// for (let err in errTokens) {
//     let errTok =  errTokens[err];
//     let errLine = errTok.line;
    
//     if(errLine < totalLines || errTok.tokenIndex < tokenIndex)
//     {
//         errLine = errTok.line - 1;
//     }
        
//     console.log("errToken: " + errTok + " " + "line: " + errLine + " || total: " + totalLines + " || lastTokenIndex: " + tokenIndex)
// }
// console.log("****************************")


console.log("ERROR DETECTOR: ")

let printErrLine = -1;
for(let err in errTokens){
    let errTok =  errTokens[err];
    
    let index = 0;
    let isPrint = false;
    
    while(index < tokenIndex-1){
        let token = tokens.get(index);
        
        if(token.line == errTok.line && printErrLine != token.line){
            
            if(token.text.includes("print")){
                isPrint = true;
                minorErr++;
            }
            if(isPrint){
                printErrLine = token.line;
            }

            if(token.text.includes("=")){
                minorErr++; //déclaration err   
            }

        }


        index++;

    }

}

console.log("DEADCODE")

let inDef = false;
let returnUsed = false;
let lastDeadCodeLine = -1;
let returnLine = 0;
let defCounter = 0;
let index = 0;
while(index < tokenIndex-1){
    let token = tokens.get(index);
    
    if(token.text == "def"){
        inDef = true;
        defCounter++;
    }

    if(token.text == "return"){
        returnUsed = true;
        returnLine = token.line;
    }

    if(token.text.includes("\n")){
        returnUsed = false;
        inDef = false;
        defCounter--;
    }

    if(returnUsed == true && returnLine < token.line  && token.text.trim() != ''){
        
        if(lastDeadCodeLine != token.line){
            lastDeadCodeLine = token.line;
            deadCode++;
        }
        lastDeadCodeLine = token.line;
        
    }
    index++;
}

console.log("DEADCODE ERR: " + deadCode)  //p.ex un code après return
console.log("MINOR ERR: " + minorErr) // p.ex un var sans declarator


// while(index < tokenIndex-1){

//     let token = tokens.get(index);
//     if(token.line == line){
//         if("print" in token.text){
//             printErr = true;
//             minorErr++;
//         }


//     }
//     console.log("Index: " + index + " : " + tokens.get(index))
//     index++;
// }


console.log("TOKENS: ")
index = 0;
while(index < tokenIndex-1){
    console.log("Index: " + index + " : " + tokens.get(index))
    index++;
}

