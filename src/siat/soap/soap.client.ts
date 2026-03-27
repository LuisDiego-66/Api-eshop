import * as soap from 'soap';

export class SoapClient {
  private client: soap.Client;

  constructor(
    private readonly wsdl: string,
    private readonly apiKey: string,
  ) {}

  private async init() {
    if (this.client) return;

    this.client = await soap.createClientAsync(this.wsdl);

    this.client.addHttpHeader('ApiKey', `TokenApi ${this.apiKey}`);
  }

  async call<T = any>(method: string, args: any): Promise<T> {
    await this.init();

    const fn = (this.client as any)[`${method}Async`];
    if (!fn) {
      throw new Error(`Método SOAP no encontrado: ${method}`);
    }

    const [result] = await fn(args);
    return result;
  }
}
