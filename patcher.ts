import fs from "fs";
import path from 'path';
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import {parse} from "@babel/parser";
import { isMemberExpression, identifier, isIdentifier, stringLiteral } from "@babel/types";


async function listFiles(dir: string): Promise<string[]> {
    let results: string[] = [];
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.promises.stat(filePath);

        if (stat.isDirectory()) {
            results = results.concat(await listFiles(filePath));
        } else {
            results.push(filePath);
        }
    }

    return results;
}



export async function patchCode(code: string): Promise<string> {
    const ast = parse(code);

    traverse(ast, {
        CallExpression: function (path) {
            let originalFunc = "";

            if (isMemberExpression(path.node.callee)) {
                if (isIdentifier(path.node.callee.object) && isIdentifier(path.node.callee.property)) {
                    originalFunc = path.node.callee.object.name + "." + path.node.callee.property.name;
                }
            }

            if (isIdentifier(path.node.callee)) {
                originalFunc = path.node.callee.name;
            }

            path.node.callee = identifier("ak");
            path.node.arguments.push(stringLiteral(originalFunc));
        },
    })

    return  generate(ast, {compact: true, minified: true}).code;
}


export async function patch(input_dir: string, output_dir: string) : Promise<boolean> {
    if (!fs.existsSync(output_dir)){
        fs.mkdirSync(output_dir);
    }
    const files = await listFiles(input_dir);
    for (const file of files) {
        const code = await fs.promises.readFile(file);
        const outfile = file.replace(input_dir, output_dir)
        const patched = await patchCode(code.toString());
        await fs.promises.writeFile(outfile, patched);
    }
    return true;
}
