import { patch } from './patcher';

test('test patch', async () => {
    expect(await patch("user_code", "dist")).toBe(true);
});

