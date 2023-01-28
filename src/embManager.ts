import * as fs from 'fs'
import {createEmbeddings} from './openAiWrapper'
import {dot} from 'mathjs'

let  contextEmb: any  = {}
let  conversationsEmb: any[][] = [[]]
let  precentageOfContext: number  = 0.5
let precentageOfConversations: number = 0.3
let splitorForSplitContextAsSentence: string = "。"
let modelMaxTokens: number = 0
let maxTokenOfCompletationOutput: number = 200
let takeContextOnlySimilarityGoeTo: number =  0.83

function findSimilarity(x: number[], y: number[]) {
    return dot(x, y)
}

async function findTheRelatedSentences(content: string): Promise<string[]> {
    let contextMaxTokens = (modelMaxTokens - maxTokenOfCompletationOutput) * precentageOfContext;
    contextMaxTokens = parseInt(contextMaxTokens.toString())
    const embOfTheContent = await createEmbeddings(content)
    let similarityAndSentence: any = []
    similarityAndSentence = await Object.keys(contextEmb).reduce(async (rs, sentence) => {
        rs = await rs
        const embOfTheSentence = contextEmb[sentence]
        const similarity = findSimilarity(embOfTheContent, embOfTheSentence)
        rs.push([similarity, sentence])
        return rs
    }, similarityAndSentence)

    similarityAndSentence.sort((a: any, b: any) => {
        const similarityOfA = a[0]
        const similarityOfB = b[0]
        return (similarityOfA * 100) - (similarityOfB * 100)
    })
    const reversedSimilarityAndSentence  = similarityAndSentence.reverse()
    const relatedSentences :string[] = []
    let tokensCount = 0
    for(const [similarity, sentence] of reversedSimilarityAndSentence) {
        if(tokensCount + sentence.length  >= contextMaxTokens) {
            break
        }

        if(similarity >= takeContextOnlySimilarityGoeTo) {
            relatedSentences.push(sentence)
            tokensCount += sentence.length
        }
    }

    return relatedSentences
}

export async function getRelatedContext(content: string): Promise<string[]> {
    const sentences = await findTheRelatedSentences(content)
    return sentences
}

async function findRelatedConversations(maxTokens: number, contentEmb: number[], conversations: any[][]): Promise<any[]> {
    const relatedConversations =  conversationsEmb.reduce((rs, [emb, question, answer], index) => {
        const similarity = findSimilarity(emb, contentEmb)
        if(similarity >= takeContextOnlySimilarityGoeTo) {
            rs.push([index, question, answer])
            conversations[index] = [emb, question, answer, true]
        }
        return rs
    }, [])
    relatedConversations.sort((a, b) => {
        return a[0] - b[0]
    })

    const rs = []
    let tokensCount = 0
    for(const [_, question, answer] of relatedConversations) {
        if( (tokensCount + question.length + answer.length) >= maxTokens) {
            break
        }

        rs.push([question, answer])
        tokensCount += (question.length + answer.length)
    }

    return [rs, tokensCount]
}

async function getConversationsInOrder(maxTokens: number, conversations: any[][]): Promise<any[][]> {
    conversations.reverse()
    let tokensCount = 0
    const rs = []
    for(const [_, question, answer, usedBefore] of conversations) {
        if(usedBefore !== undefined) {
            continue
        }

        if(tokensCount + question.length + answer.length >= maxTokens) {
            break
        }

        rs.push([question, answer])
        tokensCount += (question.length + answer.length)
    }

    rs.reverse()
    return rs
}


export async function getRelatedConversations(content: string): Promise<string[][]> {
    const embOfTheContent = await createEmbeddings(content)
    let  maxTokens = (modelMaxTokens - maxTokenOfCompletationOutput) * precentageOfConversations
    maxTokens = parseInt(maxTokens.toString())
    const conversations = [...conversationsEmb]
    const [relatedConversations, tokensTaken] = await findRelatedConversations(maxTokens, embOfTheContent, conversations)
    const conversationsInOrder = await getConversationsInOrder(maxTokens - tokensTaken, conversations)
    relatedConversations.push(...conversationsInOrder)
    return relatedConversations
}

async function writeConversationsEmbToLocal() {
    fs.writeFileSync(pathOfConversationsEmb, JSON.stringify(conversationsEmb), {"encoding": 'utf-8'})
}

export async function storeTheNewConversation(question: string, answer: string):Promise<void> {
    const conversationInStr = question + answer
    const emb  =  await createEmbeddings(conversationInStr)
    conversationsEmb.push([emb, question, answer])
    if(conversationsEmb.length > 10) {
        conversationsEmb.shift()
    }
    await writeConversationsEmbToLocal()
}

const pathOfContext = "./context.txt"
async function loadContextAsSentences(): Promise<string[]> {
    const strs = fs.readFileSync(pathOfContext, {"encoding": 'utf-8'})
    const lines = strs.split('\n').filter((line) => {
        return line.trim().length !== 0
    })
    const sentences = lines.reduce((sentences: string[], line: String) => {
	const sentencesFromTheLine  = line.split(splitorForSplitContextAsSentence)
	sentences.push(...sentencesFromTheLine)
	return sentences
    }, [])
    return sentences
}


async function embeddingTheNewContext(embs: any): Promise<Object> {
    const sentences = await loadContextAsSentences()
    const unembeddingSentences =  sentences.filter((val) => {
        return embs[val] ===  undefined
    })
    let rs: any = {}
    rs = await unembeddingSentences.reduce(async (rs, sentence) => {
        const emb = await createEmbeddings(sentence)
        rs[sentence] = emb
        return rs
    },rs)
    return rs
}

const pathOfContextEmb = "./contextEmb.json"
async function writeContextEmbToLocal(embs: Object):Promise<void> {
    fs.writeFileSync(pathOfContextEmb, JSON.stringify(embs), {"encoding": 'utf-8'})
}

async function loadContextEmb():Promise<Object> {
    const embsInStr = fs.readFileSync(pathOfContextEmb, {"encoding": 'utf-8'})
    let embs = JSON.parse(embsInStr)
    const newEmbs =  await embeddingTheNewContext(embs)
    embs = Object.assign(embs, newEmbs)
    await writeContextEmbToLocal(embs)
    return Promise.resolve(embs)
}

const pathOfConversationsEmb = "./conversationsEmb.json"
async function loadConversationsEmb():Promise<any[][]> {
    const embInStr = fs.readFileSync(pathOfConversationsEmb, {"encoding": 'utf-8'})
    return Promise.resolve(JSON.parse(embInStr))
}

type ModelArgs  = {
    maxTokens: number
    outputMaxTokens: number
}

type ContextEmbArgs = {
    contextSentenceSplitor: string
    precentOfUsingContextInCompleation: number,
    useContextOnlySimilarityGreaterThanOrEqualTo: number
}


type ConversationsEmbArgs = {
    precentOfUsingConversationsInCompletaion: number
}

export async function init(modelArgs: ModelArgs, contextEmbArgs: ContextEmbArgs, conversationsEmbArgs: ConversationsEmbArgs) {
    precentageOfContext = contextEmbArgs.precentOfUsingContextInCompleation
    precentageOfConversations = conversationsEmbArgs.precentOfUsingConversationsInCompletaion
    splitorForSplitContextAsSentence = contextEmbArgs.contextSentenceSplitor
    contextEmb = await loadContextEmb()
    conversationsEmb = await loadConversationsEmb()
    modelMaxTokens = modelArgs.maxTokens
    maxTokenOfCompletationOutput = modelArgs.outputMaxTokens
    takeContextOnlySimilarityGoeTo = contextEmbArgs.useContextOnlySimilarityGreaterThanOrEqualTo
}
