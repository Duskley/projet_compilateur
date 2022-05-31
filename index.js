import fs from 'fs'
import antlr4 from 'antlr4'
import grammarPythonLexer from './grammarPythonLexer.js'
import grammarPythonParser from './grammarPythonParser.js'

const nameFile = process.argv[2]

var input = fs.readFileSync(nameFile, 'UTF-8')
var chars = new antlr4.InputStream(input)
var lexer = new grammarPythonLexer(chars)
var tokens  = new antlr4.CommonTokenStream(lexer)
var parser = new grammarPythonParser(tokens)

/*************************************************************************************************************************** */
var nbLine=0
input.split(/\r?\n/).forEach(line => {
    console.log(`Line from file: ${line}`);
    nbLine++;
});


/******************************************************************************************************************************/

var errTokens = [];

parser.removeErrorListeners();
var minorErr = 0;
var deadCode = 0;
var majorErr = 0;
var errorList = [];
var score = 100;
var erreurG = score - (majorErr + minorErr);
var note="EXCELLENT"

//gestion en fonction du type d'erreur
parser.addErrorListener({
    syntaxError: (recognizer, offendingSymbol, line, column, msg, err) => {
        console.error(`offendingSymbol: ${offendingSymbol}, line ${line}, col ${column}: ${msg}, err: ${err}`);
        errTokens.push(offendingSymbol)
    }
});

parser.buildParseTrees = true
var tree = parser.file_input()
const totalLines = tree.stop.line;
const tokenIndex = tree.stop.tokenIndex - 1;




console.log("ERROR DETECTOR: ")

let printErrLine = -1;
for (let err in errTokens) {
    let errTok = errTokens[err];

    let index = 0;
    let isPrint = false;

    while (index < tokenIndex - 1) {
        let token = tokens.get(index);

        if (token.line == errTok.line && printErrLine != token.line) {

            if (token.text.includes("print")) {
                isPrint = true;
                minorErr++;
                score=score - (minorErr*15)
            }
            if (isPrint) {
                printErrLine = token.line;
            }

            if (token.text.includes("=")) {
                majorErr++; //déclaration err  
                score=score-(majorErr*25)
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
while (index < tokenIndex - 1) {
    let token = tokens.get(index);

    if (token.text == "def") {
        inDef = true;
        defCounter++;
    }

    if (token.text == "return") {
        returnUsed = true;
        returnLine = token.line;
    }

    if (token.text.includes("\n")) {
        returnUsed = false;
        inDef = false;
        defCounter--;
    }

    if (returnUsed == true && returnLine < token.line && token.text.trim() != '') {

        if (lastDeadCodeLine != token.line) {
            lastDeadCodeLine = token.line;
            deadCode++;
            score=score - (deadCode*10)
        }
        lastDeadCodeLine = token.line;

    }
    index++;
}

console.log("DEADCODE ERR: " + deadCode)  //p.ex un code après return
console.log("MINOR ERR: " + minorErr) // p.ex un print sans ()
console.log("MAJOR ERR: " + majorErr) // p.ex un var sans declarator


console.log("TOKENS: ")
index = 0;
if(score < 0 ) score = 0

var scoreT = (score * nbLine) / 100

if (scoreT < 5 || scoreT==5)
    note = "Mauvais"
if (scoreT > 5 && (scoreT < 45 || scoreT == 45))
    note = "Faible"
if (scoreT > 45 && (scoreT < 60 || scoreT == 60))
    note = "Moyen"
if (scoreT > 60 && (scoreT < 70 || scoreT == 70))
    note = "Assez-Bien"
if (scoreT > 70 && (scoreT < 85 || scoreT == 90))
    note = "Bien"
if (scoreT > 85 && (scoreT < 95 || scoreT == 95))
    note = "Très Bien"
// while (index < tokenIndex - 1) {
//     console.log("Index: " + index + " : " + tokens.get(index))
//     index++;
// }

if (tree.parser._syntaxErrors == 0) {
    console.log("aucune erreurs de syntax trouvé ! votre score est de =>" + score+" "+note)
    console.log("total lines: " + totalLines)
}
else {
    console.log("Nombre des erreurs: " + tree.parser._syntaxErrors + " sur " + nbLine + " lignes")
    console.log("Avec un score Totale de " + scoreT + " % "+note)


 
}






