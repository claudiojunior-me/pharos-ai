import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const cli = yargs(hideBin(process.argv))
  .command(
    'tag <source> <destination>',
    'Tag content from a source to a destination',
    (yargs) => {
      yargs
        .positional('source', {
          describe: 'The source of the content (e.g., Medium, Pocket)',
          type: 'string',
        })
        .positional('destination', {
          describe: 'The destination for the tagged content (e.g., Notion, Obsidian)',
          type: 'string',
        });
    },
    (argv) => {
      console.log(`Tagging from ${argv.source} to ${argv.destination}`);
      // TODO: Implement tagging logic
    }
  )
  .command(
    'export <source>',
    'Export content from a source',
    (yargs) => {
      yargs
        .positional('source', {
          describe: 'The source of the content (e.g., Medium, Pocket)',
          type: 'string',
        })
        .option('theme', {
          alias: 't',
          type: 'string',
          description: 'Specify a theme for the export',
        })
        .option('count', {
          alias: 'c',
          type: 'number',
          description: 'Number of items to export',
        });
    },
    (argv) => {
      console.log(`Exporting from ${argv.source} with theme ${argv.theme || 'default'} and count ${argv.count || 'all'}`);
      // TODO: Implement export logic
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .parse();
