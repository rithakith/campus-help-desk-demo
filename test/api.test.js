import { test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { resetTasks } from '../src/task-store.js';

test('classroom request sequence returns real status codes and changes state', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = (path, method = 'GET', body) => fetch(base + path, {
    method, ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body })
  });
  try {
    resetTasks();
    let result = await send('/api/tasks');
    assert.equal(result.status, 200);
    assert.equal((await result.json()).count, 3);
    result = await send('/api/tasks?completed=false');
    assert.equal((await result.json()).count, 2);
    result = await send('/api/tasks', 'POST', '{"text":"  Printer is broken  "}');
    assert.equal(result.status, 201);
    const created = await result.json();
    assert.equal(created.text, 'Printer is broken');
    assert.equal(result.headers.get('location'), `/api/tasks/${created.id}`);
    assert.equal((await (await send(`/api/tasks/${created.id}`)).json()).text, created.text);
    for (const body of ['{}', '{"text":" "}', '{"text":42}', 'null', '{"text":']) {
      assert.equal((await send('/api/tasks', 'POST', body)).status, 400);
    }
    assert.equal((await (await send('/api/tasks')).json()).count, 4);
    assert.equal((await send('/api/tasks/999')).status, 404);
    assert.equal((await send('/missing')).status, 404);
    assert.equal((await send('/api/tasks/abc')).status, 400);
    assert.equal((await send('/api/tasks/1', 'PATCH', '{"completed":"true"}')).status, 400);
    result = await send('/api/tasks/1', 'PATCH', '{"completed":true}');
    assert.equal(result.status, 200);
    assert.equal((await result.json()).completed, true);
    result = await send('/api/tasks/3', 'DELETE');
    assert.equal(result.status, 204);
    assert.equal(await result.text(), '');
    assert.equal((await send('/api/tasks/3', 'DELETE')).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
