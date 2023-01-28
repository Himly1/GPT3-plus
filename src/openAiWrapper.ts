import { Configuration, OpenAIApi } from 'openai'


let ai: OpenAIApi | undefined = undefined
const embeddingModel = "text-embedding-ada-002"
let completationModel = "text-davinci-003"
let maxTokens: number = 200

export async function createEmbeddings(content: string): Promise<any> {
    Promise.resolve(setTimeout(() => {
    }, 1000))
    try {
        const rs = await ai?.createEmbedding({ 'model': embeddingModel, "input": content, 'user': 'default' })
        return rs?.data.data[0].embedding
    } catch (error) {
        console.error(`Error occurred while embedding the content. The content is ${content}, The error is ${error}`)
        if (error.response) {
            if(error.response.status === 429) {
                await Promise.resolve(setTimeout(() => {
                    
                }, 2000))
                return await createEmbeddings(content)
            }

            throw error
        }
    }
}

export async function createCompletation(content: string): Promise<string> {
    const rs = await ai?.createCompletion({
        "model": completationModel,
        "prompt": content,
        "max_tokens": maxTokens,
        "stop": '\n'
    })
    if (rs?.data?.choices[0].text === undefined) {
        throw "The response data is undefined"
    }

    return rs.data.choices[0].text
}

export async function init(openAIKey: string, maxTokensOnCompletation: number, completationModelName: string): Promise<void> {
    const conf = new Configuration({ "apiKey": openAIKey })
    ai = new OpenAIApi(conf)
    maxTokens = maxTokensOnCompletation
    completationModel = completationModelName
}
