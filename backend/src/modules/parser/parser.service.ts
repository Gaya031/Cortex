import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { ParsedFile } from "./parser.types.js";

const traverse = traverseModule.default;

export class ParserService {
  parseCode(code: string): ParsedFile {
    const result: ParsedFile = {
      imports: [],
      exports: [],
      functions: [],
      components: [],
      interfaces: [],
      types: [],
      classes: [],
    };

    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    traverse(ast, {
      ImportDeclaration(path) {
        result.imports.push({ source: path.node.source.value });
      },
      FunctionDeclaration(path) {
        result.functions.push({
          name: path.node.id?.name || "anonymous",
          startLine: path.node.loc?.start.line,
          endLine: path.node.loc?.end.line,
        });
      },

      ClassDeclaration(path) {
        const methods: string[] = [];
        path.node.body.body.forEach((member: any) => {
          if (member.type === "ClassMethod") {
            methods.push(member.key.name);
          }
        });
        result.classes.push({
          name: path.node.id?.name || "AnonymousClass",
          methods,
        });
      },

      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration;
        if (declaration && declaration.type === "FunctionDeclaration") {
          result.exports.push({ name: declaration.id?.name || "anonymous" });
        }
      },

      TSInterfaceDeclaration(path) {
        result.interfaces.push({ name: path.node.id.name });
      },

      TSTypeAliasDeclaration(path) {
        result.types.push({ name: path.node.id.name });
      },

      VariableDeclarator(path) {
        const init = path.node.init;
        if (
          init &&
          (init.type === "ArrowFunctionExpression" ||
            init.type === "FunctionExpression")
        ) {
          const name =
            path.node.id.type === "Identifier"
              ? path.node.id.name
              : "anonymous";

          result.functions.push({
            name,
            startLine: path.node.loc?.start.line,
            endLine: path.node.loc?.end.line,
          });

          if (/^[A-Z]/.test(name)) {
            result.components.push({
              name,
            });
          }
        }
      },
      ExportDefaultDeclaration(path){
        const declaration = path.node.declaration;
        if(declaration.type === "Identifier"){
            result.exports.push({
                name: declaration.name,
            })
        }
      }
    });
    return result;
  }
}
