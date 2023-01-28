# GPT3-plus
> A powerful package that uses the GPT-3 API and overcomes its limitations by incorporating memory and fine-tuning with custom data for improved language understanding and personalisation.


# Why GPT3-plus?
> first at the current state of OpenAI GPT3 API does not have "memory", secondly without `fine-tuning` there is no way to customise the GPT3 model, which means you cannot let the API response based on your context or "dataset" and the "fine-tuning" is some kind of art to us normies, its hard and expensive to us to "fine-tune" a Model to meet the requirements, with this package the two problems mentioned above are solved.


# How?
> At current state of OpenAI GPT3 API the prompt maxTokens was limited, which mean you cannot put all the context or the dataset and conversations to the prompt.
So the dataset and the conversations will be convert to Embeddings and then when you ask a question to the API, this package will automatically find the related context or the conversations then add it to the prompt, this way the API will know what is the context and the historic conversations then it is able to answer based on the context and the conversations.

# Useage
