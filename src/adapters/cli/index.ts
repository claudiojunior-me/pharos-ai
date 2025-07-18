import 'reflect-metadata';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { container } from 'tsyringe';

import 'reflect-metadata';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { container } from 'tsyringe';

import { ICliService } from '../../application/ports/ICliService';
import { IArticleRepository } from '../../application/ports/IArticleRepository';
import { ExportContentUseCase } from '../../application/usecases/ExportContentUseCase';
import { JsonArticleRepository } from '../../adapters/driven/JsonArticleRepository';
import { IAuthenticationService } from '../../application/ports/IAuthenticationService';
import { MediumAuthenticationAdapter } from '../../adapters/driven/MediumAuthenticationAdapter';
import { IArticleContentService } from '../../application/ports/IArticleContentService';
import { MediumScraper } from '../../adapters/driven/MediumScraper';
import { ITaggingService } from '../../application/ports/ITaggingService';
import { AiTaggingAdapter } from '../../adapters/driven/ai/AiTaggingAdapter';
import { IEmailService } from '../../application/ports/IEmailService';
import { NodemailerEmailAdapter } from '../../adapters/driven/email/NodemailerEmailAdapter';
import { IMarkdownConverter } from '../../application/ports/IMarkdownConverter';
import { TurndownMarkdownAdapter } from '../../adapters/driven/TurndownMarkdownAdapter';
import { ITranslationService } from '../../application/ports/ITranslationService';
import { GoogleTranslateAdapter } from '../../adapters/driven/GoogleTranslateAdapter';
import { ISummarizationService } from '../../application/ports/ISummarizationService';
import { LLMSummarizationAdapter } from '../../adapters/driven/LLMSummarizationAdapter';
import { ITagCommand } from '../../application/ports/ITagCommand';
import { TagCommand } from '../../commands/TagCommand';

container.register<IArticleRepository>('IArticleRepository', {
  useClass: JsonArticleRepository,
});

container.register<IAuthenticationService>('IAuthenticationService', {
  useClass: MediumAuthenticationAdapter,
});

container.register<IArticleContentService>('IArticleContentService', {
  useClass: MediumScraper,
});

container.register<ITaggingService>('ITaggingService', {
  useClass: AiTaggingAdapter,
});

container.register<IEmailService>('IEmailService', {
  useClass: NodemailerEmailAdapter,
});

container.register<IMarkdownConverter>('IMarkdownConverter', {
  useClass: TurndownMarkdownAdapter,
});

container.register<ITranslationService>('ITranslationService', {
  useClass: GoogleTranslateAdapter,
});

container.register<ISummarizationService>('ISummarizationService', {
  useClass: LLMSummarizationAdapter,
});

container.register<ITagCommand>('ITagCommand', {
  useClass: TagCommand,
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
      const tagCommand = container.resolve<ITagCommand>('ITagCommand');
      await tagCommand.execute(argv.source as string, argv.destination as string);
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
