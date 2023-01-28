import { setUp } from './setup'
import { talk as talkToAPI } from './chatBot'

export type Template = (orginalContext: string, relatedContext: string[], relatedConversations: string[][]) => string

const textTemplates = {
    "default": `Answer the question as truthfully as possible using the provided Context and Conversations log, and if the answer is not contained within the text below, Please respond in as polite and interesting a manner as possible.The contents of Conversations-log is a two-dimensional array structure representing historical conversations,the element order represent the order of the conversations.

Context:
###Context

Conversations-log
###conversations

Q: ###Question
`
}

export const templates = {
    "default": (originalContext: string, relatedContext: string[], relatedConversations: string[][]) => {
        const template = textTemplates.default
        let finalContent = template.replace("###Context", relatedContext.join('\n'))
        finalContent = finalContent.replace("###Question", originalContext)
        finalContent = finalContent.replace("###conversations", JSON.stringify({
            "description": "Conversation log with questions and answers in order",
            "data": relatedConversations
        }))
        return finalContent
    }
}

export class gpt3Plus {
    constructor(apiKey: string, precentForContext: number, precentForConversations: number, promptOutputTokens: number, contextSentenceSplitor: string, completationModelMaxTokens: number, useContextOnlyTheSimilarityGreaterThanOrEqualTo: number) {
        (async () => {
            await setUp(apiKey, precentForContext, precentForConversations, promptOutputTokens, contextSentenceSplitor, completationModelMaxTokens, useContextOnlyTheSimilarityGreaterThanOrEqualTo)
        })
    }

    async talk(content: string, template: Template): Promise<string> {
        return await talkToAPI(content, template)
    }
}
