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
var listener = new SyntaxError();

var errTokens = [];

parser.removeErrorListeners();

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
const tokenIndex = tree.stop.tokenIndex-1;


if (tree.parser._syntaxErrors == 0) {
    console.log("aucune erreurs de syntax trouvé ! ")
    console.log("total lines: " + totalLines)
}
else {
    console.log("Nombre des erreurs: " + tree.parser._syntaxErrors)
    //console.log("une ou plusieurs erreur de syntax ont été trouvé ! ")
    console.log("error name : " + listener.name + " line: " + listener.message)


    for (let err in parser._errHandler) {
        console.log("err: " + err + " " + parser._errHandler[err])
    }
}

console.log("****************************")

for (let err in errTokens) {
    let errTok =  errTokens[err];
    let errLine = errTok.line;
    
    if(errLine < totalLines || errTok.tokenIndex < tokenIndex)
    {
        errLine = errTok.line - 1;
    }
        
    console.log("errToken: " + errTok + " " + "line: " + errLine + " || total: " + totalLines + " || lastTokenIndex: " + tokenIndex)
}
console.log("****************************")


// console.log("TOKENS: ")
// let index = 0;
// while(index < tokenIndex-1){
//     console.log("Index: " + index + " : " + tokens.get(index))
//     index++;
// }

