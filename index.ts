import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";


function add(a: number,b: number): number {
    console.log(a, b);
    return a + b;
}

const code = add.toString();


const ast = parse(code);

traverse(ast, {
    enter(path) {
        if (path.isIdentifier({ name: "Example" })) {
            path.node.name = "x";
        }
    },
});

const output = generate(
    ast,
    {
        /* options */
    },
    code
);

console.log(output.code);