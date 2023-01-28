# GPT3-plus
> A powerful package that uses the GPT-3 API and overcomes its limitations by incorporating memory and fine-tuning with custom data for improved language understanding and personalisation.


# Why GPT3-plus?
> First at the current state of OpenAI GPT3 API does not have "memory", secondly without `fine-tuning` there is no way to customise the GPT3 model, which means you cannot let the API response based on your context or "dataset" and the "fine-tuning" is some kind of art to us normies, its hard and expensive to us to "fine-tune" a Model to meet the requirements, with this package the two problems mentioned above are solved.


# How?
> At current state of OpenAI GPT3 API the prompt max tokens was limited, which mean you cannot put all the context or the dataset and conversations to the prompt.
So with this package the dataset and the conversations will be convert to Embeddings and then when you ask a question to the API, this package will automatically find the related context or the conversations then add it to the prompt, this way the API will know what is the context and the historic conversations then it is able to answer based on the context and the conversations.

# Useage
Install the package with NPM

``` npm i gpt3_plus ```

Simple usage
```
import {Gpt3Plus, Templates} from "gpt3_plus"

async function test() {
  const apiKey = "########"
  const gpt3 = new Gpt3Plus()
  await gpt3.init({
		"apiKey": apiKey,
		"completationMOdelMaxTokens": 4000,
		"completationModelName": "text-davinci-003",
		"contextSentenceSplitor": "\n",
		"precentForContext": 0.5,
		"precentForConversations": 0.3,
		"promptOutputTokens": 200,
		"useEmbeddingsOnlyTheCorrelationGreaterThanOrEqualTo": 0.83
		})

   const rs = await gpt3.talk("Hi, there, What do you think about zhengMa?", Templates.default)
   console.log(`${rs}`)
}

test()
```
The output of above code without any content is 
```
I'm not too familiar with ZhengMa, but I'm open to learning more about it. Can you tell me more about it?
```

Here is the content in the `context.txt` file representing the context or the dataset:
```
zhengMa, who Living for tens of thousands of years and never being born
zhengMa, a liar who always speaking truth
```
Here is the output with same quetsion:

```  I think zhengMa is a unique individual who is quite remarkable. He is an enigmatic character who has managed to live for tens of thousands of years and never been born, that is truly remarkable. I am fascinated and impressed by his intriguing story.  ```

## How do I add new context?
> its simple you need to create a txt file called "context.txt" at your project root folder, then you can add whatever you want.

## Do I need to care about the conversations?
> No, you dont need to, because the conversations is handled by the package under the hood

## Can I modify the template?
> Sure, the `template` is a function which receive `orignalContent`, `relatedContext`, `relatedConversations`, You can use those arguments to reduce a new template as string then return it to the package.

# Gpt3 init function parameters desc:
### completationModelName
>openAI completation Model

### apiKey
> openAI API key

### precentForContext
> OpenAI completation API has limited the max tokens, so, you cannot put whole context to the prompt therefore you need to specify the precent of the context should be used at every prompt.

### precentForConversations
> OpenAI completation API has limited the max tokens, so, you cannot put whole conversations to the prompt therefore you need to specify the precent of the conversations should be used at every prompt.

### promptOutputTokens
> prompt output max tokens, same as the `max_tokens`

### contextSentenceSplitor
> The content in the `context.txt` file will be splited to sentence therefore you need to specify the splitor to split the line as sentence, its better to write the context in sentence line by line, then specify the value of  `contextSentenceSplitor` as '\n'

### completationMOdelMaxTokens
> MaxTokens of the model, the `text-davinci-003` model was limited the maxTokens to 4000

### useEmbeddingsOnlyTheCorrelationGreaterThanOrEqualTo
> If you got lot of context or the conversations, as I saied before, you cant put whole context or converstaions to the prompt therefore first this package will findout the correlation value of each sentence from the context or the conversations and the value is between 0.0 - 1.0, you need to specify the value to let this package to choose the sentences or the converstaions.
