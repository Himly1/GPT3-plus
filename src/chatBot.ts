import { createCompletation } from './openAiWrapper';
import { getRelatedContext, getRelatedConversations, storeTheNewConversation } from './embManager';

type ModifyTalkContentCallback = (
  orignalContent: string,
  relatedContext: string[],
  relatedConversations: string[][],
) => string;
export async function talk(content: string, callbackOfModifyContent: ModifyTalkContentCallback) {
  const context = await getRelatedContext(content);
  const conversations = await getRelatedConversations(content);
  let finalContent = callbackOfModifyContent(content, context, conversations);
  const response = await createCompletation(finalContent);
  storeTheNewConversation(content, response);
  return response;
}
