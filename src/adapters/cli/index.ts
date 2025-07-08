import 'reflect-metadata';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { container } from 'tsyringe';

import { ICliService } from '../../application/ports/ICliService';
import { TagContentUseCase } from '../../application/usecases/TagContentUseCase';
import { ExportContentUseCase } from '../../application/usecases/ExportContentUseCase';

container.register<ICliService>('TagContentUseCase', {
  useClass: TagContentUseCase,
});
container.register<ICliService>('ExportContentUseCase', {
  useClass: ExportContentUseCase,
});

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
    async (argv) => {
      const tagService = container.resolve<ICliService>('TagContentUseCase');
      await tagService.tag(argv.source as string, argv.destination as string);
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
    async (argv) => {
      const exportService = container.resolve<ICliService>('ExportContentUseCase');
      await exportService.export(argv.source as string, argv.theme as string, argv.count as number);
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .fail((msg, err, yargs) => {
    if (err) throw err; // preserve stack
    console.error('Error:', msg);
    process.exit(1);
  })
  .parse();
