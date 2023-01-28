import { Configuration, OpenAIApi } from 'openai';
import { AxiosError } from 'axios';

let ai: OpenAIApi | undefined;
const embeddingModel = 'text-embedding-ada-002';
let completationModel = 'text-davinci-003';
let maxTokens: number = 200;

export async function createEmbeddings(content: string): Promise<any> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const rs = await ai?.createEmbedding({ model: embeddingModel, input: content, user: 'default' });
    return rs?.data.data[0].embedding;
  } catch (error) {
    const ex = error as AxiosError;
    const status = ex.response?.status;
    if (status === 429 || status === 502) {
      return await createEmbeddings(content);
    }

    throw error;
  }
}

export async function createCompletation(content: string): Promise<string> {
  const rs = await ai?.createCompletion({
    model: completationModel,
    prompt: content,
    max_tokens: maxTokens,
    stop: '\n',
  });
  if (rs?.data?.choices[0].text === undefined) {
    throw new Error('The response data is undefined');
  }

  return rs.data.choices[0].text;
}

export async function init(
  openAIKey: string,
  maxTokensOnCompletation: number,
  completationModelName: string,
): Promise<void> {
  const conf = new Configuration({ apiKey: openAIKey });
  ai = new OpenAIApi(conf);
  maxTokens = maxTokensOnCompletation;
  completationModel = completationModelName;
}
