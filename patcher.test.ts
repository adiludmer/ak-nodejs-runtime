import { patchCode } from './patcher';

test('test patch identifier', async () => {
    const code = `function some_func() { 
        a("hi");
    }`;

    const patchedCode = `function some_func(){ak("hi","a")}`;
    expect(await patchCode(code)).toEqual(patchedCode);
});

test('test patch member', async () => {
    const code = `function some_func() { 
        a.b("hi");
    }`;

    const patchedCode = `function some_func(){ak("hi","a.b")}`;
    expect(await patchCode(code)).toEqual(patchedCode);
});
