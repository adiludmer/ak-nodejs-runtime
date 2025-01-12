import fs from "fs";
import path from 'path';
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import {parse} from "@babel/parser";
const t = require("@babel/types");

// Function to get all files recursively
async function getFilesRecursive(dir: string): Promise<string[]> {
    let results: string[] = [];
    let files = await fs.promises.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.promises.stat(filePath);

        if (stat.isDirectory()) {
            // Recursive call for subdirectory
            results = results.concat(await getFilesRecursive(filePath));
        } else {
            // Add file to results
            results.push(filePath);
        }
    }

    return results;
}

async function patchFile(input_file: string, output_file: string): Promise<void> {
    let content = await fs.promises.readFile(input_file);

    const ast = parse(content.toString())

    traverse(ast, {
        CallExpression: function (path) {
            if (t.isMemberExpression(path.node.callee)) {
                // Example: Change "console.log" to "myLogger.log"
                path.node.callee = t.memberExpression(
                    t.identifier("myLogger"),
                    t.identifier("log")
                );
            }
        },
    })

    let patched = generate(ast)

    await fs.promises.writeFile(output_file, patched.code);
}

// Example usage
export async function patch(input_dir: string, output_dir: string) : Promise<boolean> {
    if (!fs.existsSync(output_dir)){
        fs.mkdirSync(output_dir);
    }
    let files = await getFilesRecursive(input_dir);
    for (const file of files) {
        let outfile = file.replace(input_dir, output_dir)
        await patchFile(file, outfile);
    }
    return true;
}
