export abstract class Configurable {
  abstract getRequiredEnvironmentVariables(): string[];
  abstract getConfig(): {};
}
