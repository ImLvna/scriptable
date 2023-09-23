// Scriptable Metadata
//! icon-color: deep-gray; icon-glyph: code;
const req = new Request(`${BASE_URL}/${Script.name()}.js`);

const code = await req.loadString();

console.log(`Running ${Script.name()}`);
(0, eval)(code);
