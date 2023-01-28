import {Configuration, OpenAIApi}  from 'openai'


let ai:OpenAIApi | undefined = undefined
const embeddingModel = "text-embedding-ada-002"
const completationModel = "text-davinci-003"
let maxTokens: number =  200

export async function createEmbeddings(content: string): Promise<any> {
    Promise.resolve(setTimeout(() => { 
    }, 1000))
    const rs  = await ai?.createEmbedding({"model": embeddingModel, 'input': content, "user": "default"})
    return  rs?.data.data[0].embedding
}

export async function createCompletation(content: string): Promise<string> {
    const rs = await ai?.createCompletion({
	"model": completationModel,
	"prompt": content,
	"max_tokens": maxTokens,
	"stop": '\n'
    })
    if(rs?.data?.choices[0].text === undefined) {
	throw "The response data is undefined"
    }
    
   return rs.data.choices[0].text
}

export async function init(openAIKey: string, maxTokensOnCompletation: number): Promise<void> {
    const conf = new Configuration({"apiKey": openAIKey})
    ai = new OpenAIApi(conf)
    maxTokens = maxTokensOnCompletation
}
