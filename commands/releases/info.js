'use strict';

let cli  = require('heroku-cli-util');
let co   = require('co');

function* run (context, heroku) {
  // TODO: find out how to get config vars and addons data in apiv3 or deprecate this command
  let id = (context.args.release || 'current').toLowerCase();
  id = id.startsWith('v') ? id.slice(1) : id;
  let release;
  if (id === 'current') {
    release = (yield heroku.request({
      path: `/apps/${context.app}/releases`,
      partial: true,
      headers: { 'Range': `version ..; max=1, order=desc` },
    }))[0];
  } else {
    release = yield heroku.get(`/apps/${context.app}/releases/${id}`);
  }
  if (context.flags.json) {
    cli.log(JSON.stringify(release, null, 2));
  } else {
    cli.debug(release);
  }
}

module.exports = {
  topic: 'releases',
  command: '_info',
  description: 'view detailed information for a release',
  help: `
Example:

 $ heroku releases
 === example Releases
 v1 Config add FOO_BAR email@example.com 2015/11/17 17:37:41 (~ 1h ago)
 v2 Config add BAR_BAZ email@example.com 2015/11/17 17:37:41 (~ 1h ago)
 v3 Config add BAZ_QUX email@example.com 2015/11/17 17:37:41 (~ 1h ago)`,
  needsApp: true,
  needsAuth: true,
  args: [{name: 'release', optional: true}],
  flags: [
    {name: 'json', description: 'output in json format'},
  ],
  run: cli.command(co.wrap(run))
};
