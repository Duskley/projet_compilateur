import fs from 'fs'
import antlr4 from 'antlr4'
import grammarPythonLexer from './grammarPythonLexer.js'
import grammarPythonParser from './grammarPythonParser.js'

if(process.argv.length < 3) {
    console.log("Aucun fichier test a été donné en argument ! ")
    process.exit(1)
}

const nameFile = process.argv[2]

var input = fs.readFileSync(nameFile, 'UTF-8')
var chars = new antlr4.InputStream(input)
var lexer = new grammarPythonLexer(chars)
var tokens  = new antlr4.CommonTokenStream(lexer)
var parser = new grammarPythonParser(tokens)

parser.buildParseTrees = true
var tree = parser.file_input()

if (tree.parser._syntaxErrors == 0)
{
    console.log("aucune erreurs de syntax trouvé ! ")
}
else
{
    console.log("une ou plusieurs erreur de syntax ont été trouvé ! ")
}