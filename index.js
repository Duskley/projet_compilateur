import fs from 'fs'
import antlr4 from 'antlr4'
import grammarPythonLexer from './grammarPythonLexer.js'
import grammarPythonParser from './grammarPythonParser.js'
import { type } from 'os'

const nameFile = process.argv[2]

var input = fs.readFileSync(nameFile, 'UTF-8')
var chars = new antlr4.InputStream(input)
var lexer = new grammarPythonLexer(chars)
var tokens  = new antlr4.CommonTokenStream(lexer)
var parser = new grammarPythonParser(tokens)
var listener = new SyntaxError();

var errLine = [];

parser.removeErrorListeners();
parser.addErrorListener({
syntaxError: (recognizer, offendingSymbol, line, column, msg, err) => {
    console.error(`offendingSymbol: ${offendingSymbol}, line ${line}, col ${column}: ${msg}, err: ${err}`);
    errLine.push(line)
}
});


parser.buildParseTrees = true
var tree = parser.file_input()
const totalLines = tree.stop.line;
const tokenIndex = tree.stop.tokenIndex;


if (tree.parser._syntaxErrors == 0)
{
    console.log("aucune erreurs de syntax trouvé ! ")
    console.log("total lines: " + totalLines)
}
else
{
    console.log("Nombre des erreurs: " + tree.parser._syntaxErrors) 
    //console.log("une ou plusieurs erreur de syntax ont été trouvé ! ")
    console.log("error name : " + listener.name + " line: " + listener.message)
    

      for(let err in parser._errHandler){
        console.log("err: " + err + " " +  parser._errHandler[err])
    }
}

console.log("****************************")
console.log("errLine: " + errLine)

// console.log("TOKENS: ")
// let index = 0;
// while(index < tokenIndex-1){
//     console.log(index + " : " + tokens.get(index))
//     index++;
// }

