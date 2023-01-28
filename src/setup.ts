import { init as embManagerInit } from './embManager';
import { init as openAiInit } from './openAiWrapper';

export async function setUp(
  apiKey: string,
  precentForContext: number,
  precentForConversations: number,
  promptOutputTokens: number,
  sentenceSplitorOfContext: string,
  completationModelMaxTokens: number,
  useContextOnlyTheSimilarityGoeTo: number,
  completationModelName: string,
) {
  await openAiInit(apiKey, promptOutputTokens, completationModelName);
  await embManagerInit(
    { maxTokens: completationModelMaxTokens, outputMaxTokens: promptOutputTokens },
    {
      contextSentenceSplitor: sentenceSplitorOfContext,
      precentOfUsingContextInCompleation: precentForContext,
      useContextOnlySimilarityGreaterThanOrEqualTo: useContextOnlyTheSimilarityGoeTo,
    },
    { precentOfUsingConversationsInCompletaion: precentForConversations },
  );
}
