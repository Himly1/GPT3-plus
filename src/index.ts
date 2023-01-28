import { setUp } from './setup'
import { talk } from './chatBot'
import inquirer from 'inquirer'


const template = `Answer the question as truthfully as possible using the provided Context and Conversations log, and if the answer is not contained within the text below, Please respond in as polite and interesting a manner as possible.The contents of Conversations-log is a two-dimensional array structure representing historical conversations,the element order represent the order of the conversations.

Context:
###Context

Conversations-log
###conversations

Q: ###Question
A:`

const apiKey = "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"
async function main() {
    await setUp(apiKey, 0.5, 0.4, 300, '。', 4000, 0.75)
    while (true) {
        try {
            const question = await inquirer.prompt([{
                "type": 'input',
                "name": "question",
                "message": "Question:"
            }]).then(answers => {
                return answers.question
            })
            const rs = await talk(question, (originalContent, context, conversations) => {
                let finalContent = template.replace("###Context", context.join('\n'))
                finalContent = finalContent.replace("###Question", originalContent)
                finalContent = finalContent.replace("###conversations", JSON.stringify({
                    "description": "Conversation log with questions and answers in order",
                    "data": conversations
                }))
                return finalContent
            })
            console.log(rs)
        } catch (ex) {
            console.log(`发生错误，错误信息: ${ex}`)
        }
    }
}

main()

export class gpt3Plus {
    constructor(apiKey: string, precentForContext: number, precentForConversations: number, promptOutputTokens: number, contextSentenceSplitor:string, completationModelMaxTokens: number, useContextOnlyTheSimilarityGreaterThanOrEqualTo: number) {
        (async () => {
            await setUp(apiKey, precentForContext, precentForConversations, promptOutputTokens, contextSentenceSplitor, completationModelMaxTokens, useContextOnlyTheSimilarityGreaterThanOrEqualTo)
        })
    }

    async talk(content: string): Promise<string> {
       return ""
    }
}
