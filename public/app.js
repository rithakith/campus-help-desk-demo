const $ = id => document.getElementById(id);
const scenarios = [
  ['Read all requests', 'GET', '/api/tasks', '', 'Which requests are on the help desk?'],
  ['Only unfinished requests', 'GET', '/api/tasks?completed=false', '', 'The query string filters the collection.'],
  ['Read request #1', 'GET', '/api/tasks/1', '', 'The path parameter chooses one request.'],
  ['Create a request', 'POST', '/api/tasks', '{"text":"The library printer needs paper"}', 'Will a new item exist after this request?'],
  ['Submit empty text', 'POST', '/api/tasks', '{"text":"   "}', 'Can the help desk accept a request with no description?'],
  ['Find missing request', 'GET', '/api/tasks/999', '', 'The route exists. Does the requested item exist?'],
  ['Visit unknown route', 'GET', '/api/cafeteria', '', 'Does this server know this path?'],
  ['Send broken JSON', 'POST', '/api/tasks', '{"text":', 'Can the server parse this JSON?'],
  ['Complete request #1 · extra', 'PATCH', '/api/tasks/1', '{"completed":true}', 'Update just one property, then read the list again.'],
  ['Delete request #3 · extra', 'DELETE', '/api/tasks/3', '', 'Success can have an empty response body. Try it twice.'],
  ['Server failure · demo', 'GET', '/demo/error', '', 'This route deliberately fails on the server.'],
  ['Check server health', 'GET', '/api/health', '', 'A simple JSON response confirms that the server is running.']
];
for (const [title, method, path, body, story] of scenarios) {
  const button = document.createElement('button');
  const strong = document.createElement('strong'); strong.textContent = title;
  const small = document.createElement('small'); small.textContent = `${method} ${path}`;
  button.append(strong, small);
  button.onclick = () => {
    $('method').value = method; $('path').value = path; $('body').value = body;
    $('prediction').value = ''; $('story').textContent = story;
  };
  $('scenarios').append(button);
}
const explanations = {
  200: 'OK: the server successfully handled the request.',
  201: 'Created: a new help request now exists. Read the list to prove it.',
  204: 'No Content: the action succeeded; this response deliberately has no body.',
  400: 'Bad Request: fix the input before sending it again.',
  404: 'Not Found: this route or requested item does not exist.',
  500: 'Internal Server Error: the server encountered an unexpected failure.'
};
async function send(method, path, body = '') {
  // Keep the classroom console on this local server.
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    $('story').textContent = 'Use a local path beginning with one /.'; return;
  }
  $('send').disabled = true;
  const options = { method };
  if (['POST', 'PATCH'].includes(method)) {
    options.headers = { 'Content-Type': 'application/json' }; options.body = body;
  }
  $('request').textContent = `${method} ${path}\nHost: ${location.host}` + (options.body !== undefined ? `\nContent-Type: application/json\n\n${body}` : '');
  try {
    const response = await fetch(path, options);
    const raw = await response.text();
    let pretty = raw;
    try { pretty = JSON.stringify(JSON.parse(raw), null, 2); } catch {}
    $('status').textContent = `${response.status} ${response.statusText}`;
    $('status').className = `badge ${response.status < 400 ? 'ok' : response.status < 500 ? 'bad' : 'server'}`;
    $('explanation').textContent = explanations[response.status] || 'Inspect the response body for details.';
    $('response').textContent = raw ? pretty : '(empty body — zero content)';
    $('headers').textContent = [...response.headers].map(([key, value]) => `${key}: ${value}`).join('\n');
    const prediction = $('prediction').value;
    $('story').textContent = prediction ? (Number(prediction) === response.status ? 'Prediction matched! Explain why this code fits.' : `You predicted ${prediction}; the server returned ${response.status}. What explains the difference?`) : 'Explain the code, then change one thing and try again.';
    const entry = document.createElement('li'); entry.textContent = `${method} ${path} → ${response.status}`;
    $('history').prepend(entry); if ($('history').children.length > 8) $('history').lastChild.remove();
  } catch (error) {
    $('status').textContent = 'No HTTP response'; $('status').className = 'badge server';
    $('response').textContent = 'Could not reach the server. Check the terminal and restart npm start if needed.';
    $('explanation').textContent = 'A network failure is different from a 500 response.';
  } finally { $('send').disabled = false; }
}
$('send').onclick = () => send($('method').value, $('path').value.trim(), $('body').value);
$('reset').onclick = () => { $('prediction').value = ''; send('POST', '/demo/reset', '{}'); };
